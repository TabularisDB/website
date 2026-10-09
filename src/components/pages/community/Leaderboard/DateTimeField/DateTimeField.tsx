'use client';

import {useId, useState} from 'react';
import styles from './DateTimeField.module.scss';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "9:05", "905" or "0905" to "09:05"; null when it is not a valid time. */
function normalizeTime(input: string): string | null {
    const match = input.trim().match(/^(\d{1,2}):?(\d{2})$/);
    if (!match) return null;
    const time = `${match[1].padStart(2, '0')}:${match[2]}`;
    return TIME.test(time) ? time : null;
}

interface DateTimeFieldProps {
    label: string;
    /** "YYYY-MM-DDTHH:mm" */
    value: string;
    onChange: (value: string) => void;
}

/**
 * A date picker and a 24-hour time field. The native datetime-local input follows the
 * browser locale, which shows a 12-hour clock in the US: the time is typed as HH:mm instead.
 */
export function DateTimeField({label, value, onChange}: DateTimeFieldProps) {
    const id = useId();
    const [date = '', time = ''] = value.split('T');

    // The typed time, kept while it is incomplete; reset when the value changes from outside.
    const [draft, setDraft] = useState(time);
    const [lastTime, setLastTime] = useState(time);
    if (time !== lastTime) {
        setLastTime(time);
        setDraft(time);
    }

    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>
            <input
                id={id}
                type="date"
                className={styles.date}
                value={date}
                onChange={(event) => onChange(`${event.target.value}T${time || '00:00'}`)}
            />
            <input
                type="text"
                className={styles.time}
                value={draft}
                inputMode="numeric"
                maxLength={5}
                placeholder="HH:mm"
                aria-label={`${label} time, 24-hour`}
                onChange={(event) => {
                    const next = event.target.value;
                    setDraft(next);
                    if (TIME.test(next)) onChange(`${date}T${next}`);
                }}
                onBlur={() => {
                    const normalized = normalizeTime(draft);
                    if (normalized && normalized !== time) onChange(`${date}T${normalized}`);
                    setDraft(normalized ?? time);
                }}
            />
        </div>
    );
}
