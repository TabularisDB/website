import {PostGrid} from '@/components/pages/blog/BlogArchive/PostGrid/PostGrid';
import {AUTHORS, authorAvatarUrl, authorGitHubUrl, getAuthor} from '@/lib/blog/authors';
import {getAllAuthorHandles, getPostsByAuthor} from '@/lib/blog/posts';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import styles from './page.module.scss';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';

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
    const title = `${author.name} | Tabularis Blog`;
    const description = `Posts by ${author.name} on the Tabularis blog. ${author.bio}`;
    // No per-author card exists, and the opengraph-image convention does not
    // cascade into this nested segment, so fall back to the generated blog-section
    // card (renamed to `.png` by scripts/finalize-og-images.mjs). Setting `images`
    // explicitly is required: an openGraph block without it emits no og:image.
    const images = [
        {
            url: 'https://tabularis.dev/blog/opengraph-image.png',
            width: 1200,
            height: 630,
            alt: title,
        },
    ];

    return {
        title,
        description,
        openGraph: {
            type: 'profile',
            url: `https://tabularis.dev/blog/author/${author.handle}`,
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
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
                    <img src={authorAvatarUrl(author.github)} alt={author.name} className={styles.avatar} />
                    <div className={styles.info}>
                        <h1 className={styles.name}>{author.name}</h1>
                        <p className={styles.bio}>{author.bio}</p>
                        <div className={styles.meta}>
                            <span className={styles.count}>
                                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                            </span>
                            <span className={styles.separator}>·</span>
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
