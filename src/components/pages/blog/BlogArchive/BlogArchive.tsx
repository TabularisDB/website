import {NewsletterForm} from '@/components/ui/NewsletterForm/NewsletterForm';
import {PostCard} from '@/components/ui/PostCard/PostCard';
import {PostMeta} from '@/lib/blog/posts';
import {NewspaperIcon} from 'lucide-react';
import styles from './BlogArchive.module.scss';
import {PostGrid} from './PostGrid/PostGrid';
import {TagFilter} from './TagFilter/TagFilter';

const POSTS_PER_PAGE = 12;

interface BlogArchiveProps {
    posts: PostMeta[];
    activeTag?: string;
}

export function BlogArchive({posts, activeTag}: BlogArchiveProps) {
    const featuredPost = posts.length > 0 ? posts[0] : null;
    const gridPosts = featuredPost ? posts.slice(1) : posts;

    return (
        <div className="container">
            <header className="page-header">
                <span className="eyebrow">
                    <NewspaperIcon />
                    Blog
                </span>
                <h1 className="title">Latest from the blog</h1>
                <p className="description">
                    Release notes, product updates, and the occasional deep dive into how Tabularis is built.
                </p>
            </header>

            <div className={styles.filterBar}>
                <TagFilter activeTag={activeTag} />
                <span className={styles.count}>
                    {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
                </span>
            </div>

            {featuredPost && <PostCard post={featuredPost} isFeaturedPost />}

            {gridPosts.length > 0 && (
                <section className={styles.archive}>
                    <h2 className={styles.archiveTitle}>Discover more posts</h2>
                    <PostGrid posts={gridPosts} pageSize={POSTS_PER_PAGE} />
                </section>
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
