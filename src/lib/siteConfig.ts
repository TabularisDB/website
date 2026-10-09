// Spam-filtering proxy for every emailchef form (Cloudflare Worker, source in
// workers/forms/). Forms POST to `${FORMS_ENDPOINT}/<form-key>` with a
// Turnstile token; the Worker verifies it and forwards the fields to emailchef.
// The emailchef tokens and form ids live only in the Worker's secrets.
export const FORMS_ENDPOINT = 'https://tabularis-forms.andrea-92c.workers.dev';
// Public Turnstile site key (Cloudflare dashboard → Turnstile → widget).
export const TURNSTILE_SITE_KEY = '0x4AAAAAAFQfrxfeVQIZZDMA';

// emailchef-backed product-discovery survey (see SurveyPrompt.tsx).
//
// Submissions go through the forms proxy like the newsletter/sponsor forms,
// with the survey answers mapped onto custom fields of the resulting contact.
// Because emailchef is a contact-list tool, an email is required and each
// answer is stored as a custom field.
//
// `fields` holds the N in each custom field's name="field[N]" (email is -1),
// taken from the emailchef form's embed code.
export const SURVEY_EMAILCHEF = {
    // The redirect target after a successful submit.
    redirect: '/thanks-survey',
    // emailchef custom-field ids (the N in name="field[N]"). Create these custom
    // fields on the list in emailchef, then paste their ids here. Standard fields
    // on this list: email = -1, first name = -2, last name = -3.
    fields: {
        role: '217648',
        databases: '217649',
        priorities: '217650',
        missing: '217651',
        // Newsletter opt-in — emailchef boolean field "is_newsletter" (sent as
        // "1"/"0"). Segment or automate the move to the newsletter list in
        // emailchef off this flag.
        newsletter: '217652',
    },
} as const;

export const NEWSLETTER_EMAILCHEF = {
    redirect: '/thanks-newsletter',
} as const;

// The survey only renders once the custom fields are wired up — otherwise the
// answers would POST to non-existent fields and be silently dropped.
export const SURVEY_CONFIGURED = !SURVEY_EMAILCHEF.fields.role.startsWith('REPLACE');

// Data controller named in the privacy policy and in the form consent notices.
export const DATA_CONTROLLER = {
    name: 'DEBBAWEB di Debernardi Andrea',
    address: 'Via Monte Tabor 56/6, 17015 Celle Ligure (SV), Italy',
    vat: 'IT01719480095',
    email: 'andrea@tabularis.dev',
} as const;

export const SITE_TITLE = 'Tabularis | Open-Source Desktop Client for Modern Databases';
export const SITE_DESCRIPTION =
    'Open-source desktop database client with support for PostgreSQL, MySQL/MariaDB, and SQLite. Hackable with plugins, with notebooks, AI, and MCP built in.';
export const SITE_URL = 'https://tabularis.dev';
export const OG_IMAGE_URL = `${SITE_URL}/img/og.png`;
export const FEED_ALTERNATES = {
    'application/rss+xml': [{url: '/feed.xml', title: 'Tabularis Blog'}],
    'application/feed+json': [{url: '/feed.json', title: 'Tabularis Blog'}],
};
