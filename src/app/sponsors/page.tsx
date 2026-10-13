import {SponsorsGrid} from '@/components/pages/sponsors/SponsorsGrid/SponsorsGrid';
import {Button} from '@/components/ui/Button/Button';
import {CalloutBlock} from '@/components/ui/CalloutBlock/CalloutBlock';
import {GitHubIcon} from '@/components/ui/Icons/SocialIcons';
import {ogImages} from '@/lib/og/registry';
import {HandshakeIcon, StarIcon} from 'lucide-react';
import type {Metadata} from 'next';

const path = '/sponsors';
const title = 'Sponsors and supporters | Tabularis';
const description = 'Organizations supporting Tabularis development. Interested in sponsoring? Get in touch.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis sponsors and supporters'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function SponsorsPage() {
    return (
        <div className="container with-gap">
            <header className="page-header">
                <span className="eyebrow">
                    <StarIcon />
                    Sponsors
                </span>
                <h1 className="title">Our sponsors and supporters</h1>
                <p className="description">
                    These organizations support Tabularis development and help keep it free and open source for
                    everyone. Thank you.
                </p>
            </header>

            <SponsorsGrid />

            <CalloutBlock
                title="Support Tabularis"
                actions={
                    <>
                        <Button href="/sponsors/become" size="sm">
                            <HandshakeIcon />
                            Become a sponsor
                        </Button>
                        <Button href="https://github.com/sponsors/debba" variant="secondary" size="sm">
                            <GitHubIcon />
                            Sponsor on GitHub
                        </Button>
                    </>
                }
            >
                Put your product in front of developers who work with databases every day, or support development
                personally through GitHub Sponsors.
            </CalloutBlock>
        </div>
    );
}
