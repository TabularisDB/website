import Image from 'next/image';
import {ArrowRightIcon, PlugIcon, PlusIcon, StarIcon} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {BOUNTY_STATUS, BOUNTY_STATUS_LABEL, type PluginBounty} from '@/lib/plugins/bounties';
import {SOCIAL_URLS} from '@/lib/social';
import {getPluginIcon} from '@/components/pages/plugins/Plugin.data';
import styles from './BountyCard.module.scss';
import {trackEvent} from '@/lib/analytics';

function claimLabel(status: PluginBounty['status']) {
    if (status === BOUNTY_STATUS.SHIPPED) return 'View plugin';
    if (status === BOUNTY_STATUS.CLAIMED) return 'Follow work';
    return 'Claim work';
}

export function BountyCard({bounty}: {bounty: PluginBounty}) {
    const iconSlug = getPluginIcon(bounty.id);
    const isShipped = bounty.status === BOUNTY_STATUS.SHIPPED;

    const cover = (
        <div className={styles.cardCover}>
            {iconSlug ? (
                <Image
                    className={styles.cardIcon}
                    src={`/img/logos/plugins/${iconSlug}.svg`}
                    alt={bounty.name}
                    width={48}
                    height={48}
                />
            ) : (
                <span className={styles.cardIcon}>
                    <PlugIcon />
                </span>
            )}

            {!isShipped && (
                <>
                    <span className={styles.status} data-status={bounty.status}>
                        {BOUNTY_STATUS_LABEL[bounty.status]}
                    </span>
                    <span className={styles.target}>{bounty.target}</span>
                </>
            )}
        </div>
    );

    if (isShipped) {
        return (
            <Link
                id={bounty.id}
                href={bounty.claimUrl}
                className={styles.card}
                data-variant="shipped"
                style={{'--accent': bounty.accent} as React.CSSProperties}
            >
                {cover}

                <div className={styles.body}>
                    <h3 className={styles.name}>{bounty.name}</h3>
                    <p className={styles.tagline}>{bounty.tagline}</p>
                </div>
            </Link>
        );
    }

    return (
        <article id={bounty.id} className={styles.card} style={{'--accent': bounty.accent} as React.CSSProperties}>
            {cover}

            <div className={styles.body}>
                <div className={styles.titleRow}>
                    <h3 className={styles.name}>{bounty.name}</h3>
                    <span className={styles.difficulty} data-difficulty={bounty.difficulty}>
                        Difficulty: {bounty.difficulty}
                    </span>
                </div>

                <p className={styles.tagline}>{bounty.tagline}</p>

                {bounty.capabilities.length > 0 && (
                    <details className={styles.scope}>
                        <summary>
                            <span>Scope &amp; signals</span>
                            <span className={styles.toggle} aria-hidden="true">
                                <PlusIcon size={14} />
                            </span>
                        </summary>
                        <div className={styles.scopeBody}>
                            <ul className={styles.capabilityList} aria-label={`${bounty.name} capability map`}>
                                {bounty.capabilities.map((capability) => (
                                    <li
                                        key={`${bounty.id}-${capability.label}`}
                                        className={styles.capability}
                                        data-state={capability.state}
                                    >
                                        {capability.label}
                                    </li>
                                ))}
                            </ul>
                            <p className={styles.signalText}>{bounty.signal}</p>
                        </div>
                    </details>
                )}

                <div className={styles.nextBlock}>
                    <span className={styles.nextLabel}>Next step</span>
                    <p>{bounty.nextStep}</p>
                </div>
            </div>

            <div className={styles.footer}>
                <Button
                    href={bounty.claimUrl}
                    className={styles.button}
                    size="sm"
                    onClick={() => trackEvent('Bounty', 'Claim Work', bounty.id)}
                >
                    {claimLabel(bounty.status)}
                    <ArrowRightIcon size={14} />
                </Button>
                <Button
                    href={SOCIAL_URLS.discord}
                    className={styles.button}
                    variant="secondary"
                    size="sm"
                    onClick={() => trackEvent('Bounty', 'Discuss', bounty.id)}
                >
                    <DiscordIcon />
                    Discuss
                </Button>
                <Button
                    href={bounty.sponsorUrl}
                    className={styles.button}
                    variant="secondary"
                    size="sm"
                    onClick={() => trackEvent('Bounty', 'Sponsor', bounty.id)}
                >
                    <StarIcon />
                    Sponsor
                </Button>
            </div>
        </article>
    );
}
