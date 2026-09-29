import {getComparisonTable} from '@/lib/compare/comparisonTables';
import {CheckCircleIcon, X} from 'lucide-react';
import Image from 'next/image';
import styles from './ComparisonTable.module.scss';

interface Props {
    slug: string;
}

function CellValue({value}: {value: string}) {
    if (value === '✅' || value.startsWith('✅ ')) {
        const rest = value.slice(1).trim();
        return (
            <span className={styles.cellValue}>
                <CheckCircleIcon className={styles.iconYes} size={16} />
                {rest && <span>{rest}</span>}
            </span>
        );
    }

    if (value === '❌' || value.startsWith('❌ ')) {
        const rest = value.slice(1).trim();
        return (
            <span className={styles.cellValue}>
                <X className={styles.iconNo} size={16} />
                {rest && <span>{rest}</span>}
            </span>
        );
    }

    return <span className={styles.cellValue}>{value}</span>;
}

export function ComparisonTable({slug}: Props) {
    const data = getComparisonTable(slug);
    if (!data) return null;

    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.featureHeader} />
                        {data.products.map((product) => (
                            <th key={product.name}>
                                <span className={styles.headerCell}>
                                    <Image
                                        src={product.logo}
                                        alt={`${product.name} logo`}
                                        width={product.width}
                                        height={product.height}
                                        loading="lazy"
                                        className={styles.logo}
                                    />
                                    <span className={styles.toolName}>{product.name}</span>
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row) => (
                        <tr key={row.feature}>
                            <td className={styles.featureCell}>{row.feature}</td>
                            {row.values.map((value, index) => (
                                <td key={index}>
                                    <CellValue value={value} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
