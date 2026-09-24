import {ImageResponse} from 'next/og';
import fs from 'fs';
import path from 'path';

export const OG_SIZE = {width: 1200, height: 630} as const;
export const OG_CONTENT_TYPE = 'image/png' as const;

function readPublicImage(filePath: string): string | null {
    try {
        const abs = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
        const buf = fs.readFileSync(abs);
        const ext = path.extname(abs).toLowerCase().slice(1);

        const mimeByExt: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            svg: 'image/svg+xml',
            webp: 'image/webp',
        };

        const mime = mimeByExt[ext] ?? 'image/png';
        return `data:${mime};base64,${buf.toString('base64')}`;
    } catch {
        return null;
    }
}

async function loadFont(weight: number) {
    const res = await fetch(`https://cdn.jsdelivr.net/fontsource/fonts/urbanist@latest/latin-${weight}-normal.woff`);
    if (!res.ok) return null;
    return res.arrayBuffer();
}

export interface SimpleOgOptions {
    title: string;
    kicker?: string;
}

export async function renderSimpleOgImage({title, kicker}: SimpleOgOptions): Promise<ImageResponse> {
    const logoSrc = readPublicImage('/img/logo.svg');
    const [font400, font800] = await Promise.all([loadFont(400), loadFont(800)]);

    const fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts'] = [];
    if (font400) fonts.push({name: 'Urbanist', data: font400, weight: 400});
    if (font800) fonts.push({name: 'Urbanist', data: font800, weight: 800});

    return new ImageResponse(
        <div
            style={{
                width: '1200px',
                height: '630px',
                background: '#020617',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            {/* Grid — horizontal lines */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '27px 27px',
                }}
            />
            {/* Grid — vertical lines */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '27px 27px',
                }}
            />

            {/* Glow — top center */}
            <div
                style={{
                    position: 'absolute',
                    top: '-200px',
                    left: '200px',
                    width: '800px',
                    height: '534px',
                    background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.25) 0%, transparent 65%)',
                    borderRadius: '50%',
                }}
            />
            {/* Glow — bottom left */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '-134px',
                    left: '-67px',
                    width: '534px',
                    height: '534px',
                    background: 'radial-gradient(circle at center, rgba(99,102,241,0.2) 0%, transparent 65%)',
                    borderRadius: '50%',
                }}
            />
            {/* Glow — right */}
            <div
                style={{
                    position: 'absolute',
                    top: '200px',
                    right: '-134px',
                    width: '667px',
                    height: '667px',
                    background: 'radial-gradient(circle at center, rgba(56,189,248,0.15) 0%, transparent 65%)',
                    borderRadius: '50%',
                }}
            />

            {/* Logo — top center */}
            {logoSrc && (
                <div
                    style={{
                        position: 'absolute',
                        top: '56px',
                        left: 0,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoSrc} height={60} alt="" style={{objectFit: 'contain'}} />
                </div>
            )}

            {/* Centered content */}
            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '0 80px',
                }}
            >
                {kicker && (
                    <div
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(15,23,42,0.7)',
                            border: '1px solid rgba(56,189,248,0.3)',
                            borderRadius: '100px',
                            color: '#38bdf8',
                            fontSize: '14px',

                            fontWeight: 800,
                            letterSpacing: '.4px',
                            textTransform: 'uppercase',
                            marginBottom: '20px',
                        }}
                    >
                        {kicker}
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        fontSize: '60px',
                        fontWeight: 800,
                        letterSpacing: '-.5px',
                        lineHeight: 1.1,
                        maxWidth: '1000px',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,.9)',
                    }}
                >
                    {title}
                </div>
            </div>

            {/* Footer */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '48px',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#64748b',
                    letterSpacing: '-0.2px',
                }}
            >
                tabularis.dev
            </div>
        </div>,
        {...OG_SIZE, fonts},
    );
}
