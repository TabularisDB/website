'use client';

import {useEffect, useRef, useState, useCallback} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import clsx from 'clsx';
import {searchIndex, type SearchDoc} from '@/lib/search';
import {trackSiteSearch} from '@/lib/analytics';
import styles from './SearchModal.module.scss';

type SearchResult = {
    type: 'post' | 'wiki' | 'plugin' | 'page';
    slug: string;
    title: string;
    excerpt: string;
    meta: string;
    badge?: string;
    url?: string;
    score: number;
};

const TYPE_CONFIG = {
    post: {label: 'Blog', color: 'var(--color-accent-amber)', glyph: '\u2726'},
    wiki: {label: 'Wiki', color: 'var(--color-accent-teal)', glyph: '\u25C8'},
    plugin: {label: 'Plugin', color: 'var(--color-accent-purple)', glyph: '\u2B21'},
    page: {label: 'Guide', color: 'var(--color-accent-blue)', glyph: null},
} as const;

const SUGGESTIONS: ({label: string; query: string} | {label: string; href: string})[] = [
    {label: 'Installation guide', query: 'Install'},
    {label: 'DBeaver alternative', query: 'Dbeaver alternative'},
    {label: 'SQL notebooks', query: 'SQL notebooks'},
    {label: 'SSH database client', query: 'SSH database client'},
    {label: 'Plugin registry', query: 'Plugin'},
    {label: 'Configuration', query: 'Config'},
    {label: 'Getting started', query: 'Getting started'},
    {label: 'Download', href: '/download'},
];

function ResultGlyph({type}: {type: SearchResult['type']}) {
    if (type === 'page') {
        return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M7 3.75h7.5L19.25 8.5v11.75a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15.5a1 1 0 0 1 1-1Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
                <path d="M14.5 3.75V8.5h4.75" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M9 12h6M9 15.5h6M9 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        );
    }
    return <>{TYPE_CONFIG[type].glyph}</>;
}

