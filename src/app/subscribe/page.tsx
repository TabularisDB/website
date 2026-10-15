import {JsonLd} from '@/components/layout/JsonLd';
import {NewsletterForm} from '@/components/ui/NewsletterForm/NewsletterForm';
import {ogImages} from '@/lib/og/registry';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {MailIcon} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './SubscribePage.module.scss';

const path = '/subscribe';
const title = 'Subscribe | Tabularis';
const description =
    'Subscribe to the Tabularis newsletter. Get release announcements, development insights, and project updates.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'Tabularis Newsletter'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function SubscribePage() {
    return (
        <div className="container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Subscribe', path: '/subscribe'},
                    ]),
                ]}
            />

            <header className="page-header">
                <span className="eyebrow">
                    <MailIcon />
                    Newsletter
                </span>
                <h1 className="title">Stay in the loop</h1>
                <p className="description">
                    Release announcements, development insights, tips and project updates, straight to your inbox.
                </p>
            </header>

            <section className={styles.newsletter}>
                <NewsletterForm />
            </section>
        </div>
    );
}
