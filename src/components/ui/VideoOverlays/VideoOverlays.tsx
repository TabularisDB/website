import {Loader2, AlertTriangle, RotateCw} from 'lucide-react';
import styles from './VideoOverlays.module.scss';

export function VideoLoaderOverlay() {
    return (
        <div className={styles.loader} aria-hidden="true">
            <Loader2 className={styles.loaderIcon} />
        </div>
    );
}

interface VideoErrorOverlayProps {
    onRetry?: () => void;
    hidden?: boolean;
}

export function VideoErrorOverlay({onRetry, hidden = false}: VideoErrorOverlayProps) {
    return (
        <div className={styles.error} hidden={hidden} role="alert">
            <AlertTriangle className={styles.errorIcon} />
            <p className={styles.errorText}>Video unavailable</p>
            <button type="button" className={styles.errorRetry} onClick={onRetry}>
                <RotateCw className={styles.errorRetryIcon} />
                Retry
            </button>
        </div>
    );
}
