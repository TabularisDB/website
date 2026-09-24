import {PostCard} from '@/components/ui/PostCard/PostCard';
import type {PostMeta} from '@/lib/blog/posts';
import {ShowMoreList} from './ShowMoreList/ShowMoreList';
import styles from './PostGrid.module.scss';

interface PostGridProps {
    posts: PostMeta[];
    pageSize: number;
}

export function PostGrid({posts, pageSize}: PostGridProps) {
    return (
        <ShowMoreList pageSize={pageSize} className={styles.grid}>
            {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
            ))}
        </ShowMoreList>
    );
}
