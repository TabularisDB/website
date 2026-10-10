import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {marked} from '@/lib/markdown';
import {DATA_CONTROLLER} from '@/lib/siteConfig';
import {SOCIAL_URLS} from '@/lib/social';

const LEGAL_DIR = path.join(process.cwd(), 'content/legal');

export type LegalSlug = 'cookie-policy' | 'privacy-policy';

export interface LegalPageData {
    title: string;
    updated: string;
    html: string;
}

const PLACEHOLDERS: Record<string, string> = {
    CONTROLLER_NAME: DATA_CONTROLLER.name,
    CONTROLLER_ADDRESS: DATA_CONTROLLER.address,
    CONTROLLER_VAT: DATA_CONTROLLER.vat,
    CONTROLLER_EMAIL: DATA_CONTROLLER.email,
    GITHUB_URL: SOCIAL_URLS.github,
    DISCORD_URL: SOCIAL_URLS.discord,
};

function fillPlaceholders(markdown: string, slug: string): string {
    return markdown.replace(/\{\{([A-Z_]+)\}\}/g, (match, key: string) => {
        if (key === 'APP_VERSION') return match;
        const value = PLACEHOLDERS[key];
        if (value === undefined) throw new Error(`Unknown placeholder ${match} in content/legal/${slug}.md`);
        return value;
    });
}

function postProcess(html: string): string {
    return html
        .replace(/<table>/g, '<div class="table-scroll"><table>')
        .replace(/<\/table>/g, '</table></div>')
        .replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
}

export function getLegalPage(slug: LegalSlug): LegalPageData {
    const raw = fs.readFileSync(path.join(LEGAL_DIR, `${slug}.md`), 'utf8');
    const {data, content} = matter(raw);
    for (const field of ['title', 'updated'] as const) {
        if (typeof data[field] !== 'string') throw new Error(`content/legal/${slug}.md: missing "${field}"`);
    }
    const html = marked.parse(fillPlaceholders(content, slug), {async: false}) as string;
    return {title: data.title, updated: data.updated, html: postProcess(html)};
}
