/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client';
import {Button} from '@/components/ui/Button/Button';
import {Modal} from '@/components/ui/Modal/Modal';
import clsx from 'clsx';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import promptStyles from '../EngagementPrompt/EngagementPrompt.module.scss';
import styles from './CookieConsent.module.scss';

type CookiePrefs = {
    necessary: true;
    measurement: boolean;
    marketing: boolean;
};

const STORAGE_KEY = 'tabularis-cookie-consent';
const MATOMO_URL = '//analytics.debbaweb.it/';
const MATOMO_SITE_ID = '4';

const CATEGORIES = [
    {
        key: 'necessary',
        label: 'Necessary',
        description:
            'Required for the site to work: your consent choice, prompt reminders and cookieless, anonymised page-view statistics.',
    },
    {
        key: 'measurement',
        label: 'Measurement',
        description:
            'Cookie-based Matomo analytics to recognise returning visitors. IP addresses stay anonymised and nothing is shared.',
    },
    {
        key: 'marketing',
        label: 'Marketing',
        description: 'Nothing is set today. Decide in advance, should we ever add a service that needs it.',
    },
] as const;

function initMatomo(cookieConsent: boolean) {
    if (typeof window === 'undefined') return;
    const _paq: unknown[][] = ((window as any)._paq = (window as any)._paq || []);

    if ((window as any).__matomoLoaded) {
        if (cookieConsent) {
            _paq.push(['setCookieConsentGiven']);
        } else {
            _paq.push(['forgetCookieConsentGiven']);
            _paq.push(['disableCookies']);
        }
        return;
    }

    (window as any).__matomoLoaded = true;

    if (cookieConsent) {
        _paq.push(['setCookieConsentGiven']);
    } else {
        _paq.push(['disableCookies']);
    }

    _paq.push(['setTrackerUrl', MATOMO_URL + 'matomo.php']);
    _paq.push(['setSiteId', MATOMO_SITE_ID]);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    const d = document;
    const g = d.createElement('script');
    const s = d.getElementsByTagName('script')[0];
    g.async = true;
    g.src = MATOMO_URL + 'matomo.js';
    s.parentNode!.insertBefore(g, s);
}

export function CookieConsent() {
    const [bannerOpen, setBannerOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [prefs, setPrefs] = useState({measurement: false, marketing: false});

    useEffect(() => {
        const stored = readPrefs();
        if (stored) setPrefs(stored);
        initMatomo(stored?.measurement ?? false);
        if (!stored) setBannerOpen(true);

        function handleManage() {
            const current = readPrefs();
            if (current) setPrefs(current);
            setSettingsOpen(true);
        }

        window.addEventListener('tabularis:manage-cookies', handleManage);
        return () => window.removeEventListener('tabularis:manage-cookies', handleManage);
    }, []);

    function save(measurement: boolean, marketing: boolean) {
        const stored: CookiePrefs = {necessary: true, measurement, marketing};
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        setPrefs({measurement, marketing});
        setBannerOpen(false);
        setSettingsOpen(false);
        initMatomo(measurement);
    }

    function closeSettings() {
        setPrefs(readPrefs() ?? {measurement: false, marketing: false});
        setSettingsOpen(false);
    }

    return (
        <>
            {bannerOpen && !settingsOpen && (
                <div
                    className={promptStyles.surveyPrompt}
                    role="dialog"
                    aria-label="Cookie preferences"
                    data-cookie-consent
                >
                    <div className={promptStyles.banner}>
                        <p className={promptStyles.promoCtaText}>
                            We use cookies to understand how the site is used and improve it.{' '}
                            <Link href="/cookie-policy">Learn more</Link>
                        </p>
                        <div className={promptStyles.actions}>
                            <Button variant="secondary" size="sm" onClick={() => save(true, true)}>
                                Accept
                            </Button>
                            <button
                                type="button"
                                className={clsx(promptStyles.textButton, styles.reject)}
                                onClick={() => save(false, false)}
                            >
                                Reject
                            </button>
                            <button
                                type="button"
                                className={promptStyles.textButton}
                                onClick={() => setSettingsOpen(true)}
                            >
                                Privacy settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Modal open={settingsOpen} onClose={closeSettings} title="Privacy settings">
                <Modal.Body>
                    <ul className={styles.categories}>
                        {CATEGORIES.map(({key, label, description}) => {
                            const locked = key === 'necessary';
                            const checked = locked || prefs[key];
                            return (
                                <li key={key} className={styles.category}>
                                    <div>
                                        <p className={styles.label}>{label}</p>
                                        <p className={styles.description}>{description}</p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={checked}
                                        aria-label={`${label} cookies`}
                                        disabled={locked}
                                        className={clsx(styles.switch, checked && styles.on)}
                                        onClick={() => !locked && setPrefs((p) => ({...p, [key]: !p[key]}))}
                                    >
                                        <span className={styles.thumb} />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </Modal.Body>
                <Modal.Actions>
                    <Button variant="secondary" onClick={closeSettings}>
                        Cancel
                    </Button>
                    <Button onClick={() => save(prefs.measurement, prefs.marketing)}>Save preferences</Button>
                </Modal.Actions>
            </Modal>
        </>
    );
}

function readPrefs(): Omit<CookiePrefs, 'necessary'> | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const prefs: CookiePrefs = JSON.parse(raw);
        return {measurement: Boolean(prefs.measurement), marketing: Boolean(prefs.marketing)};
    } catch {
        return null;
    }
}
