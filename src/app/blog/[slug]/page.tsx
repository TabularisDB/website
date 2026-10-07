import {JsonLd} from '@/components/layout/JsonLd';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {NewsletterForm} from '@/components/ui/NewsletterForm/NewsletterForm';
import {RelatedLinks} from '@/components/ui/RelatedLinks/RelatedLinks';
import {authorGitHubUrl, resolveAuthors} from '@/lib/blog/authors';
import {getAdjacentPosts, getAllPosts, getPostBySlug} from '@/lib/blog/posts';
import {ogImages} from '@/lib/og/registry';
import {buildArticleJsonLd, buildBreadcrumbJsonLd} from '@/lib/seo';
import {getRelatedLinksForPost} from '@/lib/seo/seoRelated';
import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PostNav} from '@/components/ui/PostNav/PostNav';
import {WikiContent} from '@/components/pages/wiki/WikiContent/WikiContent';
import styles from './BlogPostPage.module.scss';
import {PostAuthor} from '@/components/pages/blog/PostAuthor/PostAuthor';
import {PostHeader} from '@/components/pages/blog/PostHeader/PostHeader';
import {PostShareBlock} from '@/components/pages/blog/PostShareBlock/PostShareBlock';

interface PageProps {
    params: Promise<{slug: string}>;
}

export function generateStaticParams() {
    return getAllPosts().map((p) => ({slug: p.slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {slug} = await params;
    const post = await getPostBySlug(slug);
    if (!post) return {};

    const {meta} = post;
    const path = `/blog/${slug}`;
    const title = `${meta.title} | Tabularis Blog`;
    const description = meta.excerpt;

    return {
        title,
        description,
        alternates: {canonical: path},
        openGraph: {
            type: 'article',
            url: path,
            title,
            description,
            siteName: 'Tabularis Blog',
            publishedTime: meta.date,
            tags: meta.tags,
            images: ogImages(path, meta.title),
        },
        twitter: {card: 'summary_large_image'},
    };
}

export default async function BlogPostPage({params}: PageProps) {
    const {slug} = await params;
    const post = await getPostBySlug(slug);
    if (!post) notFound();

    const {meta, html} = post;
    const {prev, next} = getAdjacentPosts(slug);
    const relatedLinks = getRelatedLinksForPost(meta.tags);
    const authors = resolveAuthors(meta.authors);

    const h1End = html.indexOf('</h1>');
    const titleHtml = h1End >= 0 ? html.slice(0, h1End + 5) : html;
    const bodyHtml = h1End >= 0 ? html.slice(h1End + 5) : '';

    return (
        <section className="container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Blog', path: '/blog'},
                        {name: meta.title, path: `/blog/${slug}`},
                    ]),
                    buildArticleJsonLd({
                        title: meta.title,
                        description: meta.excerpt,
                        path: `/blog/${slug}`,
                        publishedTime: meta.date,
                        image: meta.og?.image,
                        authors: authors.map((a) => ({
                            name: a.name,
                            url: authorGitHubUrl(a.github),
                        })),
                    }),
                ]}
            />

            <div className={styles.layout}>
                <Breadcrumbs crumbs={[{label: 'Blog', href: '/blog'}, {label: meta.title}]} />

                <PostHeader
                    tags={meta.tags}
                    titleHtml={titleHtml}
                    authors={authors}
                    date={meta.date}
                    readingTime={meta.readingTime}
                />

                <div className={styles.body}>
                    <main className={styles.content}>
                        <WikiContent html={bodyHtml} />
                        <div className={styles.mobileShare}>
                            <span className={styles.heading}>Share</span>
                            <PostShareBlock title={meta.title} url={`/blog/${slug}`} compact />
                        </div>
                        <PostAuthor authors={authors} />
                        <RelatedLinks links={relatedLinks} />
                        <NewsletterForm
                            title="Want to know when something ships?"
                            description="We send an email when there's something worth reading, nothing more."
                            buttonLabel="Subscribe"
                        />
                        <PostNav prev={prev} next={next} basePath="/blog" />
                    </main>

                    <aside className={styles.share}>
                        <PostShareBlock title={meta.title} url={`/blog/${slug}`} />
                    </aside>
                </div>
            </div>
        </section>
    );
}
