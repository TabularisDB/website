import {JsonLd} from '@/components/layout/JsonLd';
import {buildBreadcrumbJsonLd, buildVideoObjectJsonLd} from '@/lib/seo';
import {getAllVideoDemos, getVideoDemoBySlug} from '@/lib/videos';
import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import styles from './DemoDetailPage.module.scss';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import clsx from 'clsx';
import {Button} from '@/components/ui/Button/Button';
import {ArrowRight, PlayIcon} from 'lucide-react';
import {VideoPlayer} from '@/components/ui/VideoPlayer/VideoPlayer';

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
        alternates: {canonical: `/demos/${video.slug}`},
        openGraph: {
            type: 'video.other',
            url: `/demos/${video.slug}`,
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

    const formattedEyebrow = video.slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

    return (
        <section className={clsx('container', styles.page)}>
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Product Demos', path: '/demos'},
                        {name: video.title, path: `/demos/${video.slug}`},
                    ]),
                    buildVideoObjectJsonLd(video),
                ]}
            />

            <Breadcrumbs crumbs={[{label: 'Demos', href: '/demos'}, {label: video.title}]} />

            <header className={clsx('page-header', styles.pageHeader)}>
                <span className="eyebrow">
                    <PlayIcon />
                    {formattedEyebrow}
                </span>
                <h2 className="title">{video.title}</h2>
                <p className="description">{video.description}</p>
            </header>

            <VideoPlayer
                src={video.src}
                poster={video.poster}
                wrapperClassName={styles.videoDemoPlayer}
                ariaLabel={video.title}
            />

            <Button href={video.relatedHref}>
                {video.relatedLabel} <ArrowRight size={16} />
            </Button>
        </section>
    );
}
