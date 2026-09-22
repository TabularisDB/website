import {BlogArchive} from '@/components/pages/blog/BlogArchive/BlogArchive';
import {getAllTags, getPostsByTag} from '@/lib/blog/posts';
import {Metadata} from 'next';
import {notFound} from 'next/navigation';

export function generateStaticParams() {
    return getAllTags().map((category) => ({category}));
}

export async function generateMetadata({params}: {params: Promise<{category: string}>}): Promise<Metadata> {
    const {category} = await params;
    return {
        title: `#${category} | Tabularis Blog`,
        description: `All Tabularis blog posts tagged with "${category}".`,
    };
}

export default async function CategoryPage({params}: {params: Promise<{category: string}>}) {
    const {category} = await params;
    const posts = getPostsByTag(category);

    if (!posts.length) notFound();

    return <BlogArchive posts={posts} activeTag={category} />;
}
