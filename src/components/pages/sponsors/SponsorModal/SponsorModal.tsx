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
                    <div className={styles.body}>
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                <InfoIcon aria-hidden="true" />
                                Overview
                            </h3>
                            <p className={styles.text}>{sponsor.modalDescription}</p>
                        </section>

                        {sponsor.features && (
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <SparklesIcon aria-hidden="true" />
                                    Why it matters
                                </h3>
                                <ul className={styles.features}>
                                    {sponsor.features.map((feature) => (
                                        <li key={feature.text}>
                                            <span aria-hidden="true">{feature.icon}</span>
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {sponsor.offer && (
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <GiftIcon aria-hidden="true" />
                                    Offer for Tabularis users
                                </h3>
                                <div className={styles.highlight}>
                                    <p className={styles.highlightTitle}>{sponsor.offer.title}</p>
                                    <p className={styles.text}>{sponsor.offer.description}</p>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <Button href={withUtm(sponsor.url)} size="sm">
                            Visit {sponsor.name}
                            <ArrowUpRightIcon />
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
}
