import clsx from 'clsx';
import styles from './BlogOverview.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {ArrowRight} from 'lucide-react';
import {getAllPosts} from '@/lib/blog/posts';
import {PostCard} from '@/components/ui/PostCard/PostCard';

export function BlogOverview() {
    const latestPosts = getAllPosts().slice(0, 2);

    return (
        <section className={clsx(styles.section, 'section')}>
            <div className={styles.backgroundWrapper}>
                <div className={styles.aurora}></div>
            </div>

            <header className="section-header">
                <span className="eyebrow">Blog</span>
                <h2 className="title">Latest from the blog.</h2>
                <p className="description">
                    Release notes, engineering deep dives, and behind-the-scenes looks at how Tabularis gets built.
                </p>
            </header>

            <div className={styles.latestPosts}>
                {latestPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>

            <footer className={styles.footer}>
                <Button href="/blog" className={styles.footerLink}>
                    View all posts <ArrowRight size={16} />
                </Button>
            </footer>
        </section>
    );
}
