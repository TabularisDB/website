import {ImageResponse} from 'next/og';
import {loadFonts, readPublicImage, renderOg, SplitLayout} from './og.utils';

export interface ScreenshotSplitOgOptions {
    /** White first headline line. */
    title?: string;
    /** Cyan-gradient second headline line. */
    accent?: string;
    /** Subtitle under the headline. */
    claim?: string;
    /** Path under /public to the product screenshot shown on the right. */
    image?: string;
    /** Accepted for frontmatter compatibility; not rendered (no window chrome). */
    appLabel?: string;
    /** Optional version badge (e.g. "v0.13.4"). */
    release?: string;
    /** Drop the border/shadow frame around the image — for transparent artwork. */
    frameless?: boolean;
}

/**
 * Blog OG template sharing the code-terminal split layout — left text column,
 * right framed visual — but the right panel is a product screenshot inside a
 * window chrome instead of a terminal mock. Opt in per post via
 * `og.template: "screenshot-split"`.
 */
export async function renderScreenshotSplitOgImage({
    title,
    accent,
    image,
    release,
    frameless,
}: ScreenshotSplitOgOptions): Promise<ImageResponse> {
    const fonts = await loadFonts({Urbanist: [500, 800]});
    const shotSrc = image ? readPublicImage(image) : null;

    return renderOg(
        <SplitLayout
            eyebrow={release ? `Tabularis Blog | ${release}` : 'Tabularis Blog'}
            title={[title, accent].filter(Boolean).join(' ') || undefined}
            visual={
                <div style={{display: 'flex', flex: 1, alignItems: 'center'}}>
                    {shotSrc && (
                        <div
                            style={{
                                display: 'flex',
                                width: 620,
                                maxHeight: 520,
                                overflow: 'hidden',
                                alignItems: 'center',
                                background: '#11121c',
                                ...(frameless
                                    ? {}
                                    : {
                                          border: '1.6px solid rgba(148, 163, 184, 0.16)',
                                          borderRight: 'none',
                                          borderRadius: '8px 0 0 8px',
                                          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                                      }),
                            }}
                        >
                            <img src={shotSrc} alt="" style={{width: '100%', objectFit: 'cover'}} />
                        </div>
                    )}
                </div>
            }
        />,
        {fonts},
    );
}
