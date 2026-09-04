import styles from './LightboxOverlay.module.scss';

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
                    &#8592;
                </button>
            )}

            <img src={src} alt={alt} className={styles.img} onClick={(e) => e.stopPropagation()} />

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
                    &#8594;
                </button>
            )}

            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                &times;
            </button>

            {counter && (
                <div className={styles.footer}>
                    <span className={styles.counter}>{counter}</span>
                </div>
            )}
        </div>
    );
}
