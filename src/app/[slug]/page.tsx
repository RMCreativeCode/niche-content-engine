import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentSite } from '@/lib/site-context';
import { createServerClient } from '@/lib/supabase/server';
import { ArticleRenderer } from '@/components/content/ArticleRenderer';
import { TableOfContents } from '@/components/content/TableOfContents';
import { extractToc, autoLink, generateJsonLd } from '@/lib/markdown';
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
  const { data: article } = await supabase
    .from('articles')
    .select('title, meta_description, meta_keywords, featured_image_url')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!article) return {};

  return {
    title: article.title,
    description: article.meta_description,
    keywords: article.meta_keywords,
    openGraph: {
      title: article.title,
      description: article.meta_description,
      type: 'article',
      ...(article.featured_image_url && { images: [article.featured_image_url] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.meta_description,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const site = await getCurrentSite();
  if (!site) notFound();

  const supabase = createServerClient();

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!article) notFound();

  // Get related articles from the same cluster for internal linking
  const { data: relatedArticles } = await supabase
    .from('articles')
    .select('id, slug, title, meta_description')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .neq('slug', slug)
    .limit(20);

  // Auto-link other article mentions
  const linkedContent = autoLink(
    article.content_md,
    relatedArticles || [],
    article.slug
  );
  const articleWithLinks = { ...article, content_md: linkedContent };

  const toc = extractToc(article.content_md);
  const canonicalUrl = `https://${site.domain}/${article.slug}`;
  const jsonLd = generateJsonLd(article, site, canonicalUrl);

  // Get cluster info for breadcrumb
  let cluster = null;
  if (article.cluster_id) {
    const { data } = await supabase
      .from('clusters')
      .select('name, slug')
      .eq('id', article.cluster_id)
      .single();
    cluster = data;
  }

  // Get same-cluster articles for sidebar
  const sameClusterArticles = article.cluster_id
    ? (relatedArticles || []).filter((a) => a.id !== article.id).slice(0, 5)
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <link rel="canonical" href={canonicalUrl} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          {cluster && (
            <>
              <span className="mx-2">/</span>
              <span>{cluster.name}</span>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-900">{article.title}</span>
        </nav>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <header className="mb-10 pb-8 border-b border-gray-100">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
                {article.content_type}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 leading-tight">
                {article.title}
              </h1>
              {article.meta_description && (
                <p className="text-lg text-gray-500 mt-3 leading-relaxed">
                  {article.meta_description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-sm text-gray-500">
                {site.author_persona && (
                  <span className="font-medium text-gray-700">
                    By {site.author_persona.split(',')[0]}
                  </span>
                )}
                {article.published_at && (
                  <time dateTime={article.published_at}>
                    {new Date(article.published_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </time>
                )}
                <span>{Math.ceil(article.content_md.split(/\s+/).length / 200)} min read</span>
              </div>
            </header>

            <ArticleRenderer article={articleWithLinks} site={site} />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <TableOfContents items={toc} />

            {sameClusterArticles.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Articles</h3>
                <ul className="space-y-2">
                  {sameClusterArticles.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/${a.slug}`}
                        className="text-sm text-gray-600 hover:text-gray-900 block"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
