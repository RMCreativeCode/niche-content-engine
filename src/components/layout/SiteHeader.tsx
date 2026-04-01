import { Site } from '@/types/database';
import Link from 'next/link';

function SiteLogo({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill={color} fillOpacity="0.12" />
      <path
        d="M16 6C16 6 8 13.5 8 19a8 8 0 0 0 16 0c0-5.5-8-13-8-13Z"
        fill={color}
        fillOpacity="0.85"
      />
      <path
        d="M11 20c0 2.76 2.24 4 5 4"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteHeader({ site }: { site: Site }) {
  const theme = site.theme_config;
  const primaryColor = (theme as { primaryColor?: string }).primaryColor ?? '#2563eb';

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          {theme.logoUrl ? (
            <img src={theme.logoUrl} alt={site.name} className="h-8 w-auto flex-shrink-0" />
          ) : (
            <SiteLogo color={primaryColor} />
          )}
          <span
            className="text-lg font-bold leading-tight truncate"
            style={{ color: 'var(--color-primary)' }}
          >
            {site.name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {theme.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="md:hidden p-2 text-gray-600 rounded-md hover:bg-gray-100" aria-label="Menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
