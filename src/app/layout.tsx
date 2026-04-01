import type { Metadata } from 'next';
import { getCurrentSite, getSiteThemeVars } from '@/lib/site-context';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCurrentSite();
  if (!site) return { title: 'Site Not Found' };

  return {
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getCurrentSite();

  if (!site) {
    return (
      <html lang="en">
        <body className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Site Not Found</h1>
            <p className="text-gray-600 mt-2">This domain is not configured.</p>
          </div>
        </body>
      </html>
    );
  }

  const themeVars = getSiteThemeVars(site);
  const analytics = site.analytics_config;

  return (
    <html lang="en">
      <head>
        {analytics?.plausibleDomain && (
          <script
            defer
            data-domain={analytics.plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body
        className="min-h-screen flex flex-col bg-white text-gray-900"
        style={themeVars as React.CSSProperties}
      >
        <SiteHeader site={site} />
        <main className="flex-1">{children}</main>
        <SiteFooter site={site} />
      </body>
    </html>
  );
}
