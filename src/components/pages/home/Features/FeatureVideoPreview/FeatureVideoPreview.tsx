'use client';

import {useEffect, useRef, useState} from 'react';
import styles from './FeatureVideoPreview.module.scss';

interface FeatureVideoPreviewProps {
    poster: string;
    src: string;
}

export function FeatureVideoPreview({poster, src}: FeatureVideoPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {threshold: 0.5});
        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (inView) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    }, [inView]);

    return (
        <div className={styles.wrapper}>
            <video
                ref={videoRef}
                className={styles.video}
                poster={poster}
                src={src}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
            />
        </div>
    );
}
