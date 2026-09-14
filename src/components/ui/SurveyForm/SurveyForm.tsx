'use client';
import {useState} from 'react';
import Script from 'next/script';
import {trackEvent} from '@/lib/analytics';
import {SURVEY_EMAILCHEF} from '@/lib/siteConfig';
import styles from './SurveyForm.module.scss';
import {Button} from '../Button/Button';

const EMAILCHEF_SCRIPT = `https://app.emailchef.com/signup/form.js/${SURVEY_EMAILCHEF.token}/en/api`;
const EMAILCHEF_ACTION = `https://app.emailchef.com/signupwl/${SURVEY_EMAILCHEF.token}/en`;

const ROLES = [
    'Backend / full-stack developer',
    'Database administrator',
    'Data analyst / scientist',
    'Founder / product',
    'Student / hobbyist',
    'Other',
];
const DATABASES = ['PostgreSQL', 'MySQL / MariaDB', 'SQLite', 'MongoDB', 'Other'];
const PRIORITIES = [
    'Speed & performance',
    'Clean, modern UI',
    'Plugin extensibility',
    'Built-in AI assistance',
    'Works fully offline',
    'Open source',
    'Free / low cost',
];

const newsletterConfigured = !SURVEY_EMAILCHEF.fields.newsletter.startsWith('REPLACE');
export const SURVEY_STORAGE_KEY = 'tabularis-survey-v1';

interface SurveyFormProps {
    source: 'popup' | 'page';
    onSubmitted?: () => void;
}

