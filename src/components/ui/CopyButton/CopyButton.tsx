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
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <button type="button" className={clsx(styles.button, className)} onClick={handleCopy} aria-label="Copy ">
            {copied ? <CheckIcon /> : icon}
        </button>
    );
}
