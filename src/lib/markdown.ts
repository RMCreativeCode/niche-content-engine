import { Article, Site } from '@/types/database';

// Generate table of contents from markdown headings
export function extractToc(markdown: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    toc.push({ id, text, level });
  }

  return toc;
}

// Add IDs to headings in markdown for anchor links
export function addHeadingIds(markdown: string): string {
  return markdown.replace(/^(#{2,3})\s+(.+)$/gm, (_, hashes, text) => {
    const id = text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${hashes} ${text.trim()} {#${id}}`;
  });
}

// Auto-link mentions of other article titles within the same site
export function autoLink(
  markdown: string,
  otherArticles: Pick<Article, 'title' | 'slug'>[],
  currentSlug: string
): string {
  let result = markdown;
  for (const article of otherArticles) {
    if (article.slug === currentSlug) continue;
    // Only link the first occurrence, case-insensitive
    const escapedTitle = article.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!\\[)\\b(${escapedTitle})\\b(?!\\])`, 'i');
    result = result.replace(regex, `[$1](/${article.slug})`);
  }
  return result;
}

// Generate JSON-LD structured data based on schema type
export function generateJsonLd(
  article: Article,
  site: Site,
  url: string
): Record<string, unknown> {
  const base = {
    '@context': 'https://schema.org',
    url,
    publisher: {
      '@type': 'Organization',
      name: site.name,
      ...(site.theme_config.logoUrl && {
        logo: {
          '@type': 'ImageObject',
          url: site.theme_config.logoUrl,
        },
      }),
    },
  };

  switch (article.schema_type) {
    case 'Article':
      return {
        ...base,
        '@type': 'Article',
        headline: article.title,
        description: article.meta_description,
        datePublished: article.published_at,
        dateModified: article.updated_at,
        ...(article.featured_image_url && { image: article.featured_image_url }),
      };
    case 'HowTo':
      return {
        ...base,
        '@type': 'HowTo',
        name: article.title,
        description: article.meta_description,
      };
    case 'FAQPage':
      return {
        ...base,
        '@type': 'FAQPage',
        name: article.title,
        description: article.meta_description,
      };
    case 'Product':
      return {
        ...base,
        '@type': 'Product',
        name: article.title,
        description: article.meta_description,
      };
    default:
      return {
        ...base,
        '@type': 'Article',
        headline: article.title,
        description: article.meta_description,
      };
  }
}
