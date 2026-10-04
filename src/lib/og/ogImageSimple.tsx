import {ImageResponse} from 'next/og';
import {Kicker, loadFonts, renderOg, Title} from './shared';

export interface SimpleOgOptions {
    title: string;
    kicker?: string;
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
            <Title fontSize={70}>{title}</Title>
        </div>,
        {fonts},
    );
}
