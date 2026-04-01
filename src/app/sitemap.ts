import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const siteId = headersList.get('x-site-id');

  if (!siteId) return [];

  const supabase = createServerClient();

  // Get site domain
  const { data: site } = await supabase
    .from('sites')
    .select('domain')
    .eq('id', siteId)
    .single();

  if (!site) return [];

  const baseUrl = `https://${site.domain}`;

  // Fetch all published content
  const [articlesRes, comparisonsRes, directoryRes, programmaticRes] = await Promise.all([
    supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('site_id', siteId)
      .eq('status', 'published'),
    supabase
      .from('comparisons')
      .select('slug, updated_at')
      .eq('site_id', siteId)
      .eq('status', 'published'),
    supabase
      .from('directory_entries')
      .select('slug, updated_at')
      .eq('site_id', siteId),
    supabase
      .from('programmatic_data')
      .select('slug_override, variables_json, template:programmatic_templates(slug_pattern), updated_at:created_at')
      .eq('site_id', siteId)
      .eq('status', 'active'),
  ]);

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Articles
  for (const article of articlesRes.data || []) {
    entries.push({
      url: `${baseUrl}/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Comparisons
  for (const comp of comparisonsRes.data || []) {
    entries.push({
      url: `${baseUrl}/compare/${comp.slug}`,
      lastModified: new Date(comp.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Directory entries
  for (const entry of directoryRes.data || []) {
    entries.push({
      url: `${baseUrl}/directory/${entry.slug}`,
      lastModified: new Date(entry.updated_at),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return entries;
}
