import { Site } from '@/types/database';
import Link from 'next/link';

export function SiteHeader({ site }: { site: Site }) {
  const theme = site.theme_config;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {theme.logoUrl && (
            <img src={theme.logoUrl} alt={site.name} className="h-8 w-auto" />
          )}
          <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
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
        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-gray-600" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
