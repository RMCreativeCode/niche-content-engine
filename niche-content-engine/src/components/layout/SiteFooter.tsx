import { Site } from '@/types/database';
import Link from 'next/link';

export function SiteFooter({ site }: { site: Site }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{site.name}</h3>
            <p className="text-sm text-gray-600">{site.tagline}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Links</h3>
            <ul className="space-y-1">
              {site.theme_config.navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-600 hover:text-gray-900">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure" className="text-sm text-gray-600 hover:text-gray-900">
                  Affiliate Disclosure
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            &copy; {year} {site.name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {site.affiliate_config.defaultCta && (
              <span>Some links on this site are affiliate links. We may earn a commission at no extra cost to you.</span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
