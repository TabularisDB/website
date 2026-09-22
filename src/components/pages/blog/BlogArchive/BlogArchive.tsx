import {NewsletterForm} from '@/components/ui/NewsletterForm/NewsletterForm';
import {PostMeta} from '@/lib/blog/posts';
import styles from './BlogArchive.module.scss';
import {TagFilter} from './TagFilter/TagFilter';
import {PostCard} from '@/components/ui/PostCard/PostCard';
import {PostGrid} from './PostGrid/PostGrid';
import clsx from 'clsx';

const POSTS_PER_PAGE = 12;

interface BlogArchiveProps {
    posts: PostMeta[];
    activeTag?: string;
}

export function BlogArchive({posts, activeTag}: BlogArchiveProps) {
    const featuredPost = posts.length > 0 ? posts[0] : null;
    const gridPosts = featuredPost ? posts.slice(1) : posts;

    return (
        <div className={clsx('container', styles.layout)}>
            <header className="page-header">
                <span className="eyebrow">Blog</span>
                <h2 className="title">Latest from the blog</h2>
                <p className="description">
                    Release notes, product updates, and the occasional deep dive into how Tabularis is built.
                </p>
            </header>

            <TagFilter activeTag={activeTag} />

            {featuredPost && <PostCard post={featuredPost} isFeaturedPost />}

            {gridPosts.length > 0 ? (
                <section className={styles.archive}>
                    <h2 className={styles.archiveTitle}>Discover more posts</h2>
                    <PostGrid posts={gridPosts} pageSize={POSTS_PER_PAGE} />
                </section>
            ) : (
                <p className={styles.empty}>No posts yet for this tag.</p>
            )}

            <div className={styles.newsletter}>
                <NewsletterForm
                    title="Want to know when something ships?"
                    description="We send an email when there's something worth reading, nothing more."
                    buttonLabel="Subscribe"
                />
            </div>
        </div>
    );
}
