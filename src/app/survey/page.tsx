import {SurveyForm} from '@/components/ui/SurveyForm/SurveyForm';
import {MessagesSquareIcon} from 'lucide-react';
import {Metadata} from 'next';
import styles from './SurveyPage.module.scss';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {JsonLd} from '@/components/layout/JsonLd';

const TITLE = 'Help shape Tabularis | Tabularis';
const DESCRIPTION =
    "Tell us what you expect from a database tool: which databases you use, what matters most, and what's missing today. It takes about two minutes.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {canonical: '/survey'},
    openGraph: {
        type: 'website',
        url: 'https://tabularis.dev/survey',
        title: TITLE,
        description: DESCRIPTION,
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
    },
};

export default function SurveyPage() {
    return (
        <div className="container with-gap">
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
                <SurveyForm source={'page'} />
            </section>
        </div>
    );
}
