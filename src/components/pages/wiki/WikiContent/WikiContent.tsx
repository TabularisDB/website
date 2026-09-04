'use client';

import {useRef, useState, useEffect, useCallback} from 'react';
import {enhanceWrappedVideo} from '@/lib/videos/videoLoader';
import {LightboxOverlay} from '@/components/ui/LightboxOverlay/LightboxOverlay';
import '@/styles/prose.scss';

interface LightboxState {
    images: {src: string; alt: string}[];
    index: number;
}

export function WikiContent({html}: {html: string}) {
    const ref = useRef<HTMLDivElement>(null);
    const [lightbox, setLightbox] = useState<LightboxState | null>(null);
    const touchStartX = useRef<number | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        const imgs = ref.current.querySelectorAll<HTMLImageElement>("img:not([src*='shields.io']):not([src*='badge'])");
        const imageList = Array.from(imgs).map((img) => ({
            src: img.getAttribute('src') ?? img.src,
            alt: img.alt,
        }));

        const cleanupFns: Array<() => void> = [];

        imgs.forEach((img, i) => {
            img.style.cursor = 'zoom-in';
            const handleClick = () => setLightbox({images: imageList, index: i});
            img.addEventListener('click', handleClick);
            cleanupFns.push(() => img.removeEventListener('click', handleClick));
        });

        ref.current.querySelectorAll<HTMLVideoElement>('video').forEach(enhanceWrappedVideo);

        return () => {
            cleanupFns.forEach((cleanup) => cleanup());
        };
    }, [html]);

    const close = useCallback(() => setLightbox(null), []);

    const prev = useCallback(() => {
        setLightbox((lb) => (lb ? {...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length} : lb));
    }, []);

    const next = useCallback(() => {
        setLightbox((lb) => (lb ? {...lb, index: (lb.index + 1) % lb.images.length} : lb));
    }, []);

    useEffect(() => {
        if (!lightbox) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightbox, close, prev, next]);

    useEffect(() => {
        if (!lightbox) return;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [lightbox]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (touchStartX.current === null) return;
            const diff = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(diff) > 50) diff < 0 ? next() : prev();
            touchStartX.current = null;
        },
        [next, prev],
    );

    return (
        <>
            <article ref={ref} id="post-content" className="post-content" dangerouslySetInnerHTML={{__html: html}} />

            {lightbox && (
                <LightboxOverlay
                    src={lightbox.images[lightbox.index].src}
                    alt={lightbox.images[lightbox.index].alt}
                    hasMultiple={lightbox.images.length > 1}
                    counter={
                        lightbox.images.length > 1 ? `${lightbox.index + 1} / ${lightbox.images.length}` : undefined
                    }
                    onClose={close}
                    onPrev={prev}
                    onNext={next}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                />
            )}
        </>
    );
}
