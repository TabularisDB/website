import {SponsorContactForm} from '@/components/pages/sponsors/SponsorContactForm/SponsorContactForm';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs/Breadcrumbs';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';
import {ogImages} from '@/lib/og/registry';
import {
    FileTextIcon,
    GlobeIcon,
    HandshakeIcon,
    Link2Icon,
    MailIcon,
    MessageCircleIcon,
    SparklesIcon,
} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './BecomeSponsorPage.module.scss';

const path = '/sponsors/become';
const title = 'Become a sponsor | Tabularis';
const description = 'Sponsor Tabularis and put your product in front of developers who work with databases every day.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Become a Tabularis sponsor'),
    },
    twitter: {card: 'summary_large_image'},
};

const PERKS = [
    {icon: <GlobeIcon />, title: 'Homepage visibility', text: 'Logo and link on the homepage and sponsors page.'},
    {
        icon: <FileTextIcon />,
        title: 'A dedicated modal',
        text: 'Your features, offer and call to action, in one place.',
    },
    {icon: <MessageCircleIcon />, title: 'Community mentions', text: 'In release notes and community channels.'},
    {icon: <Link2Icon />, title: 'Clear attribution', text: 'UTM-tagged links for accurate traffic tracking.'},
];

export default function BecomeSponsorPage() {
    return (
        <div className="container with-gap">
            <header className="page-header">
                <Breadcrumbs crumbs={[{label: 'Sponsors', href: '/sponsors'}, {label: 'Become a sponsor'}]} />
                <span className="eyebrow">
                    <HandshakeIcon />
                    Become a sponsor
                </span>
                <h1 className="title">Reach developers where they work.</h1>
                <p className="description">
                    Sponsoring Tabularis puts your product in front of thousands of developers who work with databases
                    every day.
                </p>
            </header>

            <div className={styles.content}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <SparklesIcon aria-hidden="true" />
                        Why sponsor Tabularis
                    </h2>
                    <CardGrid variant="joined" className={styles.perks}>
                        {PERKS.map((perk) => (
                            <Card key={perk.title}>
                                <Card.Header icon={perk.icon} />
                                <Card.Content>
                                    <Card.Title>{perk.title}</Card.Title>
                                    <Card.Description>{perk.text}</Card.Description>
                                </Card.Content>
                            </Card>
                        ))}
                    </CardGrid>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <MailIcon aria-hidden="true" />
                        Get in touch
                    </h2>
                    <SponsorContactForm />
                </section>
            </div>
        </div>
    );
}
