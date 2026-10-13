import {Card} from '@/components/ui/Card/Card';
import {authorAvatarUrl, resolveAuthors} from '@/lib/blog/authors';
import {formatDate, PostMeta, postOgImage} from '@/lib/blog/posts';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PostCard.module.scss';

interface PostCardProps {
    post: PostMeta;
    isFeaturedPost?: boolean;
}

export function PostCard({post, isFeaturedPost = false}: PostCardProps) {
    if (isFeaturedPost) return <FeaturedPostCard post={post} />;

    const primaryAuthor = resolveAuthors(post.authors)[0];

    return (
        <Card>
            <Card.Cover>
                <Image src={postOgImage(post.slug)} alt="" width={1200} height={630} />
            </Card.Cover>
            <Card.Body>
                <ul className={styles.meta}>
                    <li>{formatDate(post.date.split('T')[0])}</li>
                    <li>{post.readingTime} min read</li>
                </ul>
                <Card.Content>
                    <Card.Title className={styles.title}>{post.title}</Card.Title>
                </Card.Content>
                {primaryAuthor && (
                    <span className={styles.author}>
                        <Image
                            src={authorAvatarUrl(primaryAuthor.github)}
                            alt=""
                            width={40}
                            height={40}
                            className={styles.avatar}
                        />
                        {primaryAuthor.name}
                    </span>
                )}
                <Card.Link href={`/blog/${post.slug}`} ariaLabel={`Read ${post.title}`}>
                    Read article
                </Card.Link>
            </Card.Body>
        </Card>
    );
}

function FeaturedPostCard({post}: {post: PostMeta}) {
    const primaryAuthor = resolveAuthors(post.authors)[0];

    return (
        <Link href={`/blog/${post.slug}`} className={styles.featured}>
            <div className={styles.coverWrapper}>
                <Image
                    src={postOgImage(post.slug)}
                    alt={post.title}
                    width={1200}
                    height={630}
                    className={styles.cover}
                    loading="eager"
                />
            </div>
            <div className={styles.infos}>
                <ul className={styles.meta}>
                    <li>{formatDate(post.date.split('T')[0])}</li>
                    <li>{post.readingTime} min read</li>
                </ul>
                <h3 className={styles.title}>{post.title}</h3>
                <p className={styles.description}>{post.excerpt}</p>
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
