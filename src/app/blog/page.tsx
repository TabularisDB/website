import {BlogArchive} from '@/components/pages/blog/BlogArchive/BlogArchive';
import {getAllPosts} from '@/lib/blog/posts';
import {ogImages} from '@/lib/og/registry';
import {FEED_ALTERNATES} from '@/lib/siteConfig';
import {Metadata} from 'next';

const path = '/blog';
const title = 'Blog | Tabularis';
const description = 'Release notes and updates from the Tabularis project, one post per release.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path, types: FEED_ALTERNATES},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, title),
    },
    twitter: {card: 'summary_large_image'},
};

export default function BlogPage() {
    const posts = getAllPosts();

    return <BlogArchive posts={posts} />;
}