export function SearchModal() {
    const pathname = usePathname();
    const router = useRouter();
    const wikiOnly = pathname.startsWith('/wiki');

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [searching, setSearching] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
    const pendingSearchRef = useRef<{keyword: string; category: string | false; count: number} | null>(null);
    const lastTrackedSearchRef = useRef('');

    const flushSearchTracking = useCallback(() => {
        const pending = pendingSearchRef.current;
        if (!pending || pending.keyword === lastTrackedSearchRef.current) return;
        lastTrackedSearchRef.current = pending.keyword;
        trackSiteSearch(pending.keyword, pending.category, pending.count);
    }, []);

    const closeModal = useCallback(() => {
        flushSearchTracking();
        setOpen(false);
        setActiveIndex(-1);
    }, [flushSearchTracking]);

    const resetAndOpen = useCallback(() => {
        setOpen(true);
        setQuery('');
        setActiveIndex(-1);
        lastTrackedSearchRef.current = '';
    }, []);

    const navigateResult = useCallback(
        (result: SearchResult) => {
            closeModal();
            if (result.type === 'plugin' && result.url) {
                window.open(result.url, '_blank');
                return;
            }
            const path =
                result.type === 'post'
                    ? `/blog/${result.slug}`
                    : result.type === 'page' && result.url
                      ? result.url
                      : `/wiki/${result.slug}`;
            router.push(path);
        },
        [closeModal, router],
    );

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const trimmed = query.trim();
        if (!trimmed) {
            setResults([]);
            setSearching(false);
            pendingSearchRef.current = null;
            return;
        }

        setSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const oramaResults = await searchIndex(trimmed, wikiOnly ? 'wiki' : undefined);
                const mapped: SearchResult[] = oramaResults.hits.map((hit) => {
                    const doc = hit.document as unknown as SearchDoc;
                    return {
                        type: doc.type,
                        slug: doc.slug,
                        title: doc.title,
                        excerpt: doc.excerpt,
                        meta: doc.meta,
                        badge: doc.badge || undefined,
                        url: doc.url || undefined,
                        score: hit.score,
                    };
                });
                setResults(mapped);
                pendingSearchRef.current = {
                    keyword: trimmed,
                    category: wikiOnly ? 'wiki' : false,
                    count: mapped.length,
                };
            } catch {
                setResults([]);
                pendingSearchRef.current = null;
            } finally {
                setSearching(false);
            }
        }, 150);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, wikiOnly]);

    useEffect(() => {
        if (!query.trim() || searching) return;
        const timer = setTimeout(flushSearchTracking, 1200);
        return () => clearTimeout(timer);
    }, [query, searching, results, flushSearchTracking]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                resetAndOpen();
            }
            if (e.key === 'Escape') closeModal();
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeModal, resetAndOpen]);

    useEffect(() => {
        document.addEventListener('openSearch', resetAndOpen);
        return () => document.removeEventListener('openSearch', resetAndOpen);
    }, [resetAndOpen]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    useEffect(() => {
        setActiveIndex(-1);
    }, [query]);

    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const item = listRef.current.children[activeIndex] as HTMLElement;
            item?.scrollIntoView({block: 'nearest'});
        }
    }, [activeIndex]);

    function handleKeyboardNav(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!results.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            navigateResult(results[activeIndex]);
        }
    }

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) closeModal();
    }

    const isEmpty = query.trim() && results.length === 0 && !searching;
    const showSuggestions = !query.trim() && !wikiOnly;

    return (
        <div className={clsx(styles.overlay, open && styles.open)} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <span className={styles.iconWrap}>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </span>
                    <input
                        ref={inputRef}
                        className={styles.input}
                        type="text"
                        placeholder={wikiOnly ? 'Search docs...' : 'Search wiki, blog, guides, plugins...'}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyboardNav}
                        autoComplete="off"
                        spellCheck={false}
                    />
                    {query && (
                        <button
                            className={styles.clearBtn}
                            onClick={() => setQuery('')}
                            type="button"
                            aria-label="Clear"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {showSuggestions && (
                    <div className={styles.suggestions}>
                        <p className={styles.sectionLabel}>Quick searches</p>
                        <div className={styles.chips}>
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s.label}
                                    className={styles.chip}
                                    type="button"
                                    onClick={() => {
                                        if ('href' in s) {
                                            closeModal();
                                            router.push(s.href);
                                        } else {
                                            setQuery(s.query);
                                        }
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {results.length > 0 && (
                    <>
                        <p className={clsx(styles.sectionLabel, styles.sectionLabelResults)}>
                            {results.length} result{results.length !== 1 ? 's' : ''}
                        </p>
                        <ul className={styles.results} ref={listRef}>
                            {results.map((result, i) => {
                                const cfg = TYPE_CONFIG[result.type];
                                return (
                                    <li
                                        key={`${result.type}-${result.slug}`}
                                        className={clsx(styles.resultItem, i === activeIndex && styles.active)}
                                        onClick={() => navigateResult(result)}
                                        onMouseEnter={() => setActiveIndex(i)}
                                    >
                                        <span className={styles.resultTypeIcon} style={{color: cfg.color}}>
                                            <ResultGlyph type={result.type} />
                                        </span>
                                        <div className={styles.resultBody}>
                                            <div className={styles.resultTitle}>{result.title}</div>
                                            {result.excerpt && (
                                                <div className={styles.resultExcerpt}>{result.excerpt}</div>
                                            )}
                                        </div>
                                        <div className={styles.resultAside}>
                                            <span
                                                className={styles.resultTypeBadge}
                                                style={{color: cfg.color, borderColor: cfg.color}}
                                            >
                                                {cfg.label}
                                            </span>
                                            {(result.type === 'post' || result.type === 'plugin') && result.badge && (
                                                <span className={styles.resultRelease}>{result.badge}</span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}

                {isEmpty && (
                    <div className={styles.empty}>
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={styles.emptyIcon}
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <span>
                            No results for <strong>&ldquo;{query}&rdquo;</strong>
                        </span>
                    </div>
                )}

                <div className={styles.footer}>
                    <span className={styles.hint}>
                        <kbd>&uarr;&darr;</kbd> navigate
                    </span>
                    <span className={styles.hint}>
                        <kbd>&crarr;</kbd> open
                    </span>
                    <span className={styles.hint}>
                        <kbd>Esc</kbd> close
                    </span>
                    <a className={styles.poweredBy} href="https://orama.com" target="_blank" rel="noopener noreferrer">
                        Search by <strong>Orama</strong>
                    </a>
                </div>
            </div>
        </div>
    );
}
