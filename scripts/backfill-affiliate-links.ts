#!/usr/bin/env npx tsx

/**
 * One-time backfill: finds published articles with no related_products,
 * asks Claude Haiku to extract product mentions + ASINs, then updates the DB.
 *
 * Run from repo root:
 *   npx tsx scripts/backfill-affiliate-links.ts
 *
 * Set DRY_RUN=true to preview without writing:
 *   DRY_RUN=true npx tsx scripts/backfill-affiliate-links.ts
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local for local development (CI sets env vars directly)
try {
  const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch { /* no .env.local present, env vars expected from environment */ }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicKey = process.env.ANTHROPIC_API_KEY!;
const AMAZON_ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || '';
const DRY_RUN = process.env.DRY_RUN === 'true';

if (!supabaseUrl || !supabaseKey || !anthropicKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const anthropic = new Anthropic({ apiKey: anthropicKey });

interface RelatedProduct {
  name: string;
  asin: string;
  affiliate_url: string;
}

function buildAffiliateUrl(name: string): string {
  const query = encodeURIComponent(name.trim());
  return AMAZON_ASSOCIATE_TAG
    ? `https://www.amazon.com/s?k=${query}&tag=${AMAZON_ASSOCIATE_TAG}`
    : `https://www.amazon.com/s?k=${query}`;
}

async function extractProducts(
  title: string,
  contentMd: string
): Promise<RelatedProduct[]> {
  // Truncate content to keep token usage low — first 3000 chars is enough to
  // identify product mentions without paying for the full article body.
  const excerpt = contentMd.slice(0, 3000);

  const prompt = `You are helping populate Amazon affiliate links for a niche content website.

Article title: "${title}"

Article excerpt:
${excerpt}

Identify up to 4 specific purchasable products mentioned by brand and model number in this article.
Return an empty array if no specific purchasable products are named.

Return ONLY a valid JSON array, no other text:
[
  {"name": "Brand Model Name"}
]`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  try {
    const match = text.match(/\[[\s\S]*\]/);
    const raw: Array<{ name: string; asin: string }> = JSON.parse(
      match ? match[0] : text
    );
    return raw
      .filter((p) => p.name?.trim())
      .slice(0, 4)
      .map((p) => ({
        name: p.name.trim(),
        affiliate_url: buildAffiliateUrl(p.name),
      }));
  } catch {
    return [];
  }
}

async function main() {
  console.log(`\n🔗 Affiliate Link Backfill — ${new Date().toISOString()}`);
  console.log(`Associate tag: ${AMAZON_ASSOCIATE_TAG || '(none — links will have no tag)'}`);
  console.log(`Dry run: ${DRY_RUN}\n`);

  // Fetch all published articles where related_products is empty
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, site_id, title, content_md, related_products')
    .eq('status', 'published')
    .eq('related_products', '[]');

  if (error) {
    console.error('Failed to fetch articles:', error.message);
    process.exit(1);
  }

  if (!articles?.length) {
    console.log('No articles need backfilling. All done.');
    return;
  }

  console.log(`Found ${articles.length} articles to backfill\n`);

  let updated = 0;
  let skipped = 0;

  for (const article of articles) {
    process.stdout.write(`  "${article.title}" … `);

    try {
      const products = await extractProducts(article.title, article.content_md);

      if (products.length === 0) {
        console.log('no products found, skipping');
        skipped++;
      } else {
        console.log(
          `found ${products.length}: ${products.map((p) => `${p.name} (${p.asin})`).join(', ')}`
        );

        if (!DRY_RUN) {
          const { error: updateError } = await supabase
            .from('articles')
            .update({ related_products: products })
            .eq('id', article.id);

          if (updateError) {
            console.error(`    ✗ DB update failed: ${updateError.message}`);
          } else {
            updated++;
          }
        } else {
          updated++;
        }
      }
    } catch (err) {
      console.error(`\n    ✗ Error: ${err instanceof Error ? err.message : String(err)}`);
      skipped++;
    }

    // Small delay to avoid rate-limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(
    `\n✅ Done: ${updated} updated, ${skipped} skipped (no products found)${DRY_RUN ? ' [DRY RUN]' : ''}`
  );
}

main().catch((err) => {
  console.error('Backfill crashed:', err);
  process.exit(1);
});
