import Link from 'next/link';
import clsx from 'clsx';
import {formatDate, PostMeta, postOgImage} from '@/lib/blog/posts';
import {authorAvatarUrl, resolveAuthors} from '@/lib/blog/authors';
import styles from './PostCard.module.scss';

interface PostCardProps {
    post: PostMeta;
    isFeaturedPost?: boolean;
}

export function PostCard({post, isFeaturedPost = false}: PostCardProps) {
    const imageSrc = postOgImage(post.slug);
    const authors = resolveAuthors(post.authors);
    const primaryAuthor = authors[0];

    return (
        <Link href={`/blog/${post.slug}`} className={clsx(styles.card, isFeaturedPost && styles.featured)}>
            <div className={styles.coverWrapper}>
                <img src={imageSrc} alt={post.title} className={styles.cover} />
            </div>
            <div className={styles.infos}>
                {isFeaturedPost && (
                    <ul className={styles.meta}>
                        <li>{formatDate(post.date.split('T')[0])}</li>
                        <li>{post.readingTime} min read </li>
                    </ul>
                )}
                <h3 className={styles.title}>{post.title}</h3>

                {isFeaturedPost && <p className={styles.description}>{post.excerpt}</p>}

                {!isFeaturedPost && (
                    <ul className={styles.meta}>
                        <li>{formatDate(post.date.split('T')[0])}</li>
                        <li>{post.readingTime} min read </li>
                    </ul>
                )}

                {primaryAuthor && (
                    <span className={styles.author}>
                        <img
                            src={authorAvatarUrl(primaryAuthor.github)}
                            alt={primaryAuthor.name}
                            className={styles.avatar}
                        />
                        {primaryAuthor.name}
                    </span>
                )}
            </div>
        </Link>
    );
}
