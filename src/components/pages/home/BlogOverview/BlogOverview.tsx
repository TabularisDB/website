import clsx from 'clsx';
import {ArrowRight, NewspaperIcon} from 'lucide-react';
import {Button} from '@/components/ui/Button/Button';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
import {PostCard} from '@/components/ui/PostCard/PostCard';
import {getAllPosts} from '@/lib/blog/posts';
import styles from './BlogOverview.module.scss';

export function BlogOverview() {
    const latestPosts = getAllPosts().slice(0, 2);

    return (
        <section className={clsx(styles.section, 'section')}>
            <header className="section-header">
                <span className="eyebrow">
                    <NewspaperIcon />
                    Blog
                </span>
                <h2 className="title">Latest from the blog.</h2>
                <p className="description">
                    Release notes, engineering deep dives, and behind-the-scenes looks at how Tabularis gets built.
                </p>
            </header>

            <CardGrid minWidth={480} className={styles.latestPosts}>
                {latestPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </CardGrid>

            <Button href="/blog">
                View all posts <ArrowRight size={16} />
            </Button>
        </section>
    );
}
