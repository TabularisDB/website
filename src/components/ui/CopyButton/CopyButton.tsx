'use client';

import clsx from 'clsx';
import {CheckIcon} from 'lucide-react';
import {useState} from 'react';
import styles from './CopyButton.module.scss';

interface CopyButtonProps {
    text: string;
    icon: React.ReactNode;
    className?: string;
}

export function CopyButton({text, icon, className}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error('Failed to copy to clipboard', error);
        }
    }

    return (
        <button
            type="button"
            className={clsx(styles.button, className)}
            onClick={() => void handleCopy()}
            aria-label="Copy"
        >
            {copied ? <CheckIcon /> : icon}
        </button>
    );
}
