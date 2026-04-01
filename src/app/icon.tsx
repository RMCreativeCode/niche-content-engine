import { ImageResponse } from 'next/og';
import { getCurrentSite } from '@/lib/site-context';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Dynamic — must read request headers to resolve the site
export const dynamic = 'force-dynamic';

export default async function Icon() {
  const site = await getCurrentSite();

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
