import {ImageResponse} from 'next/og';
import {Kicker, loadFonts, renderOg, Title} from './shared';

export interface SimpleOgOptions {
    title: string;
    kicker?: string;
}

const MAX_LINE_LENGTH = 30;

function balanceTitle(title: string): string[] {
    if (title.length <= MAX_LINE_LENGTH) return [title];

    const middle = title.length / 2;
    let splitAt = -1;
    for (let i = 0; i < title.length; i++) {
        if (title[i] === ' ' && (splitAt === -1 || Math.abs(i - middle) < Math.abs(splitAt - middle))) splitAt = i;
    }
    return splitAt === -1 ? [title] : [title.slice(0, splitAt), title.slice(splitAt + 1)];
}

export async function renderSimpleOgImage({title, kicker}: SimpleOgOptions): Promise<ImageResponse> {
    const fonts = await loadFonts({Urbanist: [500, 800]});

    return renderOg(
        <div
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                width: '100%',
                height: '100%',
            }}
        >
            {kicker && <Kicker>{kicker}</Kicker>}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 1000}}>
                {balanceTitle(title).map((line) => (
                    <Title key={line} fontSize={70}>
                        {line}
                    </Title>
                ))}
            </div>
        </div>,
        {fonts},
    );
}
