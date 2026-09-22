import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {Button} from '@/components/ui/Button/Button';
import {Globe, FileText, MessageCircle, Link2} from 'lucide-react';
import {SponsorContactForm} from './SponsorContactForm/SponsorContactForm';
import styles from './SupportBlock.module.scss';

const PERKS = [
    {icon: Globe, text: 'Logo and link on homepage and sponsors page'},
    {icon: FileText, text: 'Informational modal with features, offer, and CTA'},
    {icon: MessageCircle, text: 'Mention in release notes and community channels'},
    {icon: Link2, text: 'UTM-tagged links for accurate traffic attribution'},
];

export function SupportBlock() {
    return (
        <section className={styles.block}>
            <h2 className={styles.title}>Support Tabularis</h2>

            <div className={styles.column}>
                <h3 className={styles.subTitle}>Personally</h3>
                <p className={styles.text}>
                    Want to support development directly? You can sponsor the maintainer on GitHub.
                </p>
                <Button href="https://github.com/sponsors/debba" className={styles.button} variant="secondary">
                    <GitHubIcon />
                    Sponsor on GitHub
                </Button>
            </div>

            <div className={styles.column}>
                <h3 className={styles.subTitle}>As a sponsor</h3>
                <p className={styles.text}>
                    Interested in reaching a developer-focused audience? Sponsoring Tabularis puts your product in front
                    of thousands of developers who work with databases every day. You get a logo and link on the
                    homepage, a dedicated modal with features and CTA, and mentions in release notes and community
                    channels.
                </p>

                <ul className={styles.perks}>
                    {PERKS.map((perk) => {
                        const Icon = perk.icon;
                        return (
                            <li key={perk.text}>
                                <Icon size={18} className={styles.perkIcon} />
                                <span>{perk.text}</span>
                            </li>
                        );
                    })}
                </ul>

                <SponsorContactForm />
            </div>
        </section>
    );
}
