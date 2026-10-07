import {getOgCards} from '@/lib/og/registry';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return Object.keys(getOgCards()).map((pagePath) => {
        const segments = pagePath.split('/').filter(Boolean);
        segments[segments.length - 1] += '.png';
        return {path: segments};
    });
}

export async function GET(_req: Request, {params}: {params: Promise<{path: string[]}>}) {
    const {path} = await params;
    const pagePath = '/' + path.join('/').replace(/\.png$/, '');
    const card = getOgCards()[pagePath];
    if (!card) return new Response(null, {status: 404});
    return card();
}
