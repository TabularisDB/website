'use client';

import {useEffect, useId, useRef, useState} from 'react';
import clsx from 'clsx';
import {SearchIcon} from 'lucide-react';
import styles from './IssueBoard.module.scss';

export interface FilterOption<T extends string> {
    value: T;
    label: string;
    count?: number;
}

export interface FilterOptionGroup<T extends string> {
    key: string;
    label: string;
    options: FilterOption<T>[];
}

interface FilterSelectProps<T extends string> {
    label: string;
    value: T;
    onChange: (value: T) => void;
    /** Ungrouped options, listed first (e.g. "All projects"). */
    options: FilterOption<T>[];
    groups?: FilterOptionGroup<T>[];
    /** Placeholder of the search field; the dropdown has no search field without it. */
    searchPlaceholder?: string;
}

/** The board's dropdown: optional search, optional group headings, keyboard navigation. */
export function FilterSelect<T extends string>({
    label,
    value,
    onChange,
    options,
    groups = [],
    searchPlaceholder,
}: FilterSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const listId = useId();

    const normalized = query.trim().toLowerCase();
    const matches = (option: FilterOption<T>) => option.label.toLowerCase().includes(normalized);
    const visibleOptions = options.filter(matches);
    const visibleGroups = groups
        .map((group) => ({...group, options: group.options.filter(matches)}))
        .filter((group) => group.options.length > 0);
    const flat = [...visibleOptions, ...visibleGroups.flatMap((group) => group.options)];
    const selected = [...options, ...groups.flatMap((group) => group.options)].find((option) => option.value === value);

    useEffect(() => {
        if (!open) return;
        (searchPlaceholder ? inputRef.current : listRef.current)?.focus();
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open, searchPlaceholder]);

    useEffect(() => setActive(0), [normalized]);

    const optionId = (option: T) => `${listId}-${option}`;
    const activeValue = flat[active]?.value;
    useEffect(() => {
        if (open && activeValue) document.getElementById(optionId(activeValue))?.scrollIntoView({block: 'nearest'});
        // optionId only depends on listId, which is stable.
    }, [open, activeValue]);

    const toggle = () => {
        setQuery('');
        setActive(Math.max(flat.findIndex((option) => option.value === value), 0));
        setOpen((prev) => !prev);
    };

    const pick = (option: T) => {
        onChange(option);
        setOpen(false);
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((i) => Math.min(i + 1, flat.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (activeValue) pick(activeValue);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    };

    const renderOption = (option: FilterOption<T>) => (
        <li
            key={option.value}
            id={optionId(option.value)}
            role="option"
            aria-selected={value === option.value}
            className={clsx(
                styles.comboOption,
                activeValue === option.value && styles.comboOptionActive,
                value === option.value && styles.comboOptionSelected,
            )}
            onPointerMove={() => setActive(flat.indexOf(option))}
            onClick={() => pick(option.value)}
        >
            <span>{option.label}</span>
            {option.count !== undefined && <span className={styles.pillCount}>{option.count}</span>}
        </li>
    );

    return (
        <div className={styles.combo} ref={rootRef}>
            <button
                type="button"
                className={clsx(styles.select, styles.comboTrigger)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={label}
                onClick={toggle}
            >
                {selected?.label ?? value}
            </button>

            {open && (
                <div className={styles.comboPanel} onKeyDown={onKeyDown}>
                    {searchPlaceholder && (
                        <div className={styles.comboSearch}>
                            <SearchIcon aria-hidden="true" />
                            <input
                                ref={inputRef}
                                type="text"
                                role="combobox"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder={searchPlaceholder}
                                aria-label={searchPlaceholder}
                                aria-controls={listId}
                                aria-expanded="true"
                                aria-activedescendant={activeValue ? optionId(activeValue) : undefined}
                            />
                        </div>
                    )}
                    <ul
                        ref={listRef}
                        className={styles.comboList}
                        id={listId}
                        role="listbox"
                        aria-label={label}
                        tabIndex={-1}
                        aria-activedescendant={!searchPlaceholder && activeValue ? optionId(activeValue) : undefined}
                    >
                        {visibleOptions.map(renderOption)}
                        {visibleGroups.map((group) => (
                            <li key={group.key} role="presentation">
                                <div className={styles.comboGroup} aria-hidden="true">
                                    {group.label}
                                </div>
                                <ul role="group" aria-label={group.label}>
                                    {group.options.map(renderOption)}
                                </ul>
                            </li>
                        ))}
                        {flat.length === 0 && <li className={styles.comboEmpty}>No matches</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}
