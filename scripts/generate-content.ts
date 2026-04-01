#!/usr/bin/env npx tsx

/**
 * Content Pipeline — generates articles from the content_queue table.
 *
 * Designed to run as a GitHub Actions cron job or locally via `npx tsx scripts/generate-content.ts`
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 *
 * Optional:
 *   BATCH_SIZE — max items to process per run (default: 20)
 *   DRY_RUN — if "true", skips writing to DB and prints output
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicKey = process.env.ANTHROPIC_API_KEY!;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '20', 10);
const DRY_RUN = process.env.DRY_RUN === 'true';

if (!supabaseUrl || !supabaseKey || !anthropicKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const anthropic = new Anthropic({ apiKey: anthropicKey });

interface QueueItem {
  id: string;
  site_id: string;
  content_type: string;
  topic: string;
  prompt_params: Record<string, unknown>;
  status: string;
}

interface Site {
  id: string;
  name: string;
  description: string;
  slug: string;
}

interface GeneratedArticle {
  title: string;
  slug: string;
  content_md: string;
  meta_description: string;
  meta_keywords: string[];
  content_type: string;
  schema_type: string;
}

function buildSystemPrompt(site: Site): string {
  return `You are an expert content writer for "${site.name}" — ${site.description}.

Your job is to write high-quality, SEO-optimized articles that are genuinely helpful to readers. Follow these rules:

1. Write in a knowledgeable but approachable tone. You're an expert talking to an enthusiast.
2. Use markdown formatting: H2 and H3 headings, bullet lists where appropriate, bold for emphasis.
3. Include practical, actionable advice — not just general information.
4. Naturally mention specific products, brands, or tools where relevant (these will have affiliate links added later).
5. Aim for 1,200-2,000 words for standard articles, 800-1,200 for focused how-tos.
6. Include a brief intro paragraph and a conclusion/summary section.
7. DO NOT include the article title as an H1 — it's rendered separately.
8. DO NOT include "In this article..." or "Let's dive in" filler phrases.
9. Vary your sentence structure and paragraph length. Avoid being formulaic.
10. If the topic involves safety considerations, always include them.`;
}

function buildArticlePrompt(topic: string, params: Record<string, unknown>): string {
  const parts = [`Write a comprehensive article about: ${topic}`];

  if (params.content_type) {
    parts.push(`Content type: ${params.content_type}`);
  }
  if (params.target_keywords) {
    parts.push(`Target keywords to naturally include: ${(params.target_keywords as string[]).join(', ')}`);
  }
  if (params.audience) {
    parts.push(`Target audience: ${params.audience}`);
  }
  if (params.angle) {
    parts.push(`Specific angle or focus: ${params.angle}`);
  }
  if (params.include_sections) {
    parts.push(`Must include sections on: ${(params.include_sections as string[]).join(', ')}`);
  }

  parts.push(`
Respond with a JSON object (no markdown code fence around it) with these exact keys:
{
  "title": "The article title (compelling, includes primary keyword)",
  "slug": "url-friendly-slug-with-dashes",
  "content_md": "The full article in markdown",
  "meta_description": "150-160 character meta description for SEO",
  "meta_keywords": ["keyword1", "keyword2", "keyword3"],
  "content_type": "article|guide|how-to|listicle",
  "schema_type": "Article|HowTo|FAQPage"
}`);

  return parts.join('\n\n');
}

function parseArticleResponse(text: string): GeneratedArticle | null {
  try {
    // Try to parse the entire response as JSON
    const parsed = JSON.parse(text);
    return parsed as GeneratedArticle;
  } catch {
    // Try to extract JSON from the response (Claude sometimes wraps it)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as GeneratedArticle;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function processQueueItem(item: QueueItem, site: Site, runId: string): Promise<boolean> {
  console.log(`  Processing: "${item.topic}" for ${site.name}`);

  // Mark as processing
  await supabase
    .from('content_queue')
    .update({ status: 'processing' })
    .eq('id', item.id);

  try {
    const systemPrompt = buildSystemPrompt(site);
    const userPrompt = buildArticlePrompt(item.topic, item.prompt_params);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    const article = parseArticleResponse(responseText);

    if (!article) {
      throw new Error('Failed to parse article from Claude response');
    }

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would write article: "${article.title}"`);
      console.log(`  Slug: ${article.slug}`);
      console.log(`  Words: ~${article.content_md.split(/\s+/).length}`);
      return true;
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('site_id', item.site_id)
      .eq('slug', article.slug)
      .single();

    const finalSlug = existing
      ? `${article.slug}-${Date.now().toString(36)}`
      : article.slug;

    // Write to articles table
    const { error: insertError } = await supabase.from('articles').insert({
      site_id: item.site_id,
      slug: finalSlug,
      title: article.title,
      content_md: article.content_md,
      meta_description: article.meta_description,
      meta_keywords: article.meta_keywords,
      content_type: article.content_type || 'article',
      schema_type: article.schema_type || 'Article',
      status: 'review', // Goes to review, not directly published
      cluster_id: (item.prompt_params.cluster_id as string) || null,
    });

    if (insertError) {
      throw new Error(`DB insert failed: ${insertError.message}`);
    }

    // Mark queue item as published
    await supabase
      .from('content_queue')
      .update({ status: 'published', completed_at: new Date().toISOString() })
      .eq('id', item.id);

    // Calculate approximate cost (Claude Sonnet input/output pricing)
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    // Sonnet: $3/M input, $15/M output (approximate)
    const costCents = Math.ceil((inputTokens * 0.3 + outputTokens * 1.5) / 100);

    // Update pipeline run stats
    await supabase.rpc('increment_pipeline_stats', {
      run_id: runId,
      succeeded_delta: 1,
      cost_delta: costCents,
    });

    console.log(`  ✓ Created: "${article.title}" (${finalSlug})`);
    return true;

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`  ✗ Failed: ${errMsg}`);

    await supabase
      .from('content_queue')
      .update({ status: 'failed', error_message: errMsg })
      .eq('id', item.id);

    // Update pipeline run failure count
    await supabase.rpc('increment_pipeline_stats', {
      run_id: runId,
      failed_delta: 1,
      cost_delta: 0,
    });

    return false;
  }
}

async function main() {
  console.log(`\n🚀 Content Pipeline — ${new Date().toISOString()}`);
  console.log(`Batch size: ${BATCH_SIZE} | Dry run: ${DRY_RUN}\n`);

  // Create a pipeline run record
  const { data: run, error: runError } = await supabase
    .from('pipeline_runs')
    .insert({ status: 'running' })
    .select('id')
    .single();

  if (runError || !run) {
    console.error('Failed to create pipeline run:', runError);
    process.exit(1);
  }

  const startTime = Date.now();

  // Fetch pending queue items
  const { data: queueItems, error: fetchError } = await supabase
    .from('content_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error('Failed to fetch queue:', fetchError);
    await supabase
      .from('pipeline_runs')
      .update({ status: 'failed', error_message: fetchError.message, completed_at: new Date().toISOString() })
      .eq('id', run.id);
    process.exit(1);
  }

  if (!queueItems || queueItems.length === 0) {
    console.log('No pending items in queue. Exiting.');
    await supabase
      .from('pipeline_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: 0,
        articles_attempted: 0,
      })
      .eq('id', run.id);
    process.exit(0);
  }

  console.log(`Found ${queueItems.length} items to process\n`);

  // Update attempted count
  await supabase
    .from('pipeline_runs')
    .update({ articles_attempted: queueItems.length })
    .eq('id', run.id);

  // Group items by site_id and prefetch site data
  const siteIds = [...new Set(queueItems.map((item) => item.site_id))];
  const { data: sites } = await supabase
    .from('sites')
    .select('id, name, description, slug')
    .in('id', siteIds);

  const siteMap = new Map((sites || []).map((s) => [s.id, s]));

  // Process items sequentially (to avoid rate limits)
  let succeeded = 0;
  let failed = 0;

  for (const item of queueItems) {
    const site = siteMap.get(item.site_id);
    if (!site) {
      console.error(`  ✗ Site not found for item ${item.id}`);
      failed++;
      continue;
    }

    const success = await processQueueItem(item as QueueItem, site as Site, run.id);
    if (success) succeeded++;
    else failed++;

    // Small delay between API calls to be respectful
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const durationSeconds = Math.round((Date.now() - startTime) / 1000);

  // Finalize pipeline run
  await supabase
    .from('pipeline_runs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      articles_succeeded: succeeded,
      articles_failed: failed,
      duration_seconds: durationSeconds,
    })
    .eq('id', run.id);

  console.log(`\n✅ Pipeline complete: ${succeeded} succeeded, ${failed} failed (${durationSeconds}s)`);
}

main().catch((err) => {
  console.error('Pipeline crashed:', err);
  process.exit(1);
});
