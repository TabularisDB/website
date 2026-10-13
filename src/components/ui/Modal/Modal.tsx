'use client';

import {CloseButton} from '@/components/ui/CloseButton/CloseButton';
import {useScrollLock} from '@/hooks/useScrollLock';
import clsx from 'clsx';
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
 * Closes on Escape and on a click outside the panel. Content goes in Modal.Body,
 * buttons in Modal.Actions.
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

    useScrollLock(open);

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
                        <CloseButton onClick={onClose} />
                    </div>
                    {children}
                </div>
            )}
        </div>,
        document.body,
    );
}

interface ModalPartProps {
    children?: ReactNode;
    className?: string;
}

function ModalBody({children, className}: ModalPartProps) {
    return <div className={clsx(styles.body, className)}>{children}</div>;
}

interface ModalSectionProps extends ModalPartProps {
    title: ReactNode;
    icon?: ReactNode;
}

function ModalSection({title, icon, children, className}: ModalSectionProps) {
    return (
        <section className={clsx(styles.section, className)}>
            <h3 className={styles.sectionTitle}>
                {icon}
                {title}
            </h3>
            {children}
        </section>
    );
}

function ModalText({children, className}: ModalPartProps) {
    return <p className={clsx(styles.text, className)}>{children}</p>;
}

function ModalActions({children, className}: ModalPartProps) {
    return <div className={clsx(styles.actions, className)}>{children}</div>;
}

Modal.Body = ModalBody;
Modal.Section = ModalSection;
Modal.Text = ModalText;
Modal.Actions = ModalActions;
