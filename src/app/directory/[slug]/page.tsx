import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentSite } from '@/lib/site-context';
import { createServerClient } from '@/lib/supabase/server';
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
  const { data: entry } = await supabase
    .from('directory_entries')
    .select('name, description, city, state')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .single();

  if (!entry) return {};

  const location = [entry.city, entry.state].filter(Boolean).join(', ');
  return {
    title: `${entry.name} — ${location}`,
    description: entry.description,
  };
}

export default async function DirectoryEntryPage({ params }: Props) {
  const { slug } = await params;
  const site = await getCurrentSite();
  if (!site) notFound();

  const supabase = createServerClient();

  const { data: entry } = await supabase
    .from('directory_entries')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .single();

  if (!entry) notFound();

  const location = [entry.city, entry.state, entry.country].filter(Boolean).join(', ');
  const canonicalUrl = `https://${site.domain}/directory/${entry.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: entry.name,
    description: entry.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: entry.city,
      addressRegion: entry.state,
      addressCountry: entry.country,
    },
    ...(entry.phone && { telephone: entry.phone }),
    ...(entry.url && { url: entry.url }),
    ...(entry.lat && entry.lng && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: entry.lat,
        longitude: entry.lng,
      },
    }),
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
          <Link href="/directory" className="hover:text-gray-700">Directory</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{entry.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900">{entry.name}</h1>
        <p className="text-gray-500 mt-1">{location}</p>

        <div className="mt-6 prose prose-gray max-w-none">
          <p>{entry.description}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Visit Website
            </a>
          )}
          {entry.phone && (
            <a
              href={`tel:${entry.phone}`}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Call: {entry.phone}
            </a>
          )}
        </div>

        {entry.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {entry.tags.map((tag: string) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
