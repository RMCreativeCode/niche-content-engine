import { DirectoryEntry } from '@/types/database';
import Link from 'next/link';

export function DirectoryCard({ entry }: { entry: DirectoryEntry }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <Link href={`/directory/${entry.slug}`}>
        <h3 className="font-semibold text-gray-900 mb-1">{entry.name}</h3>
      </Link>
      <p className="text-sm text-gray-500 mb-2">
        {[entry.city, entry.state, entry.country].filter(Boolean).join(', ')}
      </p>
      <p className="text-sm text-gray-600 line-clamp-2">{entry.description}</p>
      <div className="flex flex-wrap gap-1 mt-3">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>
      {entry.url && (
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm mt-2 inline-block"
          style={{ color: 'var(--color-primary)' }}
        >
          Visit website &rarr;
        </a>
      )}
    </div>
  );
}
