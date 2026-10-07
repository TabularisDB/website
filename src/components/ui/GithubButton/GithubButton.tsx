'use client';

import {formatStars, REPO_STARS} from '@/lib/github';
import clsx from 'clsx';
import {StarIcon} from 'lucide-react';
import {Button} from '@/components/ui/Button/Button';
import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import styles from './GithubButton.module.scss';
import {SOCIAL_URLS} from '@/lib/social';

interface GithubButtonProps {
    withBackground?: boolean;
}

export function GitHubButton({withBackground = false}: GithubButtonProps) {
    return (
        <Button
            variant={withBackground ? 'secondary' : 'outline'}
            href={SOCIAL_URLS.github}
            size="lg"
            className={styles.github}
        >
            <GitHubIcon />
            <div className={clsx(styles.divider, 'divider')}></div>
            <div className={styles.stars}>
                <StarIcon />
                <div className={styles.starCount}>{formatStars(REPO_STARS)}</div>
            </div>
        </Button>
    );
}
