import {getPostBySlug} from '@/lib/blog/posts';
import {renderCodeTerminalOgImage} from '@/lib/og/ogCodeTerminal';
import {renderSimpleOgImage} from '@/lib/og/ogImageSimple';
import {renderScreenshotSplitOgImage} from '@/lib/og/ogScreenshotSplit';
import {loadFonts, OG_SIZE, readPublicImage, renderOg, SplitLayout} from '@/lib/og/shared';
import {ImageResponse} from 'next/og';

/**
 * Per-post blog card, chosen from the post's `og` frontmatter:
 *   - `og.cover`                   → the ready-made image, full-bleed;
 *   - `og.template: code-terminal` → title + terminal mock;
 *   - `og.image`                   → title + screenshot (split layout), the default;
 *   - nothing                      → simple title card.
 * Every generated template shares the frame from ./shared (renderOg).
 */
export async function renderBlogPostOgImage(slug: string): Promise<ImageResponse> {
    const post = await getPostBySlug(slug);
    const og = post?.meta.og;
    const release = post?.meta.release || undefined;

    // Ready-made 1200×630 image, rendered full-bleed.
    const coverSrc = og?.cover ? readPublicImage(og.cover) : null;

    if (slug === 'vercel-open-source-program') {
        return renderVercelPartnershipOgImage();
    }

    if (coverSrc) {
        return new ImageResponse(
            <div style={{display: 'flex', width: OG_SIZE.width, height: OG_SIZE.height}}>
                <img src={coverSrc} alt="" width={OG_SIZE.width} height={OG_SIZE.height} style={{objectFit: 'cover'}} />
            </div>,
            {...OG_SIZE},
        );
    }

    if (og?.template === 'code-terminal') {
        return renderCodeTerminalOgImage({
            title: og.title,
            accent: og.accent,
            codeTitle: og.codeTitle,
            codeLines: og.codeLines,
        });
    }

    // Default: title on the left, the post's screenshot (`og.image`) on the right.
    if (og?.image) {
        return renderScreenshotSplitOgImage({
            title: og.title ?? post?.meta.title,
            accent: og.accent,
            image: og.image,
            frameless: og.frameless,
            release,
        });
    }

    // No screenshot available.
    return renderSimpleOgImage({
        kicker: release ? `Tabularis Blog · ${release}` : 'Tabularis Blog',
        title: post?.meta.title ?? 'Tabularis Blog',
    });
}

/** Vercel Open Source Program post: Vercel △ + Tabularis logo lockup in the shared frame. */
async function renderVercelPartnershipOgImage(): Promise<ImageResponse> {
    const fonts = await loadFonts({Urbanist: [500, 800]});
    const iconSrc = readPublicImage('/img/brand/tabularis-icon-color.svg');

    const tile = {
        width: 152,
        height: 152,
        borderRadius: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    } as const;

    return renderOg(
        <SplitLayout
            eyebrow="Tabularis Blog · Partnership"
            title="Tabularis joins the Vercel Open Source Program"
            visual={
                <div style={{display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32}}>
                    <div style={{...tile, background: '#ffffff'}}>
                        <svg width="94" height="80" viewBox="0 0 94 80">
                            <path d="M47 0 L94 80 L0 80 Z" fill="#000000" />
                        </svg>
                    </div>
                    <div style={{display: 'flex', fontSize: 56, color: '#475569'}}>+</div>
                    <div style={{...tile, background: '#0b0c0e', border: '1px solid rgba(255,255,255,0.12)'}}>
                        {iconSrc && <img src={iconSrc} width={100} height={100} alt="" />}
                    </div>
                </div>
            }
        />,
        {fonts},
    );
}
