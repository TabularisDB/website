import {JsonLd} from '@/components/layout/JsonLd';
import {SurveyForm} from '@/components/ui/SurveyForm/SurveyForm';
import {ogImages} from '@/lib/og/registry';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {MessagesSquareIcon} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './SurveyPage.module.scss';

const path = '/survey';
const title = 'Help shape Tabularis | Tabularis';
const description =
    "Tell us what you expect from a database tool: which databases you use, what matters most, and what's missing today. It takes about two minutes.";

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: ogImages(path, 'What should Tabularis build next? Take the 2-minute community survey.'),
    },
    twitter: {card: 'summary_large_image'},
};

export default function SurveyPage() {
    return (
        <div className="container">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Survey', path: '/survey'},
                    ]),
                ]}
            />

            <header className="page-header">
                <span className="eyebrow">
                    <MessagesSquareIcon />
                    Community survey
                </span>
                <h1 className="title">What should Tabularis build next?</h1>
                <p className="description">
                    Tell us how you work with databases and what you wish your tools did better. Every answer feeds the
                    roadmap.
                </p>
            </header>

            <section className={styles.survey}>
                <div className={styles.form}>
                    <SurveyForm source="page" />
                </div>
            </section>
        </div>
    );
}
