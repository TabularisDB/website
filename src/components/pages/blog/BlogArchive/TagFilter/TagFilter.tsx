import clsx from 'clsx';
import Link from 'next/link';
import styles from './TagFilter.module.scss';

interface TagFilterProps {
    tags?: string[];
    activeTag?: string;
}

const PRIMARY_TAGS = [
    {label: 'All', tag: null, path: '/blog'},
    {label: 'Releases', tag: 'release', path: '/blog/category/release'},
    {label: 'AI', tag: 'ai', path: '/blog/category/ai'},
    {label: 'Plugins', tag: 'plugins', path: '/blog/category/plugins'},
    {label: 'Community', tag: 'community', path: '/blog/category/community'},
    {label: 'Open Source', tag: 'open-source', path: '/blog/category/open-source'},
    {label: 'UX & UI', tag: 'ux', path: '/blog/category/ux'},
];

export function TagFilter({activeTag}: TagFilterProps) {
    const displayTags = [...PRIMARY_TAGS];
    const isPrimary = activeTag ? PRIMARY_TAGS.some((p) => p.tag === activeTag) : true;

    if (activeTag && !isPrimary) {
        displayTags.push({
            label: `#${activeTag}`,
            tag: activeTag,
            path: `/blog/category/${encodeURIComponent(activeTag)}`,
        });
    }

    return (
        <div className={styles.tags}>
            {displayTags.map((t) => {
                const isActive = t.tag === null ? !activeTag : t.tag === activeTag;
                return (
                    <Link key={t.label} href={t.path} className={clsx(styles.tag, isActive && styles.active)}>
                        {t.label}
                    </Link>
                );
            })}
        </div>
    );
}
