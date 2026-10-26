import {getKindBadge, getKindIcon} from '@/components/pages/plugins/Plugin.data';
import {Card} from '@/components/ui/Card/Card';
import clsx from 'clsx';
import styles from './PluginKindLabel.module.scss';

interface PluginKindLabelProps {
    kind?: string | null;
    className?: string;
}

export function PluginKindLabel({kind, className}: PluginKindLabelProps) {
    const Icon = getKindIcon(kind);

    return (
        <Card.Label className={clsx(styles.kind, className)}>
            <Icon aria-hidden="true" />
            {kind ? getKindBadge(kind) : 'Plugin'}
        </Card.Label>
    );
}
