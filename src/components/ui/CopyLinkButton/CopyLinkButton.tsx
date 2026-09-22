'use client';

import {useState} from 'react';
import {Check, Link2} from 'lucide-react';
import clsx from 'clsx';
import styles from './CopyLinkButton.module.scss';

interface CopyLinkButtonProps {
    url: string;
    className?: string;
}

export function CopyLinkButton({url, className}: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {}
    }

    return (
        <button
            type="button"
            className={clsx(styles.button, className)}
            onClick={handleCopy}
            title="Copy link"
            aria-label="Copy link"
        >
            {copied ? <Check size={16} /> : <Link2 size={16} />}
        </button>
    );
}
