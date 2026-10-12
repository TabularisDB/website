import {BookOpenIcon, HandCoinsIcon, PlugIcon} from 'lucide-react';
import {PluginGrid} from '@/components/pages/plugins/PluginGrid/PluginGrid';
import {PLUGINS_PAGE_COPY, type PluginsPageCopy} from '@/components/pages/plugins/Plugin.data';
import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import type {PluginKind} from '@/lib/plugins/kinds';

export function getPluginsPageCopy(kind?: PluginKind): PluginsPageCopy {
    if (!kind) return PLUGINS_PAGE_COPY.all;
    return PLUGINS_PAGE_COPY[kind.key] ?? {title: kind.label, description: kind.description ?? ''};
}

export function PluginsPage({kind}: {kind?: PluginKind}) {
    const copy = getPluginsPageCopy(kind);

    return (
        <div className="container with-gap">
            <header className="page-header">
                <span className="eyebrow">
                    <PlugIcon />
                    {kind ? `${kind.label} Plugins` : 'Plugins'}
                </span>
                <h1 className="title">{copy.title}</h1>
                <p className="description">{copy.description}</p>
            </header>

            <PluginGrid activeKind={kind?.key} />

            <CalloutBlock
                title="Fund or build the next plugin"
                actions={
                    <>
                        <Button href="/plugins/bounties" size="sm">
                            <HandCoinsIcon />
                            Bounty board
                        </Button>
                        <Button href="/wiki/building-plugins" variant="secondary" size="sm">
                            <BookOpenIcon />
                            Plugin docs
                        </Button>
                    </>
                }
            >
                Claim or sponsor the integrations the community wants next on the bounty board, or write your own driver
                in any language and publish it on the Tabularium registry.
            </CalloutBlock>
        </div>
    );
}
