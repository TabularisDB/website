'use client';
import {ArrowRight, X} from 'lucide-react';
import type {Sponsor} from '@/lib/sponsors';
import styles from './SponsorModal.module.scss';
import {Button} from '@/components/ui/Button/Button';

interface SponsorModalProps {
    sponsor: Sponsor;
    onClose: () => void;
}

export function SponsorModal({sponsor, onClose}: SponsorModalProps) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={sponsor.name}>
                <header className={styles.header}>
                    <div className={styles.headerBrand}>
                        <img src={sponsor.logoImgCompact} alt="" className={styles.headerLogo} />
                        <h2 className={styles.headerTitle}>{sponsor.name}</h2>
                    </div>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.body}>
                    <div className={styles.section}>
                        <span className={styles.categoryTitle}>Overview</span>
                        <p className={styles.description}>{sponsor.modalDescription}</p>
                    </div>

                    {sponsor.features && (
                        <div className={styles.section}>
                            <span className={styles.categoryTitle}>Why it matters</span>
                            <ul className={styles.features}>
                                {sponsor.features.map((f) => (
                                    <li key={f.icon}>
                                        <span>{f.icon}</span> <span>{f.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {sponsor.offer && (
                        <div className={styles.section}>
                            <span className={styles.categoryTitle}>Offer for Tabularis users</span>
                            <div className={styles.highlight}>
                                <h3 className={styles.highlightTitle}>{sponsor.offer.title}</h3>
                                <p className={styles.highlightText}>{sponsor.offer.description}</p>
                            </div>
                        </div>
                    )}
                </div>

                <footer className={styles.footer}>
                    <Button href={sponsor.url} className={styles.visitButton}>
                        Visit {sponsor.name} <ArrowRight size={16} />
                    </Button>
                </footer>
            </div>
        </div>
    );
}
