export interface ClosingCtaContent {
    title: string;
    description: string;
}

const DEFAULT_CONTENT: ClosingCtaContent = {
    title: 'Looking for a database client instead?',
    description:
        "The page is gone, Tabularis isn't. Free and open source (Apache 2.0). Download it for Windows, macOS, or Linux, and a star on GitHub helps more developers find it.",
};

const CONTENT_BY_PATH: Record<string, ClosingCtaContent> = {
    '/': {
        title: 'No trial. No account. Just the app.',
        description:
            'Free and open source (Apache 2.0). Download it for Windows, macOS, Linux, or Docker. If it looks useful, a star on GitHub helps more developers discover it.',
    },
};

export function getClosingCtaContent(pathname: string): ClosingCtaContent {
    const match = Object.keys(CONTENT_BY_PATH)
        .filter((key) => pathname === key || pathname.startsWith(`${key}/`))
        .sort((a, b) => b.length - a.length)[0];

    return match ? CONTENT_BY_PATH[match] : DEFAULT_CONTENT;
}
