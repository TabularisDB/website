'use client';

import Image from 'next/image';
import {Sponsor, SPONSORS} from '@/lib/sponsors';
import styles from './SponsorsMarquee.module.scss';
import Link from 'next/link';
import {useState} from 'react';
import {SponsorModal} from '../../sponsors/SponsorModal/SponsorModal';
import {ArrowRight} from 'lucide-react';

export function SponsorsMarquee() {
    const [activeSponsor, setActiveSponsor] = useState<Sponsor | null>(null);

    return (
        <div className={styles.marquee}>
            <div className={styles.marqueeDescription}>
                These companies keep supporting Tabularis.{' '}
                <Link href="/sponsors" className={styles.marqueeLink}>
                    See how <ArrowRight size={16} />
                </Link>
            </div>
            <div className={styles.trackWrapper}>
                <div className={styles.track}>
                    {[0, 1].map((copy) => (
                        <div key={copy} className={styles.group} aria-hidden={copy === 1 ? true : undefined}>
                            {SPONSORS.map((sponsor) => (
                                <button
                                    key={sponsor.id}
                                    type="button"
                                    className={styles.item}
                                    aria-label={`About ${sponsor.name}`}
                                    tabIndex={copy === 1 ? -1 : undefined}
                                    onClick={() => setActiveSponsor(sponsor)}
                                >
                                    {(sponsor.logoImgCompact ?? sponsor.logoImg) && (
                                        <Image
                                            src={(sponsor.logoImgCompact ?? sponsor.logoImg)!}
                                            alt=""
                                            width={28}
                                            height={28}
                                        />
                                    )}
                                    <span className={styles.name}>{sponsor.name}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {activeSponsor && <SponsorModal sponsor={activeSponsor} onClose={() => setActiveSponsor(null)} />}
        </div>
    );
}
