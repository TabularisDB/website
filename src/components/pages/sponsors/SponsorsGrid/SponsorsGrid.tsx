'use client';

import clsx from 'clsx';
import Image from 'next/image';
import {ArrowRightIcon} from 'lucide-react';
import {useState} from 'react';
import {SPONSORS} from '@/lib/sponsors';
import type {Sponsor} from '@/lib/sponsors';
import {SponsorModal} from '@/components/pages/sponsors/SponsorModal/SponsorModal';
import styles from './SponsorsGrid.module.scss';

export function SponsorsGrid() {
    const [activeSponsor, setActiveSponsor] = useState<Sponsor | null>(null);

    return (
        <>
            <div className={styles.grid}>
                {SPONSORS.map((sponsor) => (
                    <article key={sponsor.id} className={styles.card}>
                        {sponsor.logoImgCompact && (
                            <Image
                                src={sponsor.logoImgCompact}
                                alt=""
                                width={48}
                                height={48}
                                className={clsx(styles.cardLogo, sponsor.invertLogoOnLight && 'theme-invert-on-light')}
                            />
                        )}

                        <div className={styles.cardDetails}>
                            <h3 className={styles.cardTitle}>{sponsor.name}</h3>
                            <p className={styles.cardTagline}>{sponsor.tagline}</p>
                        </div>

                        <button
                            type="button"
                            className={styles.cardLink}
                            aria-label={`Learn more about ${sponsor.name}`}
                            onClick={() => setActiveSponsor(sponsor)}
                        >
                            Learn more <ArrowRightIcon aria-hidden="true" />
                        </button>
                    </article>
                ))}
            </div>

            <SponsorModal sponsor={activeSponsor} onClose={() => setActiveSponsor(null)} />
        </>
    );
}
