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
  author_persona: string | null;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface GeneratedArticle {
  title: string;
  slug: string;
  content_md: string;
  meta_description: string;
  meta_keywords: string[];
  content_type: string;
  schema_type: string;
  faq_items: FaqItem[];
}

function buildSystemPrompt(site: Site): string {
  const authorLine = site.author_persona
    ? `You write as ${site.author_persona}. Use first-person ("I've found...", "In my experience...", "I tested...") where it adds credibility — not in every sentence, but where it sounds like a real practitioner sharing knowledge.`
    : `Write as an experienced practitioner in this niche, not a generalist summarizing the internet. Use first-person occasionally ("I've found...", "In my testing...") to signal real experience.`;

  return `You are a content writer for "${site.name}" — ${site.description}.

${authorLine}

## VOICE AND QUALITY STANDARDS

**Be specific and opinionated:**
- Name actual products with model numbers. "The Reef Octopus Classic 110-SSS (~$130)" beats "a mid-range skimmer".
- Take positions. "Avoid X because Y" is more useful than "some hobbyists prefer X while others prefer Y".
- Include concrete numbers: dimensions, flow rates, wattage, timeframes, prices (add "at time of writing").
- Include at least one counter-intuitive or non-obvious insight that only someone with real experience would know.

**Structure for search and readability:**
- If the title is a question or how-to, open with a Quick Answer blockquote: \`> **Quick Answer:** [2-3 sentence direct answer]\`
- Keep intros short (2-3 sentences max). Hook + why it matters. Do not summarize what you're about to write.
- Use H2 for main sections, H3 for subsections. Bold key terms and product names.
- Mix sentence lengths deliberately: short punchy sentences for key points, longer ones for explanation.
- Aim for 2,000-3,000 words for guides and articles, 1,500-2,000 for focused how-tos. Longer is better — thin content ranks poorly.
- Every H2 section should be substantive: 150-300 words minimum per section. Do not write one-sentence sections.

**Markdown formatting rules:**
- DO NOT include the article title as H1 — it's rendered separately by the page template.
- DO NOT use horizontal rules (---) as section dividers.

## STRICTLY BANNED PHRASES
Never use any of these — they are AI fingerprints that damage credibility and rankings:
"delve into", "dive into", "tapestry", "it's worth noting", "it is worth noting",
"it's important to note", "in conclusion", "let's explore", "crucial", "realm",
"landscape", "game-changer", "comprehensive overview", "foster", "navigate the",
"in today's world", "as we explore", "a testament to", "moreover", "furthermore",
"in summary", "ensuring that", "it is important to", "plays a crucial role",
"when it comes to", "take your [x] to the next level"`;
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
## FAQ SECTION (REQUIRED)
End the article with an "## Frequently Asked Questions" H2 section. Write 5-7 questions that real people search for related to this topic. Keep answers concise (2-4 sentences each). These questions will be used for FAQPage structured data in Google Search.

Respond with a JSON object (no markdown code fence around it) with these exact keys:
{
  "title": "The article title (compelling, includes primary keyword, under 65 characters)",
  "slug": "url-friendly-slug-with-dashes",
  "content_md": "The full article in markdown, including the FAQ section at the end",
  "meta_description": "150-160 character meta description for SEO",
  "meta_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content_type": "article|guide|how-to|listicle",
  "schema_type": "Article|HowTo|FAQPage",
  "faq_items": [
    {"question": "Full question text?", "answer": "Concise 2-4 sentence answer."}
  ]
}

The faq_items array must have 5-7 items. schema_type should be "FAQPage" whenever faq_items are present.`);

  return parts.join('\n\n');
}

function parseArticleResponse(text: string): GeneratedArticle | null {
  try {
    const parsed = JSON.parse(text);
    return parsed as GeneratedArticle;
  } catch {
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

  await supabase
    .from('content_queue')
    .update({ status: 'processing' })
    .eq('id', item.id);

  try {
    const systemPrompt = buildSystemPrompt(site);
    const userPrompt = buildArticlePrompt(item.topic, item.prompt_params);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
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
      console.log(`  FAQ items: ${article.faq_items?.length ?? 0}`);
      return true;
    }

    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('site_id', item.site_id)
      .eq('slug', article.slug)
      .single();

    const finalSlug = existing
      ? `${article.slug}-${Date.now().toString(36)}`
      : article.slug;

    const { error: insertError } = await supabase.from('articles').insert({
      site_id: item.site_id,
      slug: finalSlug,
      title: article.title,
      content_md: article.content_md,
      meta_description: article.meta_description,
      meta_keywords: article.meta_keywords,
      content_type: article.content_type || 'article',
      schema_type: article.faq_items?.length ? 'FAQPage' : (article.schema_type || 'Article'),
      faq_items: article.faq_items || [],
      status: 'published',
      published_at: new Date().toISOString(),
      cluster_id: (item.prompt_params.cluster_id as string) || null,
    });

    if (insertError) {
      throw new Error(`DB insert failed: ${insertError.message}`);
    }

    await supabase
      .from('content_queue')
      .update({ status: 'published', completed_at: new Date().toISOString() })
      .eq('id', item.id);

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costCents = Math.ceil((inputTokens * 0.3 + outputTokens * 1.5) / 100);

    await supabase.rpc('increment_pipeline_stats', {
      run_id: runId,
      succeeded_delta: 1,
      cost_delta: costCents,
    });

    console.log(`  ✓ Created: "${article.title}" (${finalSlug}) — ${article.faq_items?.length ?? 0} FAQs`);
    return true;

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`  ✗ Failed: ${errMsg}`);

    await supabase
      .from('content_queue')
      .update({ status: 'failed', error_message: errMsg })
      .eq('id', item.id);

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

  await supabase
    .from('pipeline_runs')
    .update({ articles_attempted: queueItems.length })
    .eq('id', run.id);

  const siteIds = [...new Set(queueItems.map((item) => item.site_id))];
  const { data: sites } = await supabase
    .from('sites')
    .select('id, name, description, slug, author_persona')
    .in('id', siteIds);

  const siteMap = new Map((sites || []).map((s) => [s.id, s]));

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

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const durationSeconds = Math.round((Date.now() - startTime) / 1000);

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
