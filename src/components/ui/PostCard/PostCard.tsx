import {formatDate, PostMeta, postOgImage} from '@/lib/blog/posts';
import styles from './PostCard.module.scss';

interface PostCardProps {
    post: PostMeta;
}

export function PostCard({post}: PostCardProps) {
    const imageSrc = postOgImage(post.slug);

    return (
        <div className={styles.card}>
            <div className={styles.cover}>
                <img src={imageSrc} alt="" className={styles.imageCover} />
            </div>
            <div className={styles.infos}>
                <span className={styles.details}>
                    {formatDate(post.date.split('T')[0])} • {post.readingTime} min read
                </span>
                <h3 className={styles.title}>{post.title}</h3>
                <p className={styles.description}>{post.excerpt}</p>
            </div>
        </div>
    );
}
