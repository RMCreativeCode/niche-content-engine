import ReactMarkdown from 'react-markdown';
import { Article, FaqItem, RelatedProduct, Site } from '@/types/database';
import { RelatedProducts } from './RelatedProducts';

interface ArticleRendererProps {
  article: Article;
  site: Site;
}

function FaqSection({ items }: { items: FaqItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
      <dl className="space-y-4">
        {items.map((item, i) => (
          <details key={i} className="group border border-gray-200 rounded-lg overflow-hidden">
            <summary
              className="flex items-center justify-between gap-3 px-5 py-4 font-medium text-gray-900 cursor-pointer list-none select-none hover:bg-gray-50 transition-colors"
              style={{ WebkitAppearance: 'none' } as React.CSSProperties}
            >
              <span>{item.question}</span>
              <svg
                className="w-4 h-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <dd className="px-5 pb-5 pt-2 text-gray-600 leading-relaxed border-t border-gray-100">
              {item.answer}
            </dd>
          </details>
        ))}
      </dl>
    </div>
  );
}

function stripMarkdownFaq(md: string): string {
  return md.replace(/\n*^##\s+Frequently Asked Questions[\s\S]*$/im, '').trimEnd();
}

export function ArticleRenderer({ article, site }: ArticleRendererProps) {
  const bodyMd = article.faq_items?.length
    ? stripMarkdownFaq(article.content_md)
    : article.content_md;

  const makeHeadingId = (children: React.ReactNode): string => {
    const text = typeof children === 'string' ? children : String(children);
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <article>
      <div className="prose prose-lg prose-gray max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:leading-relaxed prose-p:text-gray-700
        prose-li:text-gray-700 prose-li:leading-relaxed
        prose-strong:text-gray-900
        prose-a:no-underline hover:prose-a:underline">
        <ReactMarkdown
          components={{
            h2: ({ children, ...props }) => (
              <h2 id={makeHeadingId(children)} className="scroll-mt-24" {...props}>{children}</h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 id={makeHeadingId(children)} className="scroll-mt-24" {...props}>{children}</h3>
            ),
            a: ({ href, children, ...props }) => {
              const isExternal = href?.startsWith('http');
              return (
                <a
                  href={href}
                  {...(isExternal && { target: '_blank', rel: 'noopener noreferrer nofollow' })}
                  style={{ color: 'var(--color-primary)' }}
                  {...props}
                >
                  {children}
                </a>
              );
            },
            img: ({ src, alt, ...props }) => (
              <figure className="my-6">
                <img
                  src={src}
                  alt={alt || ''}
                  className="rounded-lg w-full"
                  loading="lazy"
                  {...props}
                />
                {alt && <figcaption className="text-center text-sm text-gray-500 mt-2">{alt}</figcaption>}
              </figure>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote
                className="border-l-4 pl-4 py-1 my-4 rounded-r-lg bg-gray-50 not-italic"
                style={{ borderColor: 'var(--color-primary)' }}
                {...props}
              >
                {children}
              </blockquote>
            ),
          }}
        >
          {bodyMd}
        </ReactMarkdown>
      </div>

      <RelatedProducts products={(article.related_products as RelatedProduct[]) || []} />
      <FaqSection items={article.faq_items} />
    </article>
  );
}
