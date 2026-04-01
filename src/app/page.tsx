import { getCurrentSite } from '@/lib/site-context';
import { createServerClient } from '@/lib/supabase/server';
import { EmailCapture } from '@/components/content/EmailCapture';
import Link from 'next/link';

export const revalidate = 3600;

const CONTENT_TYPE_META: Record<string, { label: string; gradient: string; icon: string }> = {
  guide:    { label: 'Guide',    gradient: 'from-emerald-400 to-teal-600',    icon: '📖' },
  article:  { label: 'Article',  gradient: 'from-blue-400 to-cyan-600',       icon: '📄' },
  review:   { label: 'Review',   gradient: 'from-violet-400 to-purple-600',   icon: '⭐' },
  listicle: { label: 'List',     gradient: 'from-orange-400 to-amber-500',    icon: '📋' },
  news:     { label: 'News',     gradient: 'from-rose-400 to-pink-600',       icon: '📰' },
  default:  { label: '',         gradient: 'from-slate-400 to-slate-600',     icon: '📄' },
};

function CardThumbnail({ imageUrl, contentType, title }: { imageUrl?: string | null; contentType: string; title: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-40 object-cover"
        loading="lazy"
      />
    );
  }
  const meta = CONTENT_TYPE_META[contentType] ?? CONTENT_TYPE_META.default;
  return (
    <div
      className={`w-full h-40 bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}
      aria-hidden="true"
    >
      <span className="text-5xl opacity-60 select-none">{meta.icon}</span>
    </div>
  );
}

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

  const navItems = (site.theme_config as { navItems?: { label: string; href: string }[] }).navItems ?? [];

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent, var(--color-primary)) 100%)',
        }}
      >
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="10%" cy="80%" r="60" fill="white" />
          <circle cx="25%" cy="30%" r="30" fill="white" />
          <circle cx="50%" cy="70%" r="80" fill="white" />
          <circle cx="75%" cy="20%" r="45" fill="white" />
          <circle cx="90%" cy="60%" r="35" fill="white" />
          <circle cx="60%" cy="90%" r="20" fill="white" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="white" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 py-16 pb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-sm">{site.name}</h1>
          <p className="text-lg text-white/85 max-w-xl mb-7">{site.tagline}</p>
          {navItems.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {navItems.slice(0, 3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium backdrop-blur-sm border border-white/30 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {featured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.slug}`}
                  className="group flex flex-col border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardThumbnail imageUrl={article.featured_image_url} contentType={article.content_type} title={article.title} />
                  <div className="p-4 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                      {article.content_type}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:underline mt-1 leading-snug">{article.title}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.meta_description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {comparisons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparisons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisons.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/compare/${comp.slug}`}
                  className="flex items-start gap-3 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                >
                  <span className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: 'var(--color-primary)' }} aria-hidden="true">⚖️</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:underline">{comp.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{comp.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recent.map((article) => {
                const meta = CONTENT_TYPE_META[article.content_type] ?? CONTENT_TYPE_META.default;
                return (
                  <Link
                    key={article.id}
                    href={`/${article.slug}`}
                    className="flex items-start gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-xl`} aria-hidden="true">{meta.icon}</div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>{article.content_type}</span>
                      <h3 className="font-semibold text-gray-900 group-hover:underline mt-0.5 leading-snug">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.meta_description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="max-w-lg rounded-2xl border border-gray-200 p-6 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Stay Updated</h2>
          <p className="text-sm text-gray-500 mb-4">Get the latest guides and reviews delivered to your inbox.</p>
          <EmailCapture siteId={site.id} siteName={site.name} />
        </section>
      </div>
    </div>
  );
}
