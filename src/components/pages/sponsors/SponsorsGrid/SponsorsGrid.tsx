'use client';

import clsx from 'clsx';
import Image from 'next/image';
import {useState} from 'react';
import {SPONSORS} from '@/lib/sponsors';
import type {Sponsor} from '@/lib/sponsors';
import {SponsorModal} from '@/components/pages/sponsors/SponsorModal/SponsorModal';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
import styles from './SponsorsGrid.module.scss';

export function SponsorsGrid() {
    const [activeSponsor, setActiveSponsor] = useState<Sponsor | null>(null);

    return (
        <>
            <CardGrid variant="joined">
                {SPONSORS.map((sponsor) => (
                    <Card key={sponsor.id}>
                        {sponsor.logoImgCompact && (
                            <Card.Header
                                icon={
                                    <Image
                                        src={sponsor.logoImgCompact}
                                        alt=""
                                        width={48}
                                        height={48}
                                        className={clsx(
                                            styles.logo,
                                            sponsor.invertLogoOnLight && 'theme-invert-on-light',
                                        )}
                                    />
                                }
                            />
                        )}
                        <Card.Content>
                            <Card.Title>{sponsor.name}</Card.Title>
                            <Card.Description>{sponsor.tagline}</Card.Description>
                        </Card.Content>
                        <Card.Link
                            onClick={() => setActiveSponsor(sponsor)}
                            ariaLabel={`Learn more about ${sponsor.name}`}
                        >
                            Learn more
                        </Card.Link>
                    </Card>
                ))}
            </CardGrid>

            <SponsorModal sponsor={activeSponsor} onClose={() => setActiveSponsor(null)} />
        </>
    );
}
