'use client';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {trackEvent} from '@/lib/analytics';
import {SURVEY_CONFIGURED} from '@/lib/siteConfig';
import {getRepoStars, formatStars} from '@/lib/github';
import {GitHubIcon} from '@/components/ui/Icons/Icons';
import {SOCIAL_URLS} from '@/lib/social';
import {SurveyForm, SURVEY_STORAGE_KEY} from '@/components/ui/SurveyForm/SurveyForm';
import styles from './EngagementPrompt.module.scss';

const EXCLUDED_PATHS = ['/survey', '/thanks-survey', '/thanks-newsletter', '/sponsors/confirm', '/download'];

function isExcluded(pathname: string | null): boolean {
    if (!pathname) return false;
    return EXCLUDED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const COOKIE_KEY = 'tabularis-cookie-consent';
const PROMO_STORAGE_KEY = 'tabularis-promo-cta-v1';
const PROMO_COOLDOWN_MS = 21 * 24 * 60 * 60 * 1000;
const MIN_DWELL_MS = 8000;
const SCROLL_TRIGGER = 0.6;

type Content = 'survey' | 'star' | 'download';

const EVENT_CATEGORY: Record<Content, string> = {
    survey: 'survey',
    star: 'invite-github-star',
    download: 'invite-download',
};

function promoInCooldown(): boolean {
    try {
        const raw = localStorage.getItem(PROMO_STORAGE_KEY);
        if (!raw) return false;
        const lastShown = Number(raw);
        return !Number.isNaN(lastShown) && Date.now() - lastShown < PROMO_COOLDOWN_MS;
    } catch {
        return false;
    }
}

export function EngagementPrompt() {
    const [content, setContent] = useState<Content | null>(null);
    const [stars, setStars] = useState<number | null>(null);
    const shownRef = useRef(false);
    const pathname = usePathname();
    const excluded = isExcluded(pathname);
    const surveyOnly = pathname?.startsWith('/blog') ?? false;

    useEffect(() => {
        getRepoStars().then(setStars);
    }, []);

    useEffect(() => {
        if (excluded) return;

        const surveyEligible = SURVEY_CONFIGURED && !localStorage.getItem(SURVEY_STORAGE_KEY);
        const promoEligible = !surveyOnly && !promoInCooldown();

        if (!surveyEligible && !promoEligible) return;

        const mountedAt = Date.now();

        const reveal = () => {
            if (shownRef.current) return;
            if (!localStorage.getItem(COOKIE_KEY)) return;
            if (Date.now() - mountedAt < MIN_DWELL_MS) return;

            shownRef.current = true;

            const pool: Array<'survey' | 'promo'> = [];
            if (surveyEligible) pool.push('survey');
            if (promoEligible) pool.push('promo');

            const picked = pool[Math.floor(Math.random() * pool.length)];
            const chosen: Content = picked === 'survey' ? 'survey' : Math.random() < 0.5 ? 'star' : 'download';

            setContent(chosen);

            if (chosen !== 'survey') {
                try {
                    localStorage.setItem(PROMO_STORAGE_KEY, String(Date.now()));
                } catch {
                    // localStorage unavailable (private mode) — non-fatal.
                }
            }

            trackEvent(EVENT_CATEGORY[chosen], 'shown');
            cleanup();
        };

        const onScroll = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollable <= 0) return;
            if (window.scrollY / scrollable >= SCROLL_TRIGGER) reveal();
        };

        const onMouseOut = (e: MouseEvent) => {
            if (!e.relatedTarget && e.clientY <= 0) reveal();
        };

        function cleanup() {
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('mouseout', onMouseOut);
        }

        window.addEventListener('scroll', onScroll, {passive: true});
        document.addEventListener('mouseout', onMouseOut);

        return cleanup;
    }, [excluded, surveyOnly]);

    if (excluded || !content) return null;

    const shown = content;

    function dismiss() {
        if (shown === 'survey') {
            try {
                localStorage.setItem(SURVEY_STORAGE_KEY, 'dismissed');
            } catch {
                // localStorage unavailable (private mode) — non-fatal.
            }
        }
        trackEvent(EVENT_CATEGORY[shown], 'dismissed');
        setContent(null);
    }

    return (
        <div
            className={styles.surveyPrompt}
            role="dialog"
            aria-label={content === 'survey' ? 'Quick product survey' : 'Tabularis quick promo'}
        >
            <button type="button" className={styles.surveyClose} onClick={dismiss} aria-label="Dismiss">
                ×
            </button>

            {content === 'survey' && <SurveyForm source="popup" />}

            {content === 'star' && (
                <div className={styles.promoCta}>
                    <span className={styles.promoCtaIcon}>
                        <GitHubIcon />
                    </span>
                    <p className={styles.promoCtaText}>
                        Enjoying Tabularis? A star on GitHub helps more developers discover it.
                    </p>
                    <a
                        href={SOCIAL_URLS.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.promoCtaBtn}
                        onClick={() => trackEvent(EVENT_CATEGORY.star, 'click')}
                    >
                        Star on GitHub{stars !== null ? ` · ${formatStars(stars)}` : ''}
                    </a>
                </div>
            )}

            {content === 'download' && (
                <div className={styles.promoCta}>
                    <span className={styles.promoCtaIcon}>
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </span>
                    <p className={styles.promoCtaText}>
                        Haven&apos;t tried Tabularis yet? It&apos;s free to download for your platform.
                    </p>
                    <Link
                        href="/download"
                        className={styles.promoCtaBtn}
                        onClick={() => trackEvent(EVENT_CATEGORY.download, 'click')}
                    >
                        Download for free
                    </Link>
                </div>
            )}
        </div>
    );
}
