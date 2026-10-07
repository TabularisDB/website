import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getPluginsPageCopy, PluginsPage} from '@/components/pages/plugins/PluginsPage/PluginsPage';
import {getKindSlug, getPublishedKinds} from '@/lib/plugins/kinds';
import {ogImages} from '@/lib/og/registry';

interface PageProps {
    params: Promise<{kind: string}>;
}

function findKind(slug: string) {
    return getPublishedKinds().find((kind) => getKindSlug(kind.key) === slug);
}

export function generateStaticParams() {
    return getPublishedKinds().map((kind) => ({kind: getKindSlug(kind.key)}));
}

export const dynamicParams = false;

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const kind = findKind((await params).kind);
    if (!kind) return {};

    const path = `/plugins/${getKindSlug(kind.key)}`;
    const title = `${kind.label} | Tabularis Plugins`;
    const description = getPluginsPageCopy(kind).description;
    return {
        title,
        description,
        alternates: {canonical: path},
        openGraph: {
            type: 'website',
            url: path,
            title,
            description,
            images: ogImages(path, `Tabularis ${kind.label}`),
        },
        twitter: {card: 'summary_large_image'},
    };
}

export default async function PluginKindPage({params}: PageProps) {
    const kind = findKind((await params).kind);
    if (!kind) notFound();

    return <PluginsPage kind={kind} />;
}
