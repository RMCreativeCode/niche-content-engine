import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Dynamic — resolves site from host header directly (middleware skips .png routes)
export const dynamic = 'force-dynamic';

export default async function Icon() {
  // Read host directly — middleware doesn't run for .png routes so we can't
  // rely on x-site-id / x-hostname headers being set
  const headersList = await headers();
  const rawHost = headersList.get('host')?.split(':')[0] ?? '';
  const hostname = rawHost.startsWith('www.') ? rawHost.slice(4) : rawHost;

  let site = null;
  if (hostname) {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('sites')
      .select('name, theme_config')
      .eq('domain', hostname)
      .eq('status', 'active')
      .single();
    site = data;
  }

  const primary = site?.theme_config?.primaryColor ?? '#0ea5e9';
  const accent = site?.theme_config?.accentColor ?? primary;
  const initial = site?.name?.charAt(0)?.toUpperCase() ?? 'N';

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 19,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {initial}
      </div>
    ),
    { ...size }
  );
}
