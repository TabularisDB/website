import fs from 'fs';
import path from 'path';
import {getAllPlugins} from '@/lib/plugins';

export interface PluginKindField {
    key: string;
    // A string array is an enum: the allowed values.
    type: string | string[];
    required: boolean;
    description: string | null;
}

export interface PluginKind {
    key: string;
    label: string;
    description: string | null;
    catalogue_url: string | null;
    fields: PluginKindField[];
    example: {yaml: string; json: string} | null;
}

// plugins/kinds.json is written by scripts/fetch-app-data.mjs from the
// Tabularium registry (kind catalogue + per-kind manifest schema).
export function getPluginKinds(): PluginKind[] {
    const kindsPath = path.join(process.cwd(), 'plugins', 'kinds.json');
    if (!fs.existsSync(kindsPath)) {
        console.warn(`Plugin kinds not found at ${kindsPath}`);
        return [];
    }
    return (JSON.parse(fs.readFileSync(kindsPath, 'utf-8')) as {kinds: PluginKind[]}).kinds;
}

function fieldTableMd(fields: PluginKindField[]): string {
    if (fields.length === 0) return '_None._\n';
    const rows = fields.map((f) => {
        const type = Array.isArray(f.type) ? f.type.map((v) => `\`${v}\``).join(' \\| ') : `\`${f.type}\``;
        const desc = (f.description ?? '').replace(/\n+/g, ' ').replace(/\|/g, '\\|');
        return `| \`${f.key}\` | ${type} | ${f.required ? '✅' : '—'} | ${desc} |`;
    });
    return `| Field | Type | Required | Description |\n|---|---|---|---|\n${rows.join('\n')}\n`;
}

// Markdown for the :::plugin-kinds::: block: one section per kind with its
// extension fields and example manifest.
export function renderPluginKindsMarkdown(): string {
    const parts: string[] = [];
    for (const kind of getPluginKinds()) {
        parts.push(`## ${kind.label} (\`${kind.key}\`)`, '');
        if (kind.description) parts.push(kind.description, '');
        if (kind.catalogue_url) {
            parts.push(`Browse published ${kind.label.toLowerCase()} in the [registry catalogue](${kind.catalogue_url}).`, '');
        }
        if (kind.fields.length > 0) parts.push('### Extensions', '', fieldTableMd(kind.fields));
        if (kind.example) {
            parts.push('### Example (YAML)', '', '```yaml', kind.example.yaml.trim(), '```', '');
            parts.push('### Example (JSON)', '', '```json', kind.example.json.trim(), '```', '');
        }
    }
    return parts.join('\n');
}

// URL segment of a kind's catalogue page: /plugins/drivers, /plugins/themes.
// Plural, like the app's plugin folders (plugins/drivers, plugins/themes).
export function getKindSlug(key: string): string {
    return key.endsWith('s') ? key : `${key}s`;
}

// Kinds with at least one published plugin, the ones that get a page.
export function getPublishedKinds(): PluginKind[] {
    const plugins = getAllPlugins();
    return getPluginKinds().filter((kind) => plugins.some((p) => (p.kind ?? 'driver') === kind.key));
}
