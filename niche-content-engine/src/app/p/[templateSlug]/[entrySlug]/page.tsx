import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentSite } from '@/lib/site-context';
import { createServerClient } from '@/lib/supabase/server';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export const revalidate = 3600;

interface Props {
  params: Promise<{ templateSlug: string; entrySlug: string }>;
}

function interpolate(template: string, variables: Record<string, string | number | boolean>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key] !== undefined ? String(variables[key]) : `{{${key}}}`;
  });
}

function generateSlugFromPattern(pattern: string, variables: Record<string, string | number | boolean>): string {
  return pattern.replace(/\{(\w+)\}/g, (_, key) => {
    const val = variables[key];
    if (val === undefined) return key;
    return String(val)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateSlug, entrySlug } = await params;
  const site = await getCurrentSite();
  if (!site) return {};

  const supabase = createServerClient();

  // Find the template by matching the slug_pattern prefix
  const { data: templates } = await supabase
    .from('programmatic_templates')
    .select('*')
    .eq('site_id', site.id);

  if (!templates || templates.length === 0) return {};

  // Match template by slug pattern prefix
  const template = templates.find((t) => {
    const prefix = t.slug_pattern.split('{')[0].replace(/-$/, '');
    return templateSlug === prefix || t.slug_pattern.startsWith(templateSlug);
  });

  if (!template) return {};

  // Find the data entry
  const { data: entries } = await supabase
    .from('programmatic_data')
    .select('*')
    .eq('template_id', template.id)
    .eq('site_id', site.id)
    .eq('status', 'active');

  const entry = (entries || []).find((e) => {
    if (e.slug_override === entrySlug) return true;
    const generatedSlug = generateSlugFromPattern(template.slug_pattern, e.variables_json);
    const entryPart = generatedSlug.replace(templateSlug + '-', '');
    return entryPart === entrySlug || generatedSlug === `${templateSlug}-${entrySlug}`;
  });

  if (!entry) return {};

  const title = interpolate(template.title_pattern, entry.variables_json);
  const description = interpolate(template.meta_description_pattern, entry.variables_json);

  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
  };
}

export default async function ProgrammaticPage({ params }: Props) {
  const { templateSlug, entrySlug } = await params;
  const site = await getCurrentSite();
  if (!site) notFound();

  const supabase = createServerClient();

  // Find matching template
  const { data: templates } = await supabase
    .from('programmatic_templates')
    .select('*')
    .eq('site_id', site.id);

  const template = (templates || []).find((t) => {
    const prefix = t.slug_pattern.split('{')[0].replace(/-$/, '');
    return templateSlug === prefix || t.slug_pattern.startsWith(templateSlug);
  });

  if (!template) notFound();

  // Find matching data entry
  const { data: entries } = await supabase
    .from('programmatic_data')
    .select('*')
    .eq('template_id', template.id)
    .eq('site_id', site.id)
    .eq('status', 'active');

  const entry = (entries || []).find((e) => {
    if (e.slug_override === entrySlug) return true;
    const generatedSlug = generateSlugFromPattern(template.slug_pattern, e.variables_json);
    const entryPart = generatedSlug.replace(templateSlug + '-', '');
    return entryPart === entrySlug || generatedSlug === `${templateSlug}-${entrySlug}`;
  });

  if (!entry) notFound();

  const title = interpolate(template.title_pattern, entry.variables_json);
  const content = interpolate(template.content_template_md, entry.variables_json);
  const canonicalUrl = `https://${site.domain}/p/${templateSlug}/${entrySlug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: interpolate(template.meta_description_pattern, entry.variables_json),
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: site.name,
    },
  };

  // Get other entries from the same template for "related" links
  const otherEntries = (entries || [])
    .filter((e) => e.id !== entry.id)
    .slice(0, 10)
    .map((e) => ({
      title: interpolate(template.title_pattern, e.variables_json),
      slug: e.slug_override || generateSlugFromPattern(template.slug_pattern, e.variables_json).replace(templateSlug + '-', ''),
    }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <link rel="canonical" href={canonicalUrl} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{title}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">{title}</h1>

        <article className="prose prose-gray max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>

        {otherEntries.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {otherEntries.map((other) => (
                <Link
                  key={other.slug}
                  href={`/p/${templateSlug}/${other.slug}`}
                  className="text-sm py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {other.title}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
