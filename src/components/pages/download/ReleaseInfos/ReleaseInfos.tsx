import Image from 'next/image';
import Link from 'next/link';
import styles from './ReleaseInfos.module.scss';
import {ArrowRight} from 'lucide-react';

interface ReleaseInfoProps {
    version: string;
    date: string;
    hash?: string;
    hrefLabel: string;
    hrefLink: string;
    external?: boolean;
}

export function ReleaseInfo({version, date, hash, hrefLabel, hrefLink, external = false}: ReleaseInfoProps) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.iconTile}>
                <Image
                    src="/img/brand/tabularis-icon-color.svg"
                    alt="Tabularis Icon"
                    width={53}
                    height={53}
                    loading="eager"
                    className={styles.icon}
                />
            </div>
            <div className={styles.meta}>
                <span className={styles.version}>v{version}</span>
                <span className={styles.sub}>
                    {date}
                    {hash && <span>{hash}</span>}
                </span>
                {external ? (
                    <a className={styles.href} href={hrefLink} target="_blank" rel="noopener noreferrer">
                        {hrefLabel} <ArrowRight size={14} />
                    </a>
                ) : (
                    <Link className={styles.href} href={hrefLink}>
                        {hrefLabel} <ArrowRight size={14} />
                    </Link>
                )}
            </div>
        </div>
    );
}
