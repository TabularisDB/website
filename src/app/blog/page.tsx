import {BlogArchive} from '@/components/pages/blog/BlogArchive/BlogArchive';
import {getAllPosts} from '@/lib/blog/posts';
import {OG_IMAGE_URL} from '@/lib/siteConfig';
import {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Blog | Tabularis',
    description: 'Release notes and updates from the Tabularis project, one post per release.',
    openGraph: {
        type: 'website',
        url: 'https://tabularis.dev/blog/',
        title: 'Blog | Tabularis',
        description: 'Release notes and updates from the Tabularis project, one post per release.',
        images: [OG_IMAGE_URL],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog | Tabularis',
        description: 'Release notes and updates from the Tabularis project, one post per release.',
        images: [OG_IMAGE_URL],
    },
};

export default function BlogPage() {
    const posts = getAllPosts();

    return <BlogArchive posts={posts} />;
}
