import type {InitiativeMeta} from '@/lib/roadmap';
import {Card} from '@/components/ui/Card/Card';
import styles from './InitiativeCard.module.scss';
import clsx from 'clsx';

const STATUS_CLASS: Record<InitiativeMeta['status'], string> = {
    'in-progress': styles.inProgress,
    planned: styles.planned,
    done: styles.done,
};

export function InitiativeCard({meta}: {meta: InitiativeMeta}) {
    return (
        <Card className={clsx(styles.card, STATUS_CLASS[meta.status])}>
            <Card.Content>
                {meta.category && <Card.Label className={styles.label}>{meta.category}</Card.Label>}
                <Card.Title>{meta.title}</Card.Title>
                {meta.lede && <Card.Description>{meta.lede}</Card.Description>}
            </Card.Content>
            <Card.Link href={`/roadmap/${meta.slug}`} ariaLabel={`Read details: ${meta.title}`}>
                Read details
            </Card.Link>
        </Card>
    );
}
