import {Notice} from '@/components/ui/Notice/Notice';
import type {DownloadNote} from '@/lib/download/downloadConfig';
import styles from './DownloadNotices.module.scss';

const NIGHTLY_WARNING =
    'Preview build from the latest successful CI run. It may be unstable and does not auto-update through package managers.';

interface DownloadNoticesProps {
    nightly: boolean;
    note?: DownloadNote;
}

export function DownloadNotices({nightly, note}: DownloadNoticesProps) {
    if (!nightly && !note) return null;

    return (
        <div className={styles.notices}>
            {nightly && <Notice variant="warning">{NIGHTLY_WARNING}</Notice>}
            {note && (
                <Notice variant="warning">
                    {note.text} {note.command && <code>{note.command}</code>}
                </Notice>
            )}
        </div>
    );
}
