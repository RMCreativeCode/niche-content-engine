import { getCurrentSite } from '@/lib/site-context';
import { createServerClient } from '@/lib/supabase/server';
import { EmailCapture } from '@/components/content/EmailCapture';
import Link from 'next/link';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  const site = await getCurrentSite();
  if (!site) return null;

  const supabase = createServerClient();

  const [articlesRes, comparisonsRes] = await Promise.all([
    supabase
      .from('articles')
      .select('id, slug, title, meta_description, content_type, published_at, featured_image_url')
      .eq('site_id', site.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(12),
    supabase
      .from('comparisons')
      .select('id, slug, title, description')
      .eq('site_id', site.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(4),
  ]);

  const articles = articlesRes.data || [];
  const comparisons = comparisonsRes.data || [];
  const featured = articles.slice(0, 3);
  const recent = articles.slice(3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{site.name}</h1>
        <p className="text-lg text-gray-600 max-w-2xl">{site.tagline}</p>
      </section>

      {/* Featured Articles */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((article) => (
              <Link
                key={article.id}
                href={`/${article.slug}`}
                className="group block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {article.featured_image_url && (
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {article.content_type}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:underline mt-1">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {article.meta_description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comparisons */}
      {comparisons.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparisons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparisons.map((comp) => (
              <Link
                key={comp.id}
                href={`/compare/${comp.slug}`}
                className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900">{comp.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{comp.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {recent.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
          <div className="space-y-4">
            {recent.map((article) => (
              <Link
                key={article.id}
                href={`/${article.slug}`}
                className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {article.content_type}
                </span>
                <h3 className="font-semibold text-gray-900 mt-1">{article.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{article.meta_description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Email Capture */}
      <section className="max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Stay Updated</h2>
        <EmailCapture siteId={site.id} siteName={site.name} />
      </section>
    </div>
  );
}
