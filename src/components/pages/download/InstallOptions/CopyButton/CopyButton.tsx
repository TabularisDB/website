'use client';

import {useState} from 'react';
import {CheckIcon, CopyIcon} from 'lucide-react';
import styles from './CopyButton.module.scss';

interface CopyButtonProps {
    text: string;
}

export function CopyButton({text}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <button type="button" className={styles.button} onClick={handleCopy} aria-label="Copy to clipboard">
            {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
    );
}
