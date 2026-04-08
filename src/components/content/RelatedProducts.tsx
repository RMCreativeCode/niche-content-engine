import { RelatedProduct } from '@/types/database';

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products?.length) return null;

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Products Mentioned</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((product, i) => (
          <a
            key={product.asin ?? `${product.name}-${i}`}
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                style={{ background: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                🛒
              </span>
              <span className="font-medium text-gray-900 group-hover:underline text-sm leading-snug truncate">
                {product.name}
              </span>
            </div>
            <span
              className="flex-shrink-0 text-xs font-semibold whitespace-nowrap"
              style={{ color: 'var(--color-primary)' }}
            >
              View on Amazon →
            </span>
          </a>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        As an Amazon Associate we earn from qualifying purchases at no extra cost to you.
      </p>
    </div>
  );
}
