'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import styles from './HeroVideo.module.scss';

interface HeroVideoPreviewProps {
    poster: string;
    posterSmall?: string;
    src: string;
    sizes?: string;
    eager?: boolean;
}

export function HeroVideo({
    poster,
    posterSmall,
    src,
    sizes = '(max-width: 960px) 100vw, 50vw',
    eager = true,
}: HeroVideoPreviewProps) {
    const [videoReady, setVideoReady] = useState(false);
    const [hovering, setHovering] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const preloadVideo = useCallback(() => {
        const video = videoRef.current;
        if (!video || videoReady) return;

        video.addEventListener('canplaythrough', () => setVideoReady(true), {once: true});
        video.load();
    }, [videoReady]);

    const handleEnter = useCallback(() => {
        preloadVideo();
        if (!window.matchMedia('(hover: hover)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        setHovering(true);
    }, [preloadVideo]);

    const handleLeave = useCallback(() => setHovering(false), []);

    const previewing = hovering && videoReady;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (previewing) {
            video.play().catch(() => {});
            return;
        }

        const timer = window.setTimeout(() => {
            video.pause();
            video.currentTime = 0;
        }, 1200);
        return () => window.clearTimeout(timer);
    }, [previewing]);

    return (
        <div
            className={styles.heroDemo}
            onPointerEnter={handleEnter}
            onPointerLeave={handleLeave}
            onTouchStart={preloadVideo}
        >
            <img
                src={poster}
                srcSet={posterSmall ? `${posterSmall} 800w, ${poster} 1592w` : undefined}
                sizes={posterSmall ? sizes : undefined}
                alt=""
                width="1592"
                height="1080"
                className={styles.heroDemoImage}
                decoding="async"
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : 'auto'}
            />

            <video
                ref={videoRef}
                className={clsx(styles.heroDemoPreview, previewing && styles.isPlaying)}
                src={src}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                tabIndex={-1}
            />
        </div>
    );
}
