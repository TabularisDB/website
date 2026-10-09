'use client';

import clsx from 'clsx';
import {X} from 'lucide-react';
import {useEffect, useId, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import styles from './Modal.module.scss';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    /** Shown before the title. */
    icon?: ReactNode;
    /** Extra class on the panel, e.g. for its width. */
    className?: string;
    children: ReactNode;
}

/**
 * Dialog rendered in a portal: dark overlay, header with a title and a close button.
 * Closes on Escape and on a click outside the panel. The content handles its own padding.
 */
export function Modal({open, onClose, title, icon, className, children}: ModalProps) {
    const titleId = useId();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!mounted) return null;

    return createPortal(
        <div
            className={clsx(styles.overlay, open && styles.open)}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            aria-hidden={!open}
        >
            {open && (
                <div
                    className={clsx(styles.panel, className)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                >
                    <div className={styles.header}>
                        <span id={titleId} className={styles.title}>
                            {icon}
                            {title}
                        </span>
                        <button className={styles.close} onClick={onClose} type="button" aria-label="Close">
                            <X size={15} />
                        </button>
                    </div>
                    {children}
                </div>
            )}
        </div>,
        document.body,
    );
}
