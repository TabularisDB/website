import {ImageResponse} from 'next/og';
import {ReactElement, ReactNode} from 'react';
import fs from 'fs';
import path from 'path';

/* ─── CONSTANTS ─────────────────────────────────────────────────────────────── */

export const OG_SIZE = {width: 1200, height: 630} as const;
export const OG_CONTENT_TYPE = 'image/png' as const;

const TEAL_COLOR = '#35d0c0';
const TEXT_COLOR = '#eef0f3';

/* ─── Assets ─────────────────────────────────────────────────────────────── */

const MIME_BY_EXT: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    webp: 'image/webp',
};

/** Reads a file under /public and returns it as a data URI (null if missing). */
export function readPublicImage(filePath: string): string | null {
    try {
        const abs = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
        const ext = path.extname(abs).toLowerCase().slice(1);
        return `data:${MIME_BY_EXT[ext] ?? 'image/png'};base64,${fs.readFileSync(abs).toString('base64')}`;
    } catch {
        return null;
    }
}

/* ─── Fonts ──────────────────────────────────────────────────────────────── */

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type OgFonts = NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts'];

const FONT_PACKAGES = {
    Urbanist: 'urbanist',
    Outfit: 'outfit',
    'JetBrains Mono': 'jetbrains-mono',
} as const;

export type OgFontFamily = keyof typeof FONT_PACKAGES;

const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

function fetchFont(family: OgFontFamily, weight: FontWeight): Promise<ArrayBuffer | null> {
    const pkg = FONT_PACKAGES[family];
    const url = `https://cdn.jsdelivr.net/npm/@fontsource/${pkg}@5.3.0/files/${pkg}-latin-${weight}-normal.woff`;

    if (!fontCache.has(url)) {
        fontCache.set(
            url,
            fetch(url)
                .then((res) => (res.ok ? res.arrayBuffer() : null))
                .catch(() => null),
        );
    }
    return fontCache.get(url)!;
}

/** Loads the requested weights; a font that fails to download is skipped. */
export async function loadFonts(families: Partial<Record<OgFontFamily, FontWeight[]>>): Promise<OgFonts> {
    const entries = Object.entries(families) as [OgFontFamily, FontWeight[]][];
    const loaded = await Promise.all(
        entries.flatMap(([name, weights]) =>
            weights.map(async (weight) => {
                const data = await fetchFont(name, weight);
                return data ? {name, data, weight, style: 'normal' as const} : null;
            }),
        ),
    );
    return loaded.filter((font) => font !== null);
}

/* ─── Render ─────────────────────────────────────────────────────────────── */

/** Wraps a template in the shared frame (background, grid, logo) and renders it. */
export function renderOg(
    content: ReactNode,
    {fonts, fontFamily = 'Urbanist'}: {fonts: OgFonts; fontFamily?: OgFontFamily},
): ImageResponse {
    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                position: 'relative',
                background: '#030712',
                fontFamily: `${fontFamily}, system-ui, sans-serif`,
            }}
        >
            <GridBackground />
            <Logo />
            {content}
        </div>,
        {...OG_SIZE, fonts: fonts?.length ? fonts : undefined},
    );
}

/* ─── Frame pieces ───────────────────────────────────────────────────────── */

export function GridBackground(): ReactElement {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                width: OG_SIZE.width,
                height: OG_SIZE.height,
                display: 'flex',
                backgroundImage:
                    'linear-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.16) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                backgroundPosition: 'center center',
                maskImage:
                    'radial-gradient(ellipse closest-side at 50% 50%, #030712 0%, rgba(3, 7, 18, 0.7) 45%, transparent 100%)',
            }}
        />
    );
}

export function Kicker({children}: {children: ReactNode}): ReactElement {
    return (
        <div
            style={{
                color: TEAL_COLOR,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 1.1,
                lineHeight: 1.1,
                textTransform: 'uppercase',
                marginBottom: 16,
            }}
        >
            {children}
        </div>
    );
}

export function Logo(): ReactElement | null {
    const src = readPublicImage('/img/brand/tabularis-logo-color.svg');
    if (!src) return null;
    return <img src={src} height={40} alt="" style={{marginBottom: 36, position: 'absolute', top: 48, left: 48}} />;
}

export function Title({children, fontSize = 55}: {children: ReactNode; fontSize?: number}): ReactElement {
    return (
        <div
            style={{
                display: 'flex',
                fontSize,
                fontWeight: 500,
                lineHeight: 1.1,
                color: TEXT_COLOR,
            }}
        >
            {children}
        </div>
    );
}

export function SplitLayout({
    eyebrow,
    title,
    visual,
}: {
    eyebrow: string;
    title?: string;
    visual: ReactNode;
}): ReactElement {
    return (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 32,
                width: '100%',
                height: '100%',
                padding: 48,
            }}
        >
            <div style={{display: 'flex', flexDirection: 'column', width: 540, flexShrink: 0}}>
                <Kicker>{eyebrow}</Kicker>
                {title && <Title>{title}</Title>}
            </div>
            {visual}
        </div>
    );
}
