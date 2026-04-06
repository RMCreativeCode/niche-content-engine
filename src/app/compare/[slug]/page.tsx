import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentSite } from '@/lib/site-context';
import { createServerClient } from '@/lib/supabase/server';
import { ComparisonTable } from '@/components/content/ComparisonTable';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getCurrentSite();
  if (!site) return {};

  const supabase = createServerClient();
  const { data: comparison } = await supabase
    .from('comparisons')
    .select('title, description')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!comparison) return {};

  return {
    title: comparison.title,
    description: comparison.description,
    openGraph: {
      title: comparison.title,
      description: comparison.description,
      type: 'article',
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const site = await getCurrentSite();
  if (!site) notFound();

  const supabase = createServerClient();

  const { data: comparison } = await supabase
    .from('comparisons')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!comparison) notFound();

  // Fetch all products referenced by this comparison
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('site_id', site.id)
    .in('id', comparison.product_ids);

  // Order products to match comparison.product_ids order
  const orderedProducts = comparison.product_ids
    .map((id: string) => (products || []).find((p) => p.id === id))
    .filter(Boolean);

  const canonicalUrl = `https://${site.domain}/compare/${comparison.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: comparison.title,
    description: comparison.description,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: site.name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <link rel="canonical" href={canonicalUrl} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/compare" className="hover:text-gray-700">Comparisons</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{comparison.title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {comparison.title}
          </h1>
          <p className="text-lg text-gray-600 mt-2">{comparison.description}</p>
        </header>

        <ComparisonTable comparison={comparison} products={orderedProducts} />

        {comparison.verdict_md && (
          <section className="mt-8 prose prose-gray max-w-none">
            <h2>Our Verdict</h2>
            <ReactMarkdown>{comparison.verdict_md}</ReactMarkdown>
          </section>
        )}
      </div>
    </>
  );
}
