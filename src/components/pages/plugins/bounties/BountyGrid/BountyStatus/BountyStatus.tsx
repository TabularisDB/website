import clsx from 'clsx';
import {
    CircleDashedIcon,
    CircleDotDashedIcon,
    CircleDotIcon,
    ClockIcon,
    FlameIcon,
    PackageCheckIcon,
    type LucideIcon,
} from 'lucide-react';
import {BOUNTY_STATUS, BOUNTY_STATUS_LABEL} from '@/lib/plugins/bounties';
import styles from './BountyStatus.module.scss';

const STATUS_ICON: Record<BOUNTY_STATUS, LucideIcon> = {
    [BOUNTY_STATUS.MOST_WANTED]: FlameIcon,
    [BOUNTY_STATUS.OPEN]: CircleDashedIcon,
    [BOUNTY_STATUS.SCOPED]: CircleDotDashedIcon,
    [BOUNTY_STATUS.IN_PROGRESS]: CircleDotIcon,
    [BOUNTY_STATUS.COMING_SOON]: ClockIcon,
    [BOUNTY_STATUS.SHIPPED]: PackageCheckIcon,
};

interface BountyStatusProps {
    status: BOUNTY_STATUS;
    className?: string;
}

export function BountyStatus({status, className}: BountyStatusProps) {
    const Icon = STATUS_ICON[status];

    return (
        <span className={clsx(styles.status, className)} data-status={status}>
            <Icon aria-hidden="true" />
            {BOUNTY_STATUS_LABEL[status]}
        </span>
    );
}
