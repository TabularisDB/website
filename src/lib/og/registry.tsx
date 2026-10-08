import {getAllPosts, getAllAuthorHandles, getAllTags} from '@/lib/blog/posts';
import {AUTHORS, getAuthor} from '@/lib/blog/authors';
import {APP_VERSION} from '@/lib/download/version';
import {getAllInitiatives, type InitiativeStatus} from '@/lib/roadmap';
import {getSeoPagesBySection} from '@/lib/seo/seoPages';
import {OG_IMAGE_URL, SITE_URL} from '@/lib/siteConfig';
import {getAllVideoDemos} from '@/lib/videos';
import {getAllWikiPages} from '@/lib/wiki';
import {getKindSlug, getPublishedKinds} from '@/lib/plugins/kinds';
import {renderBlogPostOgImage} from './ogBlogPost';
import {renderSimpleOgImage} from './ogImageSimple';
import {renderScreenshotSplitOgImage} from './ogScreenshotSplit';
import {OG_SIZE} from './shared';

/**
 * Every Open Graph card of the site, keyed by the page path it belongs to.
 * The card for `/wiki/foo` is served at `/og/wiki/foo.png` (see app/og/[...path]/route.tsx)
 * and referenced from the page with `images: ogImages('/wiki/foo', alt)`.
 */
type OgCard = () => Promise<Response>;

const ROADMAP_STATUS: Record<InitiativeStatus, string> = {
    'in-progress': 'In progress',
    planned: 'Planned',
    done: 'Shipped',
};

export function getOgCards(): Record<string, OgCard> {
    const cards: Record<string, OgCard> = {
        // Static sections
        '/blog': () => renderSimpleOgImage({kicker: 'Blog', title: 'Releases, deep dives, updates'}),
        '/brand': () => renderSimpleOgImage({kicker: 'Brand assets', title: 'Logos, colors and fonts'}),
        '/changelog': () => renderSimpleOgImage({kicker: 'Changelog', title: 'Release history'}),
        '/contribute': () => renderSimpleOgImage({kicker: 'Contribute', title: 'Build Tabularis with us'}),
        '/contribute/leaderboard': () =>
            renderSimpleOgImage({kicker: 'Contributor leaderboard', title: 'Make an impact. Earn your place.'}),
        '/compare': () => renderSimpleOgImage({kicker: 'Compare', title: 'How Tabularis stacks up'}),
        '/download': () => renderSimpleOgImage({kicker: `Download · v${APP_VERSION}`, title: 'Get Tabularis'}),
        '/plugins': () => renderSimpleOgImage({kicker: 'Plugins', title: 'Community drivers and themes'}),
        '/plugins/bounties': () => renderSimpleOgImage({kicker: 'Bounties', title: 'Fund the plugin you need'}),
        '/roadmap': () => renderSimpleOgImage({kicker: 'Roadmap', title: "What's shipping next"}),
        '/solutions': () => renderSimpleOgImage({kicker: 'Solutions', title: 'Tabularis by use case'}),
        '/sponsors': () =>
            renderSimpleOgImage({kicker: 'Sponsors & supporters', title: 'Support open-source database tooling'}),
        '/subscribe': () => renderSimpleOgImage({kicker: 'Newsletter', title: 'Stay in the loop'}),
        '/survey': () => renderSimpleOgImage({kicker: 'Community survey', title: 'What should Tabularis build next?'}),
        '/wiki': () => renderSimpleOgImage({kicker: 'Docs', title: 'Documentation'}),
        '/demos': () =>
            renderScreenshotSplitOgImage({
                eyebrow: 'Product demos',
                title: 'See Tabularis in action',
                image: getAllVideoDemos()[0]?.poster,
            }),
    };

    // Dynamic pages
    for (const post of getAllPosts()) {
        cards[`/blog/${post.slug}`] = () => renderBlogPostOgImage(post.slug);
    }
    for (const handle of getAllAuthorHandles().filter((h) => h in AUTHORS)) {
        cards[`/blog/author/${handle}`] = () =>
            renderSimpleOgImage({kicker: 'Tabularis Blog · Author', title: getAuthor(handle).name});
    }
    for (const tag of getAllTags()) {
        cards[`/blog/category/${tag}`] = () =>
            renderSimpleOgImage({kicker: 'Tabularis Blog · Category', title: `#${tag} posts`});
    }
    for (const page of getAllWikiPages()) {
        cards[`/wiki/${page.slug}`] = () => renderSimpleOgImage({kicker: `Docs · ${page.category}`, title: page.title});
    }
    for (const section of ['compare', 'solutions'] as const) {
        const kicker = section === 'compare' ? 'Compare' : 'Solutions';
        for (const page of getSeoPagesBySection(section)) {
            cards[`/${section}/${page.slug}`] = () => renderSimpleOgImage({kicker, title: page.title});
        }
    }
    for (const {meta} of getAllInitiatives()) {
        cards[`/roadmap/${meta.slug}`] = () =>
            renderSimpleOgImage({kicker: `Roadmap · ${ROADMAP_STATUS[meta.status]}`, title: meta.title});
    }
    for (const kind of getPublishedKinds()) {
        cards[`/plugins/${getKindSlug(kind.key)}`] = () =>
            renderSimpleOgImage({kicker: 'Plugins', title: `Community ${kind.label.toLowerCase()}`});
    }
    for (const video of getAllVideoDemos()) {
        cards[`/demos/${video.slug}`] = () =>
            renderScreenshotSplitOgImage({eyebrow: 'Demo', title: video.title, image: video.poster});
    }

    return cards;
}

let knownPaths: Set<string> | null = null;

/**
 * `openGraph.images` / `twitter.images` for a page. Points to the page's card
 * from the registry, or falls back to the default /img/og.png when the page
 * has no card (with a build warning), so a share never ends up without image.
 */
export function ogImages(pagePath: string, alt: string) {
    const key = pagePath.replace(/\/$/, '') || '/';
    knownPaths ??= new Set(Object.keys(getOgCards()));
    if (!knownPaths.has(key)) {
        console.warn(`[og] no card registered for "${key}", using ${OG_IMAGE_URL}`);
        return [{url: OG_IMAGE_URL, ...OG_SIZE, alt}];
    }
    return [{url: `${SITE_URL}/og${key}.png`, ...OG_SIZE, alt}];
}