export function SurveyForm({source, onSubmitted}: SurveyFormProps) {
    const [step, setStep] = useState(0);
    const [role, setRole] = useState('');
    const [databases, setDatabases] = useState<string[]>([]);
    const [databasesOther, setDatabasesOther] = useState('');
    const [priorities, setPriorities] = useState<string[]>([]);
    const [missing, setMissing] = useState('');
    const [newsletter, setNewsletter] = useState(false);

    function toggle(list: string[], setList: (v: string[]) => void, value: string) {
        setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    }

    const LAST_STEP = 3;

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        if (step !== LAST_STEP) {
            e.preventDefault();
            return;
        }
        try {
            localStorage.setItem(SURVEY_STORAGE_KEY, 'submitted');
        } catch {
            // localStorage unavailable (private mode) — non-fatal.
        }
        trackEvent('survey', 'submitted', `${source}:${role || 'unknown'}`);
        onSubmitted?.();
    }

    const databasesValue = databases
        .flatMap((d) => (d === 'Other' ? (databasesOther.trim() ? [databasesOther.trim()] : []) : [d]))
        .join(', ');

    const canAdvance =
        step === 0
            ? role !== ''
            : step === 1
              ? databases.length > 0 && (!databases.includes('Other') || databasesOther.trim() !== '')
              : step === 2
                ? priorities.length > 0
                : true;

    return (
        <>
            <div className={styles.progress} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={`${styles.dot} ${i <= step ? styles.dotOn : ''}`} />
                ))}
            </div>

            <form method="POST" action={EMAILCHEF_ACTION} className={styles.form} onSubmit={onSubmit}>
                {step === 0 && (
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.question}>What best describes you?</legend>
                        <div className={styles.options}>
                            {ROLES.map((r) => (
                                <label key={r} className={`${styles.option} ${role === r ? styles.optionOn : ''}`}>
                                    <input
                                        type="radio"
                                        name="survey-role"
                                        value={r}
                                        checked={role === r}
                                        onChange={() => setRole(r)}
                                    />
                                    <span className={`${styles.indicator} ${styles.indicatorRadio}`} />
                                    {r}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}

                {step === 1 && (
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.question}>Which databases do you work with?</legend>
                        <div className={styles.options}>
                            {DATABASES.map((d) => (
                                <label
                                    key={d}
                                    className={`${styles.option} ${databases.includes(d) ? styles.optionOn : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={databases.includes(d)}
                                        onChange={() => toggle(databases, setDatabases, d)}
                                    />
                                    <span className={`${styles.indicator} ${styles.indicatorCheckbox}`} />
                                    {d}
                                </label>
                            ))}
                        </div>
                        {databases.includes('Other') && (
                            <input
                                type="text"
                                className={styles.input}
                                value={databasesOther}
                                onChange={(e) => setDatabasesOther(e.target.value)}
                                placeholder="Which one? e.g. DuckDB, ClickHouse…"
                                aria-label="Other database"
                            />
                        )}
                    </fieldset>
                )}

                {step === 2 && (
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.question}>What matters most in a database tool?</legend>
                        <div className={styles.options}>
                            {PRIORITIES.map((p) => (
                                <label
                                    key={p}
                                    className={`${styles.option} ${priorities.includes(p) ? styles.optionOn : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={priorities.includes(p)}
                                        onChange={() => toggle(priorities, setPriorities, p)}
                                    />
                                    <span className={`${styles.indicator} ${styles.indicatorCheckbox}`} />
                                    {p}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}

                {step === 3 && (
                    <div className={styles.fieldset}>
                        <div className={styles.field}>
                            <label className={styles.question} htmlFor="survey-missing">
                                What&apos;s missing from the database tools you use today?{' '}
                                <span className={styles.required}>*</span>
                            </label>
                            <textarea
                                id="survey-missing"
                                className={styles.textarea}
                                rows={3}
                                value={missing}
                                onChange={(e) => setMissing(e.target.value)}
                                placeholder="The one thing you wish existed…"
                                name={`field[${SURVEY_EMAILCHEF.fields.missing}]`}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.question} htmlFor="survey-email">
                                Your email <span className={styles.required}>*</span>
                            </label>
                            <input
                                id="survey-email"
                                type="email"
                                name="field[-1]"
                                className={styles.input}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        {newsletterConfigured && (
                            <label className={styles.checkline}>
                                <input
                                    type="checkbox"
                                    checked={newsletter}
                                    onChange={(e) => setNewsletter(e.target.checked)}
                                />
                                <span className={`${styles.indicator} ${styles.indicatorCheckbox}`} />
                                Also subscribe me to the newsletter
                            </label>
                        )}

                        <p className={styles.fineprint}>
                            We&apos;ll only use it to follow up on your feedback. No spam.
                        </p>
                    </div>
                )}

                <input type="hidden" name={`field[${SURVEY_EMAILCHEF.fields.role}]`} value={role} />
                <input type="hidden" name={`field[${SURVEY_EMAILCHEF.fields.databases}]`} value={databasesValue} />
                <input
                    type="hidden"
                    name={`field[${SURVEY_EMAILCHEF.fields.priorities}]`}
                    value={priorities.join(', ')}
                />
                {newsletterConfigured && (
                    <input
                        type="hidden"
                        name={`field[${SURVEY_EMAILCHEF.fields.newsletter}]`}
                        value={newsletter ? '1' : '0'}
                    />
                )}
                <input type="hidden" name="form_id" value={SURVEY_EMAILCHEF.formId} />
                <input type="hidden" name="lang" value="" />
                <input type="hidden" name="referrer" value="" />
                <input type="hidden" name="redirect" value={SURVEY_EMAILCHEF.redirect} />

                <div className={styles.actions}>
                    {step > 0 && (
                        <Button
                            type="button"
                            className={styles.button}
                            variant="outline"
                            onClick={() => setStep((s) => s - 1)}
                        >
                            Back
                        </Button>
                    )}
                    {step < LAST_STEP ? (
                        <Button
                            type="button"
                            className={styles.button}
                            disabled={!canAdvance}
                            onClick={() => setStep((s) => s + 1)}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                            Send feedback
                        </Button>
                    )}
                </div>

                <a className={styles.credit} href="https://www.emailchef.com" target="_blank" rel="noopener noreferrer">
                    Made with
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/img/emailchef-logo.svg" alt="emailchef" />
                </a>

                <Script src={EMAILCHEF_SCRIPT} strategy="lazyOnload" />
            </form>
        </>
    );
}
