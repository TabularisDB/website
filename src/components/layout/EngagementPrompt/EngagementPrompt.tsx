'use client';

import {Button} from '@/components/ui/Button/Button';
import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {SURVEY_STORAGE_KEY} from '@/components/ui/SurveyForm/SurveyForm';
import {trackEvent} from '@/lib/analytics';
import {SURVEY_CONFIGURED} from '@/lib/siteConfig';
import {SOCIAL_URLS} from '@/lib/social';
import {DownloadIcon, MessagesSquareIcon} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {useCallback, useEffect, useRef, useState} from 'react';
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
    const promptRef = useRef<HTMLDivElement>(null);
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

    const dismiss = useCallback(() => {
        if (!content) return;
        if (content === 'survey') {
            try {
                localStorage.setItem(SURVEY_STORAGE_KEY, 'dismissed');
            } catch {
                // localStorage unavailable (private mode) — non-fatal.
            }
        }
        trackEvent(EVENT_CATEGORY[content], 'dismissed');
        setContent(null);
    }, [content]);

    useEffect(() => {
        if (!content) return;

        // Listens to click, not pointerdown, so a touch-scroll on mobile doesn't dismiss the prompt.
        // The cookie banner and modals (portaled outside the prompt) don't count as outside.
        const onClick = (e: MouseEvent) => {
            if (!(e.target instanceof Element)) return;
            if (promptRef.current?.contains(e.target) || e.target.closest('[data-cookie-consent], [data-modal]'))
                return;
            dismiss();
        };

        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, [content, dismiss]);

    if (excluded || !content) return null;

    return (
        <div
            ref={promptRef}
            className={styles.surveyPrompt}
            role="dialog"
            aria-label={content === 'survey' ? 'Quick product survey' : 'Tabularis quick promo'}
        >
            {content === 'survey' && (
                <div className={styles.banner}>
                    <p className={styles.promoCtaText}>
                        What should Tabularis build next? Tell us in a 2-minute survey.
                    </p>
                    <div className={styles.actions}>
                        <Button
                            variant="secondary"
                            size="sm"
                            href="/survey"
                            onClick={() => trackEvent(EVENT_CATEGORY.survey, 'click')}
                        >
                            <MessagesSquareIcon size={16} aria-hidden="true" />
                            Take the survey
                        </Button>
                        <button type="button" className={styles.textButton} onClick={dismiss}>
                            Not now
                        </button>
                    </div>
                </div>
            )}

            {content === 'star' && (
                <div className={styles.banner}>
                    <p className={styles.promoCtaText}>
                        Enjoying Tabularis? A star on GitHub helps more developers discover it.
                    </p>
                    <div className={styles.actions}>
                        <Button
                            variant="secondary"
                            size="sm"
                            href={SOCIAL_URLS.github}
                            onClick={() => trackEvent(EVENT_CATEGORY.star, 'click')}
                        >
                            <GitHubIcon />
                            Leave a star
                        </Button>
                        <button type="button" className={styles.textButton} onClick={dismiss}>
                            Not now
                        </button>
                    </div>
                </div>
            )}

            {content === 'download' && (
                <div className={styles.banner}>
                    <p className={styles.promoCtaText}>
                        Haven&apos;t tried Tabularis yet? It&apos;s free to download for your platform.
                    </p>
                    <div className={styles.actions}>
                        <Button
                            variant="secondary"
                            size="sm"
                            href="/download"
                            onClick={() => trackEvent(EVENT_CATEGORY.download, 'click')}
                        >
                            <DownloadIcon size={16} aria-hidden="true" />
                            Download
                        </Button>
                        <button type="button" className={styles.textButton} onClick={dismiss}>
                            Not now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
