import Image from 'next/image';
import {PostGrid} from '@/components/pages/blog/BlogArchive/PostGrid/PostGrid';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {AUTHORS, authorAvatarUrl, authorGitHubUrl, getAuthor} from '@/lib/blog/authors';
import {getAllAuthorHandles, getPostsByAuthor} from '@/lib/blog/posts';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ogImages} from '@/lib/og/registry';
import styles from './BlogAuthorPage.module.scss';

const POSTS_PER_PAGE = 12;

interface PageProps {
    params: Promise<{handle: string}>;
}

export function generateStaticParams() {
    // Only authors with at least one published post get an archive page.
    return getAllAuthorHandles()
        .filter((handle) => handle in AUTHORS)
        .map((handle) => ({handle}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {handle} = await params;
    const key = handle.toLowerCase();
    if (!(key in AUTHORS)) notFound();

    const author = getAuthor(key);
    const path = `/blog/author/${author.handle}`;
    const title = `${author.name} | Tabularis Blog`;
    const description = `Posts by ${author.name} on the Tabularis blog.`;

    return {
        title,
        description,
        alternates: {canonical: path},
        openGraph: {
            type: 'profile',
            url: path,
            title,
            description,
            images: ogImages(path, title),
        },
        twitter: {card: 'summary_large_image'},
    };
}

export default async function AuthorArchivePage({params}: PageProps) {
    const {handle} = await params;
    const key = handle.toLowerCase();
    if (!(key in AUTHORS)) notFound();

    const author = getAuthor(key);
    const posts = getPostsByAuthor(key);
    if (posts.length === 0) notFound();

    return (
        <div className="container">
            <div className={styles.layout}>
                <Breadcrumbs crumbs={[{label: 'Blog', href: '/blog'}, {label: author.name}]} />
                <header className={styles.header}>
                    <Image
                        src={authorAvatarUrl(author.github)}
                        alt={author.name}
                        width={96}
                        height={96}
                        loading="eager"
                        className={styles.avatar}
                    />
                    <div className={styles.info}>
                        <h1 className={styles.name}>{author.name}</h1>
                        <p className={styles.bio}>{author.bio}</p>
                        <div className={styles.meta}>
                            <span className={styles.count}>
                                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                            </span>
                            <span>·</span>
                            <a
                                href={authorGitHubUrl(author.github)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.github}
                            >
                                @{author.github}
                            </a>
                        </div>
                    </div>
                </header>

                <PostGrid posts={posts} pageSize={POSTS_PER_PAGE} />
            </div>
        </div>
    );
}
