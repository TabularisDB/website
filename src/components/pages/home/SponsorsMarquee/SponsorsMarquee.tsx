import {SPONSORS} from '@/lib/sponsors';
import styles from './SponsorsMarquee.module.scss';
import Link from 'next/link';

export function SponsorsMarquee() {
    const track = [...SPONSORS, ...SPONSORS];

    return (
        <div className={styles.marquee}>
            <div className={styles.trackWrapper}>
                <div className={styles.track} aria-hidden="false">
                    {track.map((sponsor, i) => (
                        <a
                            key={`${sponsor.id}-${i}`}
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.item}
                            aria-label={sponsor.name}
                            tabIndex={i >= SPONSORS.length ? -1 : 0}
                        >
                            <img src={sponsor.logoImgCompact ?? sponsor.logoImg} alt="" height={28} />
                            <span className={styles.name}>{sponsor.name}</span>
                        </a>
                    ))}
                </div>
            </div>
            <div className={styles.marqueeDescription}>
                These companies keep supporting Tabularis.{' '}
                <Link href="/sponsors" className={styles.marqueeLink}>
                    See how →
                </Link>
            </div>
        </div>
    );
}
