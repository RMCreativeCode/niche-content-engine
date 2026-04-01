import ReactMarkdown from 'react-markdown';
import { Article, Site } from '@/types/database';

interface ArticleRendererProps {
  article: Article;
  site: Site;
}

export function ArticleRenderer({ article, site }: ArticleRendererProps) {
  return (
    <article className="prose prose-gray max-w-none">
      <ReactMarkdown
        components={{
          h2: ({ children, ...props }) => {
            const text = typeof children === 'string' ? children : String(children);
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            return <h2 id={id} className="scroll-mt-24" {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const text = typeof children === 'string' ? children : String(children);
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            return <h3 id={id} className="scroll-mt-24" {...props}>{children}</h3>;
          },
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
        }}
      >
        {article.content_md}
      </ReactMarkdown>
    </article>
  );
}
