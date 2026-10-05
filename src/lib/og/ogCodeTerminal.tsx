import {ImageResponse} from 'next/og';
import {loadFonts, renderOg, SplitLayout} from './shared';

// One Dark-ish palette.
const C = {
    punct: '#5c6370',
    key: '#c678dd',
    str: '#98c379',
    num: '#d19a66',
    text: '#abb2bf',
    req: '#38bdf8',
    res: '#4ade80',
    comment: '#5c6370',
};

interface Tok {
    text: string;
    color: string;
    bold?: boolean;
}

/**
 * Light JSON-ish tokenizer for the terminal mock. Recognises a line prefix
 * (`> ` request, `< ` response, `$ ` shell, `# ` comment) and colours quoted
 * strings (keys vs values by a trailing colon), numbers, and punctuation.
 */
function tokenizeCodeLine(line: string): Tok[] {
    const toks: Tok[] = [];
    const prefixMatch = line.match(/^(> |< |\$ |# )/);
    let rest = line;

    if (prefixMatch) {
        const p = prefixMatch[1];
        if (p === '# ') return [{text: line, color: C.comment}];
        const color = p === '> ' ? C.req : p === '< ' ? C.res : C.punct;
        toks.push({text: p, color, bold: p === '> ' || p === '< '});
        rest = line.slice(p.length);
    }

    const re = /("(?:[^"\\]|\\.)*")|(\d+(?:\.\d+)?)|([^"\d]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(rest)) !== null) {
        if (m[1]) {
            // Quoted string — a following ':' makes it a key.
            const after = rest.slice(re.lastIndex).match(/^\s*:/);
            toks.push({text: m[1], color: after ? C.key : C.str});
        } else if (m[2]) {
            toks.push({text: m[2], color: C.num});
        } else {
            toks.push({text: m[3], color: C.punct});
        }
    }
    return toks;
}

export interface CodeTerminalOgOptions {
    /** White first headline line. */
    title?: string;
    /** Cyan-gradient second headline line. */
    accent?: string;
    /** Terminal title-bar label. */
    codeTitle?: string;
    /** Terminal body lines (tokenised for colour). */
    codeLines?: string[];
}

const DEFAULT_LINES = [
    '# one process per driver, over a pipe',
    '',
    '> {"method":"get_tables",',
    '  "params":{"db":"sales"},"id":7}',
    '',
    '< {"result":["users","orders"],',
    '  "id":7}',
];

/**
 * Alternative blog OG template: the release-cover dark grid/glow language, set
 * entirely in JetBrains Mono, with a terminal mock on the right. Opt in per
 * post via `og.template: "code-terminal"`.
 */
export async function renderCodeTerminalOgImage({
    title,
    accent,
    codeTitle = 'tabularis',
    codeLines,
}: CodeTerminalOgOptions): Promise<ImageResponse> {
    const fonts = await loadFonts({Urbanist: [500, 800], 'JetBrains Mono': [400, 700]});
    const lines = codeLines?.length ? codeLines : DEFAULT_LINES;

    return renderOg(
        <SplitLayout
            eyebrow={'Tabularis Blog'}
            title={[title, accent].filter(Boolean).join(' ') || undefined}
            visual={
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: 532,
                        fontFamily: 'JetBrains Mono',
                        background: '#11121c',
                        border: '.1rem solid rgba(148, 163, 184, 0.16)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Title bar */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                        }}
                    >
                        {['#ff5f56', '#ffbd2e', '#27c93f'].map((color) => (
                            <div key={color} style={{width: 11, height: 11, borderRadius: '50%', background: color}} />
                        ))}
                        <div style={{display: 'flex', marginLeft: 10, color: '#7d8590', fontSize: 13}}>{codeTitle}</div>
                    </div>

                    {/* Body */}
                    <div
                        style={{display: 'flex', flexDirection: 'column', padding: 22, fontSize: 14.5, lineHeight: 1.5}}
                    >
                        {lines.map((line, i) =>
                            line === '' ? (
                                <div key={i} style={{display: 'flex', height: 14}} />
                            ) : (
                                <div key={i} style={{display: 'flex'}}>
                                    {tokenizeCodeLine(line).map((t, j) => (
                                        <span
                                            key={j}
                                            style={{color: t.color, fontWeight: t.bold ? 700 : 400, whiteSpace: 'pre'}}
                                        >
                                            {t.text}
                                        </span>
                                    ))}
                                </div>
                            ),
                        )}
                    </div>
                </div>
            }
        />,
        {fonts},
    );
}
