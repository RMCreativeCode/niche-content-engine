import { Metadata } from 'next';
import { getCurrentSite } from '@/lib/site-context';
import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCurrentSite();
  if (!site) return {};
  return {
    title: `Comparisons – ${site.name}`,
    description: `Side-by-side comparisons to help you choose the right products for ${site.name}.`,
  };
}

export default async function ComparisonsPage() {
  const site = await getCurrentSite();
  if (!site) notFound();

  const supabase = createServerClient();

  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('id, slug, title, description, published_at')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Comparisons</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Comparisons</h1>
        <p className="text-gray-600 mt-2">
          Side-by-side breakdowns to help you make the right call.
        </p>
      </header>

      {!comparisons || comparisons.length === 0 ? (
        <div className="rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          <span className="text-4xl block mb-3" aria-hidden="true">⚖️</span>
          <p className="font-medium text-gray-700">No comparisons yet</p>
          <p className="text-sm mt-1">Check back soon — comparisons are coming.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparisons.map((comp) => (
            <Link
              key={comp.id}
              href={`/compare/${comp.slug}`}
              className="flex items-start gap-4 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
            >
              <span
                className="flex-shrink-0 mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                style={{ background: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                ⚖️
              </span>
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 group-hover:underline leading-snug">
                  {comp.title}
                </h2>
                {comp.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{comp.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
