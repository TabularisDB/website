import type {Metadata} from 'next';
import styles from '@/app/cookie-policy/CookiePolicyPage.module.scss';
import Link from 'next/link';
import {DATA_CONTROLLER, OG_IMAGE_URL} from '@/lib/siteConfig';

const path = '/privacy-policy';
const title = 'Privacy Policy | Tabularis';
const description =
    'How tabularis.dev collects and uses personal data from the newsletter, survey and sponsor contact forms.';

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description,
        images: [OG_IMAGE_URL],
    },
    twitter: {card: 'summary_large_image'},
};

const mailto = `mailto:${DATA_CONTROLLER.email}`;

export default function PrivacyPolicyPage() {
    return (
        <div className="container">
            <article className={styles.article}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Privacy Policy</h1>
                    <p className={styles.updated}>Last updated: October 2026</p>
                </header>

                <section className={styles.section}>
                    <p>
                        This policy explains how personal data is collected and used on tabularis.dev, in particular
                        when you subscribe to the newsletter, answer the user survey or contact us about sponsorship.
                        It is provided under Articles 13 and 14 of the EU General Data Protection Regulation (GDPR,
                        Regulation (EU) 2016/679). The Tabularis desktop app itself collects no personal data and
                        needs no account. Cookies and local storage are covered in the{' '}
                        <Link href="/cookie-policy">Cookie Policy</Link>.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Data controller</h2>
                    <p>
                        <strong>{DATA_CONTROLLER.name}</strong>
                        <br />
                        {DATA_CONTROLLER.address}
                        <br />
                        VAT number: {DATA_CONTROLLER.vat}
                        <br />
                        Email: <a href={mailto}>{DATA_CONTROLLER.email}</a>
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>What data we collect and why</h2>

                    <div className={styles.category}>
                        <h3>Newsletter</h3>
                        <p>
                            <strong>Data:</strong> your email address, plus the date, page and IP address of the
                            signup as recorded by the mailing list provider. If you confirm the subscription, we also
                            see aggregate delivery statistics such as opens and clicks.
                            <br />
                            <strong>Purpose:</strong> sending news about Tabularis releases, blog posts and the
                            project.
                            <br />
                            <strong>Legal basis:</strong> your consent (Art. 6(1)(a) GDPR), given by ticking the
                            checkbox on the form. You can withdraw it at any time with the unsubscribe link in every
                            email or by writing to us.
                        </p>
                    </div>

                    <div className={styles.category}>
                        <h3>User survey</h3>
                        <p>
                            <strong>Data:</strong> your answers (role, databases you use, priorities, free-text
                            feedback), your email address and, if you tick it, your choice to also join the
                            newsletter.
                            <br />
                            <strong>Purpose:</strong> understanding how Tabularis is used to plan its development, and
                            following up on your feedback.
                            <br />
                            <strong>Legal basis:</strong> your consent (Art. 6(1)(a) GDPR). You are only added to the
                            newsletter if you explicitly ask for it.
                        </p>
                    </div>

                    <div className={styles.category}>
                        <h3>Sponsor contact form</h3>
                        <p>
                            <strong>Data:</strong> first and last name, company, email address, website and the
                            message you write.
                            <br />
                            <strong>Purpose:</strong> answering your sponsorship enquiry and, if it goes ahead,
                            arranging the sponsorship.
                            <br />
                            <strong>Legal basis:</strong> steps taken at your request before entering into an
                            agreement (Art. 6(1)(b) GDPR) and your consent (Art. 6(1)(a) GDPR).
                        </p>
                    </div>

                    <div className={styles.category}>
                        <h3>Spam protection</h3>
                        <p>
                            <strong>Data:</strong> your IP address and technical browser signals, processed by
                            Cloudflare Turnstile and by our form proxy when a form is submitted. They are used only
                            for the check and are not stored by us.
                            <br />
                            <strong>Purpose:</strong> keeping bots and abusive signups out of the forms.
                            <br />
                            <strong>Legal basis:</strong> our legitimate interest in protecting the service (Art.
                            6(1)(f) GDPR).
                        </p>
                    </div>

                    <div className={styles.category}>
                        <h3>Website visits</h3>
                        <p>
                            Hosting and analytics are described in the <Link href="/cookie-policy">Cookie Policy</Link>
                            : page views are measured with self-hosted Matomo with anonymised IP addresses, and the
                            hosting provider keeps standard server logs for security and operation.
                        </p>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Who processes your data</h2>
                    <p>
                        We do not sell or rent your data and do not share it with anyone for their own marketing. It
                        is handled only by the providers below, which act as data processors on our behalf.
                    </p>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Provider</th>
                                    <th>Role</th>
                                    <th>Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <a
                                            href="https://www.emailchef.com/privacy-policy/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            EmailChef
                                        </a>
                                    </td>
                                    <td>Mailing list, stores form submissions and sends the newsletter</td>
                                    <td>Italy (EU)</td>
                                </tr>
                                <tr>
                                    <td>
                                        <a
                                            href="https://www.cloudflare.com/privacypolicy/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Cloudflare
                                        </a>
                                    </td>
                                    <td>Form proxy (Workers) and spam protection (Turnstile)</td>
                                    <td>United States / global</td>
                                </tr>
                                <tr>
                                    <td>
                                        <a
                                            href="https://vercel.com/legal/privacy-policy"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Vercel
                                        </a>
                                    </td>
                                    <td>Website hosting</td>
                                    <td>United States / global</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p>
                        Transfers to the United States rely on the EU-U.S. Data Privacy Framework, to which these
                        providers are certified, or on the European Commission&apos;s Standard Contractual Clauses.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>How long we keep it</h2>
                    <p>
                        Newsletter: until you unsubscribe or ask us to delete your data. Survey answers: up to 24
                        months, after which they are deleted or kept only in anonymous, aggregate form. Sponsor
                        enquiries: up to 24 months after our last contact, or longer if a sponsorship agreement
                        requires it for accounting and tax purposes.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Your rights</h2>
                    <p>
                        You can ask to access, correct or delete your data, to restrict or object to its processing,
                        and to receive it in a portable format (Articles 15 to 21 GDPR). Where processing is based on
                        consent, you can withdraw it at any time without affecting what was done before. To exercise
                        any of these rights, write to <a href={mailto}>{DATA_CONTROLLER.email}</a>.
                    </p>
                    <p>
                        You also have the right to lodge a complaint with a supervisory authority. In Italy this is
                        the{' '}
                        <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
                            Garante per la protezione dei dati personali
                        </a>
                        .
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Is providing data required?</h2>
                    <p>
                        No. Everything on this website can be used without giving us any personal data. The email
                        address and the consent checkbox are required only to submit a form; without them we cannot
                        handle that request.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Changes to this policy</h2>
                    <p>
                        We may update this policy when the website or its providers change. The date at the top
                        always shows the latest revision.
                    </p>
                </section>
            </article>
        </div>
    );
}
