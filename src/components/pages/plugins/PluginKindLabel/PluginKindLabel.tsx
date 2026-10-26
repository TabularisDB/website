import {getKindBadge} from '@/components/pages/plugins/Plugin.data';
import {Card} from '@/components/ui/Card/Card';
import clsx from 'clsx';
import {DatabaseIcon, PaletteIcon, PlugIcon, type LucideIcon} from 'lucide-react';
import styles from './PluginKindLabel.module.scss';

const KIND_ICONS: Record<string, LucideIcon> = {driver: DatabaseIcon, theme: PaletteIcon};

interface PluginKindLabelProps {
    kind?: string | null;
    className?: string;
}

export function PluginKindLabel({kind, className}: PluginKindLabelProps) {
    const Icon = (kind && KIND_ICONS[kind]) || PlugIcon;

    return (
        <Card.Label className={clsx(styles.kind, className)}>
            <Icon aria-hidden="true" />
            {kind ? getKindBadge(kind) : 'Plugin'}
        </Card.Label>
    );
}
