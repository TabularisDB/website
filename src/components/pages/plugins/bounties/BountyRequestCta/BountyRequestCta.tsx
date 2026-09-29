import {Button} from '@/components/ui/Button/Button';
import {DiscordIcon} from '@/components/ui/Icons/SocialIcons';
import {SOCIAL_URLS} from '@/lib/social';
import styles from './BountyRequestCta.module.scss';

export function BountyRequestCta() {
    return (
        <section className={styles.card}>
            <div className={styles.content}>
                <span className={styles.eyebrow}>Request</span>
                <h2 className={styles.title}>Not on the board yet?</h2>
                <p className={styles.description}>
                    Start with a GitHub Discussion. If the need is real, the item can graduate into a scoped bounty with
                    an owner, target, and delivery path.
                </p>

                <div className={styles.actions}>
                    <Button className={styles.button} href={`${SOCIAL_URLS.github}/discussions`}>
                        Request next target
                    </Button>
                    <Button className={styles.button} href={SOCIAL_URLS.discord} variant="secondary">
                        <DiscordIcon />
                        Discuss on Discord
                    </Button>
                </div>
            </div>
        </section>
    );
}
