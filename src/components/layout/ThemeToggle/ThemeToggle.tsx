'use client';

import {Button} from '@/components/ui/Button/Button';
import {
    applyTheme,
    readThemePreference,
    saveThemePreference,
    THEME_CHANGE_EVENT,
    THEME_PREFERENCES,
    type ThemePreference,
} from '@/lib/theme';
import clsx from 'clsx';
import {MonitorIcon, MoonIcon, SunIcon, SunMoonIcon} from 'lucide-react';
import {useEffect, useState} from 'react';
import styles from './ThemeToggle.module.scss';

const LABELS: Record<ThemePreference, string> = {
    system: 'System theme',
    light: 'Light theme',
    dark: 'Dark theme',
};

const ICONS = {system: MonitorIcon, light: SunIcon, dark: MoonIcon};

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({className}: ThemeToggleProps) {
    const [preference, setPreference] = useState<ThemePreference | null>(null);

    useEffect(() => {
        setPreference(readThemePreference());

        function onChange(event: Event) {
            setPreference((event as CustomEvent<ThemePreference>).detail);
        }
        document.addEventListener(THEME_CHANGE_EVENT, onChange);
        return () => document.removeEventListener(THEME_CHANGE_EVENT, onChange);
    }, []);

    // While following the system, react to OS-level light/dark switches.
    useEffect(() => {
        if (preference !== 'system') return;
        const media = window.matchMedia('(prefers-color-scheme: light)');
        const onSystemChange = () => applyTheme('system');
        media.addEventListener('change', onSystemChange);
        return () => media.removeEventListener('change', onSystemChange);
    }, [preference]);

    function cycle() {
        const current = preference ?? readThemePreference();
        const next = THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(current) + 1) % THEME_PREFERENCES.length];
        saveThemePreference(next);
        setPreference(next);
    }

    const Icon = preference ? ICONS[preference] : SunMoonIcon;
    const label = preference ? `${LABELS[preference]} (click to change)` : 'Change theme';

    return (
        <Button
            variant="outline"
            className={clsx(styles.toggle, className)}
            onClick={cycle}
            aria-label={label}
            title={preference ? LABELS[preference] : undefined}
        >
            <Icon aria-hidden="true" />
        </Button>
    );
}
