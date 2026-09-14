import {JsonLd} from '@/components/layout/JsonLd';
import {VideoDetail} from '@/components/pages/demos/VideoDetail/VideoDetail';
import {VideosGrid} from '@/components/pages/demos/VideosGrid/VideosGrid';
import {buildBreadcrumbJsonLd, buildVideoObjectJsonLd} from '@/lib/seo';
import {getAllVideoDemos, getVideoDemoBySlug} from '@/lib/videos';
import {Metadata} from 'next';
import {notFound} from 'next/navigation';

interface PageProps {
    params: Promise<{slug: string}>;
}

export function generateStaticParams() {
    return getAllVideoDemos().map((video) => ({slug: video.slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {slug} = await params;
    const video = getVideoDemoBySlug(slug);
    if (!video) return {};

    return {
        title: `${video.title} | Tabularis Demo`,
        description: video.description,
        alternates: {canonical: `/videos/${video.slug}`},
        openGraph: {
            type: 'video.other',
            url: `/videos/${video.slug}`,
            title: `${video.title} | Tabularis Demo`,
            description: video.description,
            images: [video.poster],
            videos: [video.src],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${video.title} | Tabularis Demo`,
            description: video.description,
            images: [video.poster],
        },
    };
}

export default async function DemoDetail({params}: PageProps) {
    const {slug} = await params;
    const video = getVideoDemoBySlug(slug);
    if (!video) notFound();

    return <VideoDetail video={video} />;
}
