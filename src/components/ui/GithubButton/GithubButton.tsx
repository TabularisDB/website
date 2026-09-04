'use client';

import {useRepoStars} from '@/hooks/useRepoStars';
import {formatStars} from '@/lib/github';
import clsx from 'clsx';
import {StarIcon} from 'lucide-react';
import {Button} from '../Button/Button';
import {GitHubIcon} from '../Icons/GithubIcon';
import styles from './GithubButton.module.scss';
import {SOCIAL_URLS} from '@/lib/social';

export function GitHubButton() {
    const stars = useRepoStars();

    return (
        <Button variant="outline" href={SOCIAL_URLS.github} size="lg" className={styles.github}>
            <GitHubIcon />
            <div className={clsx(styles.divider, 'divider')}></div>
            <span className={styles.stars}>
                <StarIcon />
                <div>{formatStars(stars!)}</div>
            </span>
        </Button>
    );
}
