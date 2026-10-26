import {getKindIcon, getPluginIcon} from '@/components/pages/plugins/Plugin.data';
import type {PluginBounty} from '@/lib/plugins/bounties';
import Image from 'next/image';

interface BountyIconProps {
    bounty: PluginBounty;
    className?: string;
}

export function BountyIcon({bounty, className}: BountyIconProps) {
    const iconSlug = getPluginIcon(bounty.id);
    const KindIcon = getKindIcon(bounty.kind);

    return iconSlug ? (
        <Image className={className} src={`/img/logos/plugins/${iconSlug}.svg`} alt="" width={40} height={40} />
    ) : (
        <span className={className}>
            <KindIcon />
        </span>
    );
}
