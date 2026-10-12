import {getPluginIcon} from '@/components/pages/plugins/Plugin.data';
import type {PluginBounty} from '@/lib/plugins/bounties';
import {PlugIcon} from 'lucide-react';
import Image from 'next/image';

interface BountyIconProps {
    bounty: PluginBounty;
    className?: string;
}

export function BountyIcon({bounty, className}: BountyIconProps) {
    const iconSlug = getPluginIcon(bounty.id);

    return iconSlug ? (
        <Image className={className} src={`/img/logos/plugins/${iconSlug}.svg`} alt="" width={40} height={40} />
    ) : (
        <span className={className}>
            <PlugIcon />
        </span>
    );
}
