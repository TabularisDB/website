// Theme handling for a static export: there is no server to read a cookie,
// so the theme is resolved in the browser. THEME_INIT_SCRIPT runs inline in
// <head> before the first paint, which avoids a flash of the wrong theme.

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'tabularis-theme';
export const THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];

// What a first-time visitor gets. 'system' follows the OS setting; set it to
// 'dark' to keep the historical dark look unless the visitor opts in.
export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

export const THEME_CHANGE_EVENT = 'tabularis-theme-change';

export function isThemePreference(value: unknown): value is ThemePreference {
    return value === 'system' || value === 'light' || value === 'dark';
}

export function readThemePreference(): ThemePreference {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (isThemePreference(stored)) return stored;
    } catch {
        // localStorage unavailable (private mode, blocked storage): use the default.
    }
    return DEFAULT_THEME_PREFERENCE;
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
    if (preference !== 'system') return preference;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(preference: ThemePreference): ResolvedTheme {
    const resolved = resolveTheme(preference);
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.dataset.themePreference = preference;
    return resolved;
}

export function saveThemePreference(preference: ThemePreference) {
    try {
        if (preference === DEFAULT_THEME_PREFERENCE) localStorage.removeItem(THEME_STORAGE_KEY);
        else localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
        // Non-fatal: the choice simply won't persist across visits.
    }
    applyTheme(preference);
    document.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, {detail: preference}));
}

// Kept dependency-free and tiny: it is inlined into every page.
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY,
)});if(p!=="light"&&p!=="dark"&&p!=="system")p=${JSON.stringify(
    DEFAULT_THEME_PREFERENCE,
)};var t=p==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):p;var d=document.documentElement;d.dataset.theme=t;d.dataset.themePreference=p;}catch(e){}})();`;
