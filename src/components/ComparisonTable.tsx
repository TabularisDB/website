import Image from "next/image";
import { getComparisonTable } from "@/lib/comparisonTables";

interface Props {
  slug: string;
}

export function ComparisonTable({ slug }: Props) {
  const data = getComparisonTable(slug);
  if (!data) return null;

  return (
    <section className="comparison-table-section">
      <h2 className="comparison-table-heading">Feature comparison</h2>
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              {data.products.map((p) => (
                <th key={p.name}>
                  <span className="comparison-th-cell">
                    <Image
                      src={p.logo}
                      alt={`${p.name} logo`}
                      width={p.width}
                      height={p.height}
                      loading="lazy"
                      className="comparison-logo"
                    />
                    <span>{p.name}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.feature}>
                <td>{row.feature}</td>
                {row.values.map((v, i) => {
                  const product = data.products[i];
                  return (
                    <td key={i} data-product={product?.name}>
                      {product && (
                        <span className="comparison-mobile-label">
                          <Image
                            src={product.logo}
                            alt={`${product.name} logo`}
                            width={product.width}
                            height={product.height}
                            loading="lazy"
                            className="comparison-mobile-logo"
                          />
                          <span>{product.name}</span>
                        </span>
                      )}
                      <span className="comparison-cell-value">{v}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
