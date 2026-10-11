import type {PluginRequestKind} from '@/components/pages/plugins/bounties/PluginRequestModal/PluginRequestModal';
import {RequestPluginButton} from '@/components/pages/plugins/bounties/RequestPluginButton/RequestPluginButton';
import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {SOCIAL_URLS} from '@/lib/social';
import styles from './BountyRequestCta.module.scss';

export function BountyRequestCta({kinds}: {kinds: PluginRequestKind[]}) {
    return (
        <section className={styles.card}>
            <div className={styles.content}>
                <span className={styles.eyebrow}>Request</span>
                <h2 className={styles.title}>Not on the board yet?</h2>
                <p className={styles.description}>
                    Suggest it on the Tabularium wishlist. If the community backs it, the item can graduate into a
                    scoped bounty with an owner, target, and delivery path.
                </p>

                <div className={styles.actions}>
                    <RequestPluginButton className={styles.button} kinds={kinds}>
                        Request next target
                    </RequestPluginButton>
                    <Button className={styles.button} href={SOCIAL_URLS.discord} variant="secondary">
                        <DiscordIcon />
                        Discuss on Discord
                    </Button>
                </div>
            </div>
        </section>
    );
}
