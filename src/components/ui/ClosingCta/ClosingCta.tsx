'use client';
import styles from './ClosingCta.module.scss';
import {TrustRow} from '@/components/ui/TrustRow/TrustRow';
import {GitHubButton} from '@/components/ui/GithubButton/GithubButton';
import {DownloadButton} from '@/components/ui/DownloadButton/DownloadButton';

interface ClosingCtaProps {
    title: string;
    description: string;
}

export function ClosingCta({title, description}: ClosingCtaProps) {
    return (
        <div className={styles.closing}>
            <div className={styles.gridBackground} aria-hidden="true" />
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <div className={styles.actions}>
                <DownloadButton />
                <GitHubButton withBackground />
            </div>
            <TrustRow />
        </div>
    );
}
