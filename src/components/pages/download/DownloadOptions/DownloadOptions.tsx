import clsx from 'clsx';
import {AlertCircleIcon, CopyIcon} from 'lucide-react';
import {Button} from '@/components/ui/Button/Button';
import type {DownloadOption, PlatformConfig} from '@/lib/downloadConfig';
import styles from './DownloadOptions.module.scss';
import {CopyButton} from '../../../ui/CopyButton/CopyButton';

interface DownloadOptionsProps {
    options: DownloadOption[];
    note?: PlatformConfig['note'];
}

function Option({option}: {option: DownloadOption}) {
    if (option.kind === 'command') {
        const commands = Array.isArray(option.command) ? option.command : [option.command];
        return (
            <div className={clsx(styles.option, styles.optionCommand)}>
                <span className={styles.optionLabel}>{option.label}</span>
                <div className={styles.commandList}>
                    {commands.map((cmd) => (
                        <div key={cmd} className={styles.commandRow}>
                            <code className={styles.commandText}>{cmd}</code>
                            <CopyButton text={cmd} icon={<CopyIcon />} />
                        </div>
                    ))}
                </div>
                {option.warning && (
                    <p className={styles.commandWarning}>
                        {option.warning.text} <a href={option.warning.href}>{option.warning.linkText}</a>
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={clsx(styles.option, styles.optionFile)}>
            <span className={styles.optionLabel}>{option.label}</span>
            <Button size="sm" href={`/download/thank-you?url=${encodeURIComponent(option.url)}`}>
                {option.ext}
            </Button>
        </div>
    );
}

export function DownloadOptions({options, note}: DownloadOptionsProps) {
    return (
        <div className={styles.optionList}>
            {options.map((option) => (
                <Option key={option.label} option={option} />
            ))}

            {note && (
                <div className={styles.note}>
                    <span>
                        <AlertCircleIcon size={16} /> {note.text}
                    </span>
                    {note.command && <code>{note.command}</code>}
                </div>
            )}
        </div>
    );
}
