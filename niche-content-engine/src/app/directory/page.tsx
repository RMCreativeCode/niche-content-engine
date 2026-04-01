import { getCurrentSite } from '@/lib/site-context';
import { createServerClient } from '@/lib/supabase/server';
import { DirectoryCard } from '@/components/content/DirectoryCard';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function DirectoryPage() {
  const site = await getCurrentSite();
  if (!site) notFound();

  const supabase = createServerClient();

  const { data: entries } = await supabase
    .from('directory_entries')
    .select('*')
    .eq('site_id', site.id)
    .order('name', { ascending: true });

  if (!entries || entries.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Directory</h1>
        <p className="text-gray-600">No directory entries yet. Check back soon!</p>
      </div>
    );
  }

  // Group entries by category
  const byCategory = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const cat = entry.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Directory</h1>

      {Object.entries(byCategory).map(([category, catEntries]) => (
        <section key={category} className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catEntries.map((entry) => (
              <DirectoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
