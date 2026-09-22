import clsx from 'clsx';
import {BlueskyIcon, LinkedInIcon, RedditIcon, XBrandIcon} from '@/components/ui/Icons/SocialIcons';
import {buildSocialShareUrls} from '@/lib/social';
import {CopyLinkButton} from '@/components/ui/CopyLinkButton/CopyLinkButton';
import styles from './PostShareBlock.module.scss';

interface PostShareBlockProps {
    title: string;
    url: string;
    compact?: boolean;
}

export function PostShareBlock({title, url, compact = false}: PostShareBlockProps) {
    const absoluteUrl = new URL(url, 'https://tabularis.dev').toString();
    const shareText = `${title} · Tabularis`;
    const shareUrls = buildSocialShareUrls({url: absoluteUrl, text: shareText});

    const platforms = [
        {label: 'Share on X', href: shareUrls.x, icon: <XBrandIcon />},
        {label: 'Share on Bluesky', href: shareUrls.bluesky, icon: <BlueskyIcon />},
        {label: 'Share on LinkedIn', href: shareUrls.linkedin, icon: <LinkedInIcon />},
        {label: 'Share on Reddit', href: shareUrls.reddit, icon: <RedditIcon />},
    ];

    return (
        <section className={clsx(styles.block, compact && styles.compact)} aria-label="Share this post">
            {!compact && <span className={styles.eyebrow}>Share</span>}
            <div className={styles.actions}>
                {platforms.map(({label, href, icon}) => (
                    <a
                        key={label}
                        className={styles.button}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        title={label}
                    >
                        {icon}
                    </a>
                ))}
                <CopyLinkButton className={styles.button} url={absoluteUrl} />
            </div>
        </section>
    );
}
