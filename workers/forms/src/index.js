// Spam-filtering proxy in front of emailchef for the tabularis.dev forms.
//
// The site is a static export, so the forms used to POST straight to
// emailchef's public signupwl/<token> endpoint — and bots did the same,
// bypassing every client-side check. This Worker is now the only thing that
// knows the emailchef tokens. It accepts a form submission, verifies a
// Cloudflare Turnstile token server-side, checks the honeypot and the email,
// and only then forwards the `field[...]` values to emailchef.
//
// Request:  POST /<form-key>   (multipart/form-data or urlencoded)
// Response: JSON {ok: true} | {ok: false, error: "captcha" | "invalid" | "upstream"}

const FORMS = {
    newsletter: {token: 'EMAILCHEF_TOKEN_NEWSLETTER', formId: 'EMAILCHEF_FORM_ID_NEWSLETTER'},
    survey: {token: 'EMAILCHEF_TOKEN_SURVEY', formId: 'EMAILCHEF_FORM_ID_SURVEY'},
    sponsor: {token: 'EMAILCHEF_TOKEN_SPONSOR', formId: 'EMAILCHEF_FORM_ID_SPONSOR'},
};

const HONEYPOT_NAME = 'website_url';
const TURNSTILE_FIELD = 'cf-turnstile-response';
const EMAIL_FIELD = 'field[-1]';
const FIELD_RE = /^field\[-?\d+\]$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MAX_BODY_BYTES = 32 * 1024;
const MAX_VALUE_LENGTH = 5000;

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') ?? '';
        const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
        const cors = allowedOrigins.includes(origin)
            ? {'Access-Control-Allow-Origin': origin, Vary: 'Origin'}
            : null;

        if (!cors) return new Response('Forbidden', {status: 403});

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Max-Age': '86400'},
            });
        }
        if (request.method !== 'POST') return new Response('Method Not Allowed', {status: 405, headers: cors});

        const reply = (body, status = 200) => Response.json(body, {status, headers: cors});

        const key = new URL(request.url).pathname.replace(/^\/+|\/+$/g, '');
        const form = Object.hasOwn(FORMS, key) ? FORMS[key] : null;
        if (!form) return reply({ok: false, error: 'invalid'}, 404);

        if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY_BYTES) {
            return reply({ok: false, error: 'invalid'}, 413);
        }

        let data;
        try {
            data = await request.formData();
        } catch {
            return reply({ok: false, error: 'invalid'}, 400);
        }

        // Honeypot filled → pretend it worked so the bot has nothing to learn.
        const honeypot = data.get(HONEYPOT_NAME);
        if (typeof honeypot === 'string' && honeypot !== '') return reply({ok: true});

        const ip = request.headers.get('CF-Connecting-IP') ?? '';
        if (!(await verifyTurnstile(data.get(TURNSTILE_FIELD), key, ip, env))) {
            return reply({ok: false, error: 'captcha'}, 403);
        }

        const email = data.get(EMAIL_FIELD);
        if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
            return reply({ok: false, error: 'invalid'}, 422);
        }

        // Forward only emailchef field values; form_id/referrer come from here,
        // not from the client.
        const upstream = new URLSearchParams();
        for (const [name, value] of data) {
            if (!FIELD_RE.test(name) || typeof value !== 'string') continue;
            if (value.length > MAX_VALUE_LENGTH) return reply({ok: false, error: 'invalid'}, 422);
            upstream.append(name, value.trim());
        }
        upstream.set('form_id', env[form.formId]);
        upstream.set('lang', '');
        upstream.set('referrer', request.headers.get('Referer') ?? origin);

        let res;
        try {
            res = await fetch(`https://app.emailchef.com/signupwl/${env[form.token]}/en`, {
                method: 'POST',
                body: upstream,
                redirect: 'manual',
            });
        } catch {
            return reply({ok: false, error: 'upstream'}, 502);
        }
        // emailchef answers a successful signup with a redirect.
        if (res.status >= 400) return reply({ok: false, error: 'upstream'}, 502);

        return reply({ok: true});
    },
};

async function verifyTurnstile(token, action, ip, env) {
    if (typeof token !== 'string' || token === '') return false;

    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);

    try {
        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {method: 'POST', body});
        const outcome = await res.json();
        // Cloudflare's dummy test keys return an empty action, so only reject a
        // token that was explicitly issued for a different form.
        return outcome.success === true && (!outcome.action || outcome.action === action);
    } catch {
        return false;
    }
}
