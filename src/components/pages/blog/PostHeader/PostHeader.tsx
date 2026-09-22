import Link from 'next/link';
import {authorAvatarUrl} from '@/lib/blog/authors';
import type {Author} from '@/lib/blog/authors';
import styles from './PostHeader.module.scss';

interface PostHeaderProps {
    tags?: string[];
    titleHtml: string;
    authors: Author[];
    date: string;
    readingTime?: number;
}

export function PostHeader({tags, titleHtml, authors, date, readingTime}: PostHeaderProps) {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <header className={styles.header}>
            {tags && tags.length > 0 && (
                <div className={styles.tags}>
                    {tags.map((tag) => (
                        <Link key={tag} href={`/blog/category/${tag}`} className={styles.tag}>
                            {tag}
                        </Link>
                    ))}
                </div>
            )}

            <div className={styles.title} dangerouslySetInnerHTML={{__html: titleHtml}} />

            <div className={styles.byline}>
                <div className={styles.authors}>
                    {authors.map((author) => (
                        <Link key={author.handle} href={`/blog/author/${author.handle}`} className={styles.authorLink}>
                            <img src={authorAvatarUrl(author.github)} alt={author.name} className={styles.avatar} />
                            <span className={styles.authorName}>{author.name}</span>
                        </Link>
                    ))}
                </div>

                <span className={styles.separator}>·</span>

                <time className={styles.date} dateTime={date}>
                    {formattedDate}
                </time>

                {readingTime && (
                    <>
                        <span className={styles.separator}>·</span>
                        <span className={styles.readingTime}>{readingTime} min read</span>
                    </>
                )}
            </div>
        </header>
    );
}
