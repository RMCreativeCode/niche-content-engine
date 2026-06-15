import { getCurrentSite } from '@/lib/site-context';

export const revalidate = 86400;

export default async function PrivacyPage() {
  const site = await getCurrentSite();
  if (!site) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-500 text-sm mb-8">Last updated: {new Date().getFullYear()}</p>

        <h2>Information We Collect</h2>
        <p>
          {site.name} collects minimal information. If you subscribe to our email list, we store
          your email address to send you updates. We do not sell or share your email with third parties.
        </p>

        <h2>Analytics</h2>
        <p>
          {site.name} uses Google Analytics to understand how visitors use our site (pages visited,
          time on site, approximate location, and device type). Google Analytics sets cookies and
          processes this data on our behalf; it may also be used by Google in accordance with its own
          privacy policy. We use this data only in aggregate to improve our content. You can opt out
          using the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" className="underline" style={{ color: 'var(--color-primary)' }}>
            Google Analytics Opt-out Browser Add-on
          </a>.
        </p>

        <h2>Affiliate Links</h2>
        <p>
          Some links on {site.name} are affiliate links. Clicking them and making a purchase may earn
          us a small commission at no extra cost to you. See our{' '}
          <a href="/affiliate-disclosure" className="underline" style={{ color: 'var(--color-primary)' }}>
            Affiliate Disclosure
          </a>{' '}
          for details.
        </p>

        <h2>Cookies</h2>
        <p>
          We use cookies necessary for the site to function, plus analytics cookies set by Google
          Analytics to measure site usage (described above). We do not use advertising cookies.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          We may embed content from or link to third-party services (YouTube, Amazon, etc.). These
          services have their own privacy policies which we encourage you to review.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? You can reach us through the contact information on our site.
        </p>
      </div>
    </div>
  );
}
