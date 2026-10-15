import {marked} from 'marked';
import {markedHighlight} from 'marked-highlight';
import {gfmHeadingId} from 'marked-gfm-heading-id';
import hljs from 'highlight.js/lib/common';
import {getAllPlugins, getLatestRelease} from '@/lib/plugins';
import {renderPluginKindsMarkdown} from '@/lib/plugins/kinds';
import {SOCIAL_URLS} from '@/lib/social';
import {APP_VERSION} from '@/lib/download/version';

// {{APP_VERSION}} in any Markdown content (posts, wiki, seo) is replaced with
// the current app version at build time — works inside code fences too, since
// the substitution runs before parsing. Keeps install commands pointing at the
// latest release without hand-editing content on every release.
//
// :::plugin-kinds::: expands to the per-kind manifest reference (headings,
// field tables, examples) from plugins/kinds.json. It is expanded here, as
// Markdown, so its headings get ids like any other heading on the page.
marked.use({
    hooks: {
        preprocess(markdown: string) {
            return markdown
                .replaceAll('{{APP_VERSION}}', APP_VERSION)
                .replace(/^:::plugin-kinds:::[ \t]*$/m, () => renderPluginKindsMarkdown());
        },
    },
});

marked.use(
    markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, {language}).value;
        },
    }),
);

marked.use(gfmHeadingId());

const EXTERNAL_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

function externalLink(href: string, label: string): string {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="plugin-link">${label}${EXTERNAL_ICON}</a>`;
}

function renderPluginCard(id: string): string {
    const plugin = getAllPlugins().find((p) => p.id === id);
    if (!plugin) return `<!-- plugin not found: ${id} -->`;

    const latestRelease = getLatestRelease(plugin);
    const authorName = plugin.author.split('<')[0].trim();

    const meta = [
        `Developed by ${authorName}`,
        latestRelease?.min_tabularis_version ? `Requires Tabularis v${latestRelease.min_tabularis_version}` : '',
    ]
        .filter(Boolean)
        .join(' &middot; ');

    const links = [
        plugin.registry_url ? externalLink(plugin.registry_url, 'Plugin page') : '',
        externalLink(plugin.homepage, 'Source code'),
    ].join('');

    return `<div class="plugin-list">
  <div class="plugin-entry">
    <div class="plugin-entry-info">
      <div class="plugin-entry-header">
        <strong class="plugin-name">${plugin.name}</strong>
        <span class="plugin-badge">v${plugin.latest_version}</span>
      </div>
      <p class="plugin-desc">${plugin.description}</p>
      <p class="plugin-meta">${meta}</p>
    </div>
    <div class="plugin-links">${links}</div>
  </div>
</div>`;
}

marked.use({
    extensions: [
        {
            name: 'pluginCard',
            level: 'block',
            start(src: string) {
                return src.indexOf(':::plugin');
            },
            tokenizer(src: string) {
                const match = src.match(/^:::plugin\s+(\S+):::\s*(?:\n|$)/);
                if (match) {
                    return {type: 'pluginCard', raw: match[0], pluginId: match[1]};
                }
            },
            renderer(token) {
                return renderPluginCard(token['pluginId'] as string);
            },
        },
        {
            name: 'newsletter',
            level: 'block',
            start(src: string) {
                return src.indexOf(':::newsletter');
            },
            tokenizer(src: string) {
                const match = src.match(/^:::newsletter:::\s*(?:\n|$)/);
                if (match) {
                    return {type: 'newsletter', raw: match[0]};
                }
            },
            renderer() {
                return `<div data-newsletter></div>`;
            },
        },
        {
            name: 'starCta',
            level: 'block',
            start(src: string) {
                return src.indexOf(':::star');
            },
            tokenizer(src: string) {
                const match = src.match(/^:::star:::\s*(?:\n|$)/);
                if (match) {
                    return {type: 'starCta', raw: match[0]};
                }
            },
            renderer() {
                return renderStarCta();
            },
        },
    ],
});

function renderStarCta(): string {
    return `<div class="star-cta">
  <span class="star-cta__body">
    <strong class="star-cta__title">Finding Tabularis useful?</strong>
    <span class="star-cta__text">A star on GitHub takes a second and helps more developers discover the project.</span>
  </span>
  <a class="star-cta__button" href="${SOCIAL_URLS.github}" target="_blank" rel="noopener noreferrer">
<svg class="star-cta__star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>    Star on GitHub
  </a>
</div>`;
}

export {marked};
