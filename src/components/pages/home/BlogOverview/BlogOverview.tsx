import clsx from 'clsx';
import styles from './BlogOverview.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {ArrowRight, NewspaperIcon} from 'lucide-react';
import {getAllPosts} from '@/lib/blog/posts';
import {PostCard} from '@/components/ui/PostCard/PostCard';

export function BlogOverview() {
    const latestPosts = getAllPosts().slice(0, 2);

    return (
        <section className={clsx(styles.section, 'section')}>
            <header className="section-header">
                <span className="eyebrow">
                    <NewspaperIcon />
                    Blog
                </span>
                <h1 className="title">Latest from the blog.</h1>
                <p className="description">
                    Release notes, engineering deep dives, and behind-the-scenes looks at how Tabularis gets built.
                </p>
            </header>

            <div className={styles.latestPosts}>
                {latestPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>

            <Button href="/blog">
                View all posts <ArrowRight size={16} />
            </Button>
        </section>
    );
}
