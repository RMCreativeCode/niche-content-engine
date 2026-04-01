import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const siteId = headersList.get('x-site-id');

  if (!siteId) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  const supabase = createServerClient();
  const { data: site } = await supabase
    .from('sites')
    .select('domain')
    .eq('id', siteId)
    .single();

  const baseUrl = site ? `https://${site.domain}` : '';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
