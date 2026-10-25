'use client';

import clsx from 'clsx';
import Image from 'next/image';
import {ArrowUpRightIcon, CircleCheckIcon, GiftIcon} from 'lucide-react';
import {Button} from '@/components/ui/Button/Button';
import {Modal} from '@/components/ui/Modal/Modal';
import {Notice} from '@/components/ui/Notice/Notice';
import type {Sponsor} from '@/lib/sponsors';
import styles from './SponsorModal.module.scss';

function withUtm(url: string, campaign = 'sponsor'): string {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'tabularis');
    u.searchParams.set('utm_medium', 'referral');
    u.searchParams.set('utm_campaign', campaign);
    return u.toString();
}

interface SponsorModalProps {
    sponsor: Sponsor | null;
    onClose: () => void;
}

export function SponsorModal({sponsor, onClose}: SponsorModalProps) {
    return (
        <Modal
            open={sponsor !== null}
            onClose={onClose}
            title={sponsor?.name ?? ''}
            icon={
                sponsor?.logoImgCompact && (
                    <Image
                        src={sponsor.logoImgCompact}
                        alt=""
                        width={40}
                        height={40}
                        className={clsx(styles.icon, sponsor.invertLogoOnLight && 'theme-invert-on-light')}
                    />
                )
            }
        >
            {sponsor && (
                <>
                    <Modal.Body>
                        {sponsor.modalDescription && <Modal.Text>{sponsor.modalDescription}</Modal.Text>}

                        {sponsor.offer && (
                            <Notice variant="accent" icon={GiftIcon} title={sponsor.offer.title}>
                                {sponsor.offer.description}
                            </Notice>
                        )}

                        {sponsor.features && (
                            <Modal.Section title="Highlights">
                                <ul className={styles.features}>
                                    {sponsor.features.map((feature) => (
                                        <li key={feature.text}>
                                            <CircleCheckIcon aria-hidden="true" />
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>
                            </Modal.Section>
                        )}
                    </Modal.Body>

                    <Modal.Actions>
                        <Button href={withUtm(sponsor.url)} size="sm">
                            Visit {sponsor.name}
                            <ArrowUpRightIcon />
                        </Button>
                    </Modal.Actions>
                </>
            )}
        </Modal>
    );
}
