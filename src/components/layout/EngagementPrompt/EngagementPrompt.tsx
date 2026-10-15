'use client';

import {Button} from '@/components/ui/Button/Button';
import {CloseButton} from '@/components/ui/CloseButton/CloseButton';
import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {SURVEY_STORAGE_KEY, SurveyForm} from '@/components/ui/SurveyForm/SurveyForm';
import {trackEvent} from '@/lib/analytics';
import {formatStars, REPO_STARS} from '@/lib/github';
import {SURVEY_CONFIGURED} from '@/lib/siteConfig';
import {SOCIAL_URLS} from '@/lib/social';
import {StarIcon} from 'lucide-react';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
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
    const shownRef = useRef(false);
    const pathname = usePathname();
    const excluded = isExcluded(pathname);
    const surveyOnly = pathname?.startsWith('/blog') ?? false;

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
            <CloseButton onClick={dismiss} size="sm" label="Dismiss" className={styles.surveyClose} />

            {content === 'survey' && <SurveyForm source="popup" />}

            {content === 'star' && (
                <div className={styles.promoCta}>
                    <span className={styles.promoCtaIcon}>
                        <GitHubIcon />
                    </span>
                    <p className={styles.promoCtaText}>
                        Enjoying Tabularis? A star on GitHub helps more developers discover it.
                    </p>
                    <Button
                        href={SOCIAL_URLS.github}
                        className={styles.promoCtaBtn}
                        onClick={() => trackEvent(EVENT_CATEGORY.star, 'click')}
                    >
                        <StarIcon size={16} aria-hidden="true" />
                        Star on GitHub · {formatStars(REPO_STARS)}
                    </Button>
                </div>
            )}

            {content === 'download' && (
                <div className={styles.promoCta}>
                    <span className={styles.promoCtaIcon}>
                        <Image src="/img/brand/tabularis-icon-color.svg" alt="" width={40} height={40} />
                    </span>
                    <p className={styles.promoCtaText}>
                        Haven&apos;t tried Tabularis yet? It&apos;s free to download for your platform.
                    </p>
                    <Button
                        href="/download"
                        className={styles.promoCtaBtn}
                        onClick={() => trackEvent(EVENT_CATEGORY.download, 'click')}
                    >
                        Download for free
                    </Button>
                </div>
            )}
        </div>
    );
}
