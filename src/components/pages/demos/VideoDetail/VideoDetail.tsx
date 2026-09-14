import {JsonLd} from '@/components/layout/JsonLd';
import {VideoPlayer} from '@/components/ui/VideoPlayer/VideoPlayer';
import {buildBreadcrumbJsonLd, buildVideoObjectJsonLd} from '@/lib/seo';
import {VideoDemo} from '@/lib/videos';
import styles from './VideoDetail.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';

interface VideoDetailProps {
    video: VideoDemo;
}

export function VideoDetail({video}: VideoDetailProps) {
    const formattedEyebrow = video.slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

    return (
        <section className={clsx('container', styles.page)}>
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Product Demos', path: '/videos'},
                        {name: video.title, path: `/videos/${video.slug}`},
                    ]),
                    buildVideoObjectJsonLd(video),
                ]}
            />

            <Breadcrumbs crumbs={[{label: 'Demos', href: '/demos'}, {label: video.title}]} />

            <header className={clsx('page-header', styles.pageHeader)}>
                <span className="eyebrow">{formattedEyebrow}</span>
                <h2 className="title">{video.title}</h2>
                <p className="description">{video.description}</p>
            </header>

            <VideoPlayer
                src={video.src}
                poster={video.poster}
                wrapperClassName={styles.videoDemoPlayer}
                ariaLabel={video.title}
            />

            <Button href={video.relatedHref} className={styles.actionButton}>
                {video.relatedLabel} <ArrowRight size={16} />
            </Button>
        </section>
    );
}
