import { getCurrentSite } from '@/lib/site-context';

export const revalidate = 86400;

export default async function AffiliateDisclosurePage() {
  const site = await getCurrentSite();
  if (!site) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Affiliate Disclosure</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-500 text-sm mb-8">Last updated: {new Date().getFullYear()}</p>

        <p>
          {site.name} participates in affiliate marketing programs, including the Amazon Services LLC
          Associates Program and other affiliate networks. This means we may earn a commission when
          you click on certain links and make a purchase — at no additional cost to you.
        </p>

        <h2>How It Works</h2>
        <p>
          When you click an affiliate link on {site.name} and make a qualifying purchase, we receive
          a small percentage of the sale. This helps us keep the site running and continue producing
          free content.
        </p>

        <h2>Our Editorial Standards</h2>
        <p>
          Affiliate relationships do not influence our reviews or recommendations. We only recommend
          products we believe are genuinely useful. If a product is poor, we say so — regardless of
          whether it has an affiliate program.
        </p>

        <h2>FTC Compliance</h2>
        <p>
          In accordance with the FTC&apos;s guidelines, we disclose our affiliate relationships. Any
          page containing affiliate links is covered by this disclosure.
        </p>

        <h2>Questions</h2>
        <p>
          If you have questions about our affiliate relationships or how we choose products to review,
          feel free to reach out through our site.
        </p>
      </div>
    </div>
  );
}
