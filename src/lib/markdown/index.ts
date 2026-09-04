import {marked} from 'marked';
import {markedHighlight} from 'marked-highlight';
import {gfmHeadingId} from 'marked-gfm-heading-id';
import hljs from 'highlight.js/lib/common';
import {getAllPlugins, getLatestRelease} from '../plugins';
import {SOCIAL_URLS} from '../social';
import {APP_VERSION} from '../download/version';

// {{APP_VERSION}} in any Markdown content (posts, wiki, seo) is replaced with
// the current app version at build time — works inside code fences too, since
// the substitution runs before parsing. Keeps install commands pointing at the
// latest release without hand-editing content on every release.
marked.use({
    hooks: {
        preprocess(markdown: string) {
            return markdown.replaceAll('{{APP_VERSION}}', APP_VERSION);
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

function renderPluginCard(id: string): string {
    const plugin = getAllPlugins().find((p) => p.id === id);
    if (!plugin) return `<!-- plugin not found: ${id} -->`;

    const latestRelease = getLatestRelease(plugin);
    const authorName = plugin.author.includes('<') ? plugin.author.split('<')[0].trim() : plugin.author;
    const authorUrl = plugin.author.match(/<(.+)>/)?.[1];
    const authorHtml = authorUrl
        ? `<a href="${authorUrl}" target="_blank" rel="noopener noreferrer">${authorName}</a>`
        : authorName;
    const versionHint = latestRelease?.min_tabularis_version
        ? ` &middot; <span class="plugin-platforms">Requires Tabularis v${latestRelease.min_tabularis_version}</span>`
        : '';

    return `<div class="plugin-list">
  <div class="plugin-entry">
    <div class="plugin-entry-info">
      <div class="plugin-entry-header">
        <a href="${plugin.registry_url ?? plugin.homepage}" target="_blank" rel="noopener noreferrer" class="plugin-name">${plugin.name}</a>
        <span class="plugin-badge">v${plugin.latest_version}</span>
      </div>
      <p class="plugin-desc">${plugin.description}</p>
      <div class="plugin-meta">by ${authorHtml}${versionHint}</div>
    </div>
    <a href="${plugin.homepage}" target="_blank" rel="noopener noreferrer" class="plugin-name">Repo &rarr;</a>
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
    return `<a class="star-cta" href="${SOCIAL_URLS.github}" target="_blank" rel="noopener noreferrer">
  <span class="star-cta__mark">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.67 5.56.67 11.83c0 5.01 3.24 9.26 7.75 10.76.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.15.69-3.82-1.34-3.82-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.39-1.23.71-1.51-2.52-.29-5.17-1.26-5.17-5.61 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.44.11-3.01 0 0 .95-.3 3.12 1.16.9-.25 1.87-.38 2.83-.38.96 0 1.93.13 2.83.38 2.17-1.47 3.12-1.16 3.12-1.16.62 1.57.23 2.72.11 3.01.73.79 1.17 1.8 1.17 3.04 0 4.36-2.66 5.32-5.19 5.6.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.21.66.79.55 4.51-1.5 7.75-5.75 7.75-10.76C23.33 5.56 18.27.5 12 .5Z"/></svg>
  </span>
  <span class="star-cta__body">
    <strong>Finding Tabularis useful?</strong>
    <span>Star it on GitHub — it takes a second and helps more developers discover the project.</span>
  </span>
  <span class="star-cta__btn">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"/></svg>
    Star on GitHub
  </span>
</a>`;
}

export {marked};
