import { ImageResponse } from 'next/og';
import { getCurrentSite } from '@/lib/site-context';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export const dynamic = 'force-dynamic';

export default async function AppleIcon() {
  const site = await getCurrentSite();

  const primary = site?.theme_config?.primaryColor ?? '#0ea5e9';
  const accent = site?.theme_config?.accentColor ?? primary;
  const initial = site?.name?.charAt(0)?.toUpperCase() ?? 'N';

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 100,
          fontWeight: 800,
          letterSpacing: '-2px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {initial}
      </div>
    ),
    { ...size }
  );
}
