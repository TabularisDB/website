'use client';
import styles from './ClosingCta.module.scss';
import {TrustRow} from '../TrustRow/TrustRow';
import {GitHubButton} from '../GithubButton/GithubButton';
import {DownloadButton} from '../DownloadButton/DownloadButton';

interface ClosingCtaProps {
    title: string;
    description: string;
}

export function ClosingCta({title, description}: ClosingCtaProps) {
    return (
        <div className={styles.closing}>
            <div className={styles.gridBackground} aria-hidden="true" />
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>
            <div className={styles.actions}>
                <DownloadButton className={styles.downloadButton} />
                <GitHubButton withBackground />
            </div>
            <TrustRow />
        </div>
    );
}
