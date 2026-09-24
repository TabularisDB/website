import {getActiveBounties, getShippedBounties} from '@/lib/pluginBounties';
import {PlugIcon} from 'lucide-react';
import {getPluginIcon, STATUS_WEIGHT} from '../../Plugin.data';
import styles from './BountySchema.module.scss';

const NODE_COUNT = 6;

const LEFT_POSITIONS = [16, 50, 87];
const RIGHT_POSITIONS = [15, 50, 85];
const LEFT_X = [12, 24, 16];
const RIGHT_X = [86, 80, 84];

function NodeIcon({icon, name}: {icon: string | null; name: string}) {
    return icon ? (
        <img src={`/img/logos/plugins/${icon}.svg`} alt="" className={styles.nodeIcon} />
    ) : (
        <PlugIcon className={styles.nodeIcon} aria-label={name} />
    );
}

export function BountySchema() {
    const active = getActiveBounties().sort((a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status]);

    let bounties = active.slice(0, 1);
    if (bounties.length < NODE_COUNT) {
        const activeIds = new Set(active.map((bounty) => bounty.id));
        const filler = getShippedBounties().filter((bounty) => !activeIds.has(bounty.id));
        bounties = [...active.slice(0, 1), ...filler];
    }
    bounties = bounties.slice(0, NODE_COUNT);

    const left = bounties.slice(0, 3);
    const right = bounties.slice(3, 6);

    function pathFor(edgeX: number, nodeX: number, nodeY: number) {
        const hubX = 50;
        const hubY = 50;
        const midX = (nodeX + hubX) / 2;
        return `M${edgeX},${nodeY} L${nodeX},${nodeY} C${midX},${nodeY} ${midX},${hubY} ${hubX},${hubY}`;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.diagram} aria-hidden="true">
                <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none">
                    {left.map((bounty, i) => (
                        <path key={bounty.id} d={pathFor(0, LEFT_X[i], LEFT_POSITIONS[i])} className={styles.line} />
                    ))}
                    {right.map((bounty, i) => (
                        <path
                            key={bounty.id}
                            d={pathFor(100, RIGHT_X[i], RIGHT_POSITIONS[i])}
                            className={styles.line}
                        />
                    ))}
                </svg>

                <div className={styles.hub}>
                    <img src="/img/brand/tabularis-compact.svg" alt="" />
                </div>

                {left.map((bounty, i) => (
                    <div
                        key={bounty.id}
                        className={styles.node}
                        style={{left: `${LEFT_X[i]}%`, top: `${LEFT_POSITIONS[i]}%`}}
                    >
                        <NodeIcon icon={getPluginIcon(bounty.id)} name={bounty.name} />
                    </div>
                ))}
                {right.map((bounty, i) => (
                    <div
                        key={bounty.id}
                        className={styles.node}
                        style={{left: `${RIGHT_X[i]}%`, top: `${RIGHT_POSITIONS[i]}%`}}
                    >
                        <NodeIcon icon={getPluginIcon(bounty.id)} name={bounty.name} />
                    </div>
                ))}
            </div>
        </div>
    );
}
