---
title: Cookie Policy
updated: October 2026
---

## What are cookies?

Cookies are small text files stored in your browser when you visit a website. They allow the site to remember certain information across page visits and sessions.

## How we use cookies

This website uses a minimal set of cookies, grouped into the categories below. You can manage your preferences at any time using the cookie banner.

## Cookie categories

### Necessary <span class="badge badge-required">Always active</span>

These are required for the website to function correctly and cannot be disabled. This category also includes **cookieless, anonymised page-view analytics** via [Matomo](https://matomo.org) (self-hosted). No cookies are set, the last two bytes of your IP address are removed before storage, and no data is shared with third parties. This processing is based on legitimate interest (aggregate, anonymous traffic statistics).

| Name                       | Provider                  | Purpose                                                                                                          | Expiry                                                    |
| -------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `tabularis-cookie-consent` | tabularis.dev             | Stores your cookie consent preferences                                                                           | Persistent (localStorage)                                 |
| `tabularis-promo-cta-v1`   | tabularis.dev             | Remembers when the promotional prompt was last shown, so it is not repeated                                      | Persistent (localStorage), prompt reappears after 21 days |
| `tabularis-survey-v1`      | tabularis.dev             | Remembers that you completed or dismissed the user survey                                                        | Persistent (localStorage)                                 |
| _None (cookieless)_        | analytics.debbaweb.it     | Anonymised page-view statistics without persistent identifiers                                                   | Session only                                              |
| _None (cookieless)_        | challenges.cloudflare.com | Cloudflare Turnstile — spam and bot protection on the newsletter, survey and [sponsors](/sponsors) contact forms | Session only                                              |

### Measurement <span class="badge">Optional</span>

Enabling this category upgrades the base cookieless tracking to full cookie-based analytics via [Matomo](https://matomo.org). Persistent cookies allow us to recognise returning visitors and measure engagement over time. IP addresses are still anonymised and no data is shared with third parties.

| Name        | Provider              | Purpose                                        | Expiry     |
| ----------- | --------------------- | ---------------------------------------------- | ---------- |
| `_pk_id.*`  | analytics.debbaweb.it | Identifies a returning visitor across sessions | 13 months  |
| `_pk_ses.*` | analytics.debbaweb.it | Tracks a single visit session                  | 30 minutes |
| `_pk_ref.*` | analytics.debbaweb.it | Stores referral source for the visit           | 6 months   |

### Marketing <span class="badge">Optional</span>

No marketing cookies are currently set, whatever you choose in the cookie banner. The newsletter, survey and [sponsors](/sponsors) contact forms are sent to our own form proxy, which forwards your submission server-side to [EmailChef](https://www.emailchef.com), our mailing list provider. No EmailChef scripts are loaded in your browser. How form data is handled is described in our [Privacy Policy](/privacy-policy). This category is kept so that you can decide in advance, should we ever add a service that needs it; this policy will be updated first.

## Third-party content

Some pages, such as the blog, the roadmap and the [contribute](/contribute) page, show GitHub profile pictures loaded from `avatars.githubusercontent.com`. These images set no cookies, but like any image request they reveal your IP address to GitHub.

## Managing your preferences

You can review and change your cookie preferences at any time. Your current consent is stored locally in your browser and is never sent to any server.

To withdraw consent or change your choices, clear the `tabularis-cookie-consent` entry from your browser's local storage, or reload the page after clearing site data. The consent banner will reappear.

## Contact

If you have any questions about this cookie policy, please open an issue on [GitHub]({{GITHUB_URL}}) or join our [Discord]({{DISCORD_URL}}).
