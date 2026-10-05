import Image from 'next/image';
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
                <Image
                    src={imageSrc}
                    alt={post.title}
                    width={1200}
                    height={630}
                    className={styles.cover}
                    loading={isFeaturedPost ? 'eager' : 'lazy'}
                />
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
                        <Image
                            src={authorAvatarUrl(primaryAuthor.github)}
                            alt={primaryAuthor.name}
                            width={40}
                            height={40}
                            className={styles.avatar}
                        />
                        {primaryAuthor.name}
                    </span>
                )}
            </div>
        </Link>
    );
}
