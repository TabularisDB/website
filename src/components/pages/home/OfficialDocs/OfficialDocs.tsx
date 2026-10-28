import Image from 'next/image';
import {DOCS_LISTINGS} from '@/lib/ecosystem';
import styles from './OfficialDocs.module.scss';

export function OfficialDocs() {
    return (
        <div className={styles.officialDocs}>
            <span className={styles.label}>Documented by</span>
            <div className={styles.list}>
                {DOCS_LISTINGS.map((listing, i) => (
                    <a
                        key={listing.id}
                        href={listing.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.avatar}
                        style={{zIndex: DOCS_LISTINGS.length - i}}
                        title={listing.name}
                        aria-label={`Tabularis in the ${listing.name} documentation`}
                    >
                        <Image src={listing.logoImg} alt={listing.name} width={20} height={20} />
                    </a>
                ))}
            </div>
        </div>
    );
}
