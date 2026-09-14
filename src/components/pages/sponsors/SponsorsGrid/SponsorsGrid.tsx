'use client';
import {useState} from 'react';
import {SPONSORS} from '@/lib/sponsors';
import type {Sponsor} from '@/lib/sponsors';
import {SponsorModal} from '../SponsorModal/SponsorModal';
import styles from './SponsorsGrid.module.scss';

export function SponsorsGrid() {
    const [activeSponsor, setActiveSponsor] = useState<Sponsor | null>(null);

    return (
        <>
            <div className={styles.grid}>
                {SPONSORS.map((sponsor) => (
                    <button key={sponsor.id} className={styles.card} onClick={() => setActiveSponsor(sponsor)}>
                        <div className={styles.cardCover}>
                            <img src={sponsor.logoImgCompact} alt={sponsor.name} className={styles.cardIcon} />
                        </div>

                        <div className={styles.cardDetails}>
                            <span className={styles.cardTitle}>{sponsor.name}</span>
                            <p className={styles.cardTagline}>{sponsor.tagline}</p>
                        </div>
                    </button>
                ))}
            </div>

            {activeSponsor && <SponsorModal sponsor={activeSponsor} onClose={() => setActiveSponsor(null)} />}
        </>
    );
}
