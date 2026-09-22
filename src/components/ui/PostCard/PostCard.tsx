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
            <div className={styles.cover}>
                <img src={imageSrc} alt={post.title} className={styles.imageCover} />
            </div>
            <div className={styles.infos}>
                <span className={styles.details}>
                    {formatDate(post.date.split('T')[0])} · {post.readingTime} min read
                </span>

                <h3 className={styles.title}>{post.title}</h3>
                <p className={styles.description}>{post.excerpt}</p>

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
