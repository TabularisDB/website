'use client';

import clsx from 'clsx';
import Image from 'next/image';
import {ArrowUpRightIcon, GiftIcon, InfoIcon, SparklesIcon} from 'lucide-react';
import {Button} from '@/components/ui/Button/Button';
import {Modal} from '@/components/ui/Modal/Modal';
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
                        <Modal.Section title="Overview" icon={<InfoIcon aria-hidden="true" />}>
                            <Modal.Text>{sponsor.modalDescription}</Modal.Text>
                        </Modal.Section>

                        {sponsor.features && (
                            <Modal.Section title="Why it matters" icon={<SparklesIcon aria-hidden="true" />}>
                                <ul className={styles.features}>
                                    {sponsor.features.map((feature) => (
                                        <li key={feature.text}>
                                            <span aria-hidden="true">{feature.icon}</span>
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>
                            </Modal.Section>
                        )}

                        {sponsor.offer && (
                            <Modal.Section title="Offer for Tabularis users" icon={<GiftIcon aria-hidden="true" />}>
                                <div className={styles.highlight}>
                                    <p className={styles.highlightTitle}>{sponsor.offer.title}</p>
                                    <Modal.Text>{sponsor.offer.description}</Modal.Text>
                                </div>
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
