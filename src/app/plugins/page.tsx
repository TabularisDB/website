import type {Metadata} from 'next';
import {PluginsPage} from '@/components/pages/plugins/PluginsPage/PluginsPage';
import {ogImages} from '@/lib/og/registry';

const path = '/plugins';
const title = 'Plugins | Tabularis';
const description = 'Extend Tabularis with database drivers and themes from the community.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis Plugins'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function PluginsIndexPage() {
    return <PluginsPage />;
}
