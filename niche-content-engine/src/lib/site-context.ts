import { createServerClient } from './supabase/server';
import { Site } from '@/types/database';
import { headers } from 'next/headers';

// Cache site lookups for the duration of a request
const siteCache = new Map<string, Site | null>();

export async function getCurrentSite(): Promise<Site | null> {
  const headersList = await headers();
  const siteId = headersList.get('x-site-id');
  const hostname = headersList.get('x-hostname');

  if (!siteId && !hostname) return null;

  const cacheKey = siteId || hostname || '';
  if (siteCache.has(cacheKey)) return siteCache.get(cacheKey)!;

  const supabase = createServerClient();

  if (siteId) {
    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('status', 'active')
      .single();
    siteCache.set(cacheKey, data);
    return data;
  }

  if (hostname) {
    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('domain', hostname)
      .eq('status', 'active')
      .single();
    siteCache.set(cacheKey, data);
    return data;
  }

  return null;
}

export function getSiteThemeVars(site: Site): Record<string, string> {
  const theme = site.theme_config;
  return {
    '--color-primary': theme.primaryColor,
    '--color-accent': theme.accentColor,
    '--font-family': theme.fontFamily,
  };
}
