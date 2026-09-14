'use client';
import {useState, useEffect} from 'react';
import Link from 'next/link';
import styles from './CookieConsent.module.scss';
import {Button} from '@/components/ui/Button/Button';
import {ArrowRight, CheckIcon, XIcon} from 'lucide-react';

type CookiePrefs = {
    necessary: true;
    measurement: boolean;
    marketing: boolean;
};

const STORAGE_KEY = 'tabularis-cookie-consent';
const MATOMO_URL = '//analytics.debbaweb.it/';
const MATOMO_SITE_ID = '4';

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
    const [visible, setVisible] = useState(false);
    const [measurement, setMeasurement] = useState(false);
    const [marketing, setMarketing] = useState(false);
    const [showDetailedView, setShowDetailedView] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        setShowDetailedView(!!raw);

        if (!raw) {
            initMatomo(false);
            setVisible(true);
        } else {
            try {
                const prefs: CookiePrefs = JSON.parse(raw);
                setMeasurement(prefs.measurement);
                setMarketing(prefs.marketing);
                initMatomo(prefs.measurement);
            } catch {
                initMatomo(false);
                setVisible(true);
            }
        }

        function handleManage() {
            const raw = localStorage.getItem(STORAGE_KEY);
            setShowDetailedView(!!raw);

            if (raw) {
                try {
                    const prefs: CookiePrefs = JSON.parse(raw);
                    setMeasurement(prefs.measurement);
                    setMarketing(prefs.marketing);
                } catch {
                    // leave current state
                }
            }
            setVisible(true);
        }

        window.addEventListener('tabularis:manage-cookies', handleManage);
        return () => window.removeEventListener('tabularis:manage-cookies', handleManage);
    }, []);

    function save(measurementVal: boolean, marketingVal: boolean) {
        const prefs: CookiePrefs = {
            necessary: true,
            measurement: measurementVal,
            marketing: marketingVal,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        setMeasurement(measurementVal);
        setMarketing(marketingVal);
        setVisible(false);
        initMatomo(measurementVal);
    }

    if (!visible) return null;

    return (
        <div className={styles.cookieModal} role="dialog" aria-label="Cookie preferences">
            <h3 className={styles.title}>{showDetailedView ? 'Customise your preferences' : 'Can we use cookies?'}</h3>

            {showDetailedView ? (
                <div className={styles.preferences}>
                    <div className={styles.cookieRow}>
                        <span className={styles.cookieLabel}>Necessary</span>
                        <div
                            className={`${styles.cookieToggle} ${styles.cookieToggleOn} ${styles.cookieToggleLocked}`}
                            title="Necessary cookies are always active"
                        >
                            <span className={styles.cookieToggleThumb} />
                        </div>
                    </div>

                    <div className={styles.cookieRow}>
                        <span className={styles.cookieLabel}>Measurement</span>
                        <button
                            className={`${styles.cookieToggle} ${measurement ? styles.cookieToggleOn : styles.cookieToggleOff}`}
                            onClick={() => setMeasurement((v) => !v)}
                            aria-pressed={measurement}
                            aria-label="Toggle measurement cookies"
                        >
                            <span className={styles.cookieToggleThumb} />
                        </button>
                    </div>

                    <div className={styles.cookieRow}>
                        <span className={styles.cookieLabel}>Marketing</span>
                        <button
                            className={`${styles.cookieToggle} ${marketing ? styles.cookieToggleOn : styles.cookieToggleOff}`}
                            onClick={() => setMarketing((v) => !v)}
                            aria-pressed={marketing}
                            aria-label="Toggle marketing cookies"
                        >
                            <span className={styles.cookieToggleThumb} />
                        </button>
                    </div>
                </div>
            ) : (
                <p className={styles.description}>
                    Tabularis uses cookies to improve your experience and for analytics.{' '}
                    <Link href="/cookie-policy">Read our cookie policy</Link> for more details.
                </p>
            )}

            <div className={styles.actions}>
                {showDetailedView ? (
                    <Button className={styles.button} onClick={() => save(measurement, marketing)}>
                        Save preferences <CheckIcon size={14} />
                    </Button>
                ) : (
                    <>
                        <Button className={styles.button} onClick={() => save(true, true)}>
                            Yes <CheckIcon size={14} />
                        </Button>
                        <Button className={styles.button} onClick={() => save(false, false)}>
                            No <XIcon size={14} />
                        </Button>
                    </>
                )}
            </div>

            {showDetailedView ? (
                <span className={styles.closeButton} onClick={() => setVisible(false)}>
                    Close <XIcon size={14} />
                </span>
            ) : (
                <span className={styles.customizeButton} onClick={() => setShowDetailedView(true)}>
                    Customize <ArrowRight size={14} />
                </span>
            )}
        </div>
    );
}
