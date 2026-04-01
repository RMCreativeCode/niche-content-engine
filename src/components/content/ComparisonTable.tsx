import { Product, Comparison } from '@/types/database';

interface ComparisonTableProps {
  comparison: Comparison;
  products: Product[];
}

export function ComparisonTable({ comparison, products }: ComparisonTableProps) {
  const axes = comparison.comparison_axes;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Feature</th>
            {products.map((product) => (
              <th key={product.id} className="text-left py-3 px-4 font-semibold text-gray-900">
                <div>{product.brand} {product.model}</div>
                <div className="text-xs font-normal text-gray-500 mt-1">{product.price_range}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-3 px-4 font-medium text-gray-600">Rating</td>
            {products.map((product) => (
              <td key={product.id} className="py-3 px-4">
                <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {product.rating}/10
                </span>
              </td>
            ))}
          </tr>
          {axes.map((axis) => (
            <tr key={axis.spec_key} className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-600">{axis.label}</td>
              {products.map((product) => {
                const value = product.specs_json[axis.spec_key];
                return (
                  <td key={product.id} className="py-3 px-4 text-gray-900">
                    {value !== undefined ? String(value) : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-b border-gray-100">
            <td className="py-3 px-4 font-medium text-gray-600">Pros</td>
            {products.map((product) => (
              <td key={product.id} className="py-3 px-4">
                <ul className="list-disc list-inside space-y-1">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="text-green-700 text-xs">{pro}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-3 px-4 font-medium text-gray-600">Cons</td>
            {products.map((product) => (
              <td key={product.id} className="py-3 px-4">
                <ul className="list-disc list-inside space-y-1">
                  {product.cons.map((con, i) => (
                    <li key={i} className="text-red-700 text-xs">{con}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {/* Affiliate CTAs */}
      <div className="flex gap-4 mt-4">
        {products.map((product) => (
          <a
            key={product.id}
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex-1 text-center py-2 px-4 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Check Price: {product.brand} {product.model}
          </a>
        ))}
      </div>
    </div>
  );
}
