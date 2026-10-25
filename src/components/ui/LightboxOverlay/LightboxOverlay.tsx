import Image from 'next/image';
import styles from './LightboxOverlay.module.scss';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import {CloseButton} from '../CloseButton/CloseButton';

interface LightboxOverlayProps {
    src: string;
    alt: string;
    hasMultiple: boolean;
    counter?: string;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    onTouchStart?: (e: React.TouchEvent) => void;
    onTouchEnd?: (e: React.TouchEvent) => void;
}

export function LightboxOverlay({
    src,
    alt,
    hasMultiple,
    counter,
    onClose,
    onPrev,
    onNext,
    onTouchStart,
    onTouchEnd,
}: LightboxOverlayProps) {
    return (
        <div className={styles.overlay} onClick={onClose} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {hasMultiple && (
                <button
                    type="button"
                    className={styles.navPrev}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrev();
                    }}
                    aria-label="Previous image"
                >
                    <ArrowLeft />
                </button>
            )}

            <Image
                src={src}
                alt={alt}
                width={0}
                height={0}
                loading="eager"
                className={styles.img}
                onClick={(e) => e.stopPropagation()}
            />

            {hasMultiple && (
                <button
                    type="button"
                    className={styles.navNext}
                    onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                    }}
                    aria-label="Next image"
                >
                    <ArrowRight />
                </button>
            )}

            <CloseButton onClick={onClose} tone="onDark" className={styles.close} />

            {counter && (
                <div className={styles.footer}>
                    <span className={styles.counter}>{counter}</span>
                </div>
            )}
        </div>
    );
}
