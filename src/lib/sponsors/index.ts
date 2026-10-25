export interface SponsorFeature {
    icon: string;
    text: string;
}

export interface SponsorOffer {
    title: string;
    description: string;
}

export interface Sponsor {
    id: string;
    name: string;
    tagline: string;
    url: string;
    accentColor: string;
    highlightColor?: string;
    ctaTextColor?: string;
    logoImg?: string;
    logoImgCompact?: string;
    logoImgBg?: string;
    // Compact logo is white on transparent: invert it on the light theme.
    invertLogoOnLight?: boolean;
    logoChar?: string;
    logoBg?: string;
    modalDescription?: string;
    features?: SponsorFeature[];
    offer?: SponsorOffer;
    kind?: 'sponsor' | 'supporter';
}

export const SPONSORS: Sponsor[] = [
    {
        id: 'turbosmtp',
        name: 'turboSMTP',
        tagline: 'Professional SMTP relay that delivers your emails straight to the inbox, never to spam',
        url: 'https://www.serversmtp.com',
        accentColor: '#1a6fb5',
        logoImg: '/img/logos/sponsors/turbosmtp.png',
        logoImgCompact: '/img/logos/sponsors/turbosmtp_compact.png',
        logoImgBg: '#ffffff',
        modalDescription:
            'An SMTP relay trusted by 100,000+ businesses to deliver transactional emails, notifications and newsletters to the inbox.',
        features: [
            {icon: '📬', text: 'Industry-leading deliverability vs. standard providers'},
            {icon: '🌍', text: 'Global infrastructure: EU, USA, Middle East, Asia'},
            {icon: '🔒', text: 'GDPR compliant with full email authentication'},
            {icon: '📊', text: 'Real-time tracking, reporting & webhooks'},
            {icon: '💬', text: '24/7 support via chat, ticket & phone'},
        ],
        offer: {
            title: 'Free account for Tabularis developers',
            description:
                'Every developer who joins Tabularis gets a free turboSMTP account to send emails from their own platform, reliably and without ending up in spam.',
        },
    },
    {
        id: 'kilocode',
        name: 'Kilo Code',
        tagline: 'Open source AI coding agent to build, ship, and iterate faster with 500+ models',
        url: 'https://www.kilo.ai',
        accentColor: '#f5d800',
        ctaTextColor: '#000000',
        logoImg: '/img/logos/sponsors/kilocode.png',
        logoImgCompact: '/img/logos/sponsors/kilocode_compact.png',
        modalDescription:
            'An open-source AI coding agent for VS Code and JetBrains IDEs, from quick edits to long-running cloud agents.',
        features: [
            {icon: '🔓', text: '100% open source: Apache 2.0, fully inspectable'},
            {icon: '🤖', text: '500+ models: OpenAI, Anthropic, Gemini, Ollama and more'},
            {icon: '🔒', text: 'Privacy-first: no telemetry, never trains on your code'},
            {icon: '🧠', text: 'Agentic modes: Ask, Architect, Code, Debug, Orchestrator'},
            {icon: '⚡', text: 'Works in VS Code & JetBrains with no forks required'},
        ],
        offer: {
            title: 'Free & open source for every developer',
            description:
                'Kilo Code is free to use for all Tabularis developers. Install it in your IDE, bring your own API keys at zero markup, and start shipping faster today.',
        },
    },
    {
        id: 'openai',
        name: 'OpenAI',
        tagline: 'Supporting Tabularis through the Codex for Open Source program.',
        url: 'https://openai.com/codex/',
        accentColor: '#10A37F',
        highlightColor: '#10A37F',
        ctaTextColor: '#ffffff',
        logoImg: '/img/logos/sponsors/openai.png',
        logoImgCompact: '/img/logos/sponsors/openai_compact.png',
        invertLogoOnLight: true,
        logoImgBg: '#ffffff',
        kind: 'supporter',
        modalDescription:
            'OpenAI supports Tabularis through Codex for Open Source, giving the team Codex to maintain and improve the project.',
        features: [
            {icon: '⌨️', text: 'Codex access for open-source maintenance'},
            {icon: '🔍', text: 'Support for issue investigation, implementation, and review'},
            {icon: '❤️', text: 'Helping keep Tabularis free and open source'},
        ],
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        tagline: 'Supporting Tabularis through the Claude for Startups program.',
        url: 'https://claude.com/programs/startups',
        accentColor: '#D97757',
        highlightColor: '#D97757',
        ctaTextColor: '#ffffff',
        logoImg: '/img/logos/sponsors/anthropic.svg',
        logoImgCompact: '/img/logos/sponsors/anthropic_compact.png',
        logoImgBg: '#FAF9F5',
        kind: 'supporter',
        modalDescription:
            'Anthropic supports Tabularis through Claude for Startups, giving the team Claude to build and improve the project.',
        features: [
            {icon: '🤝', text: 'Support through the Claude for Startups program'},
            {icon: '⌨️', text: 'Claude to help build and improve Tabularis'},
            {icon: '❤️', text: 'Helping keep Tabularis free and open source'},
        ],
    },
    {
        id: 'digitalocean',
        name: 'DigitalOcean',
        tagline: 'Simple, predictable cloud infrastructure for developers and growing teams.',
        url: 'https://m.do.co/c/f6ab3d158275',
        accentColor: '#0080FF',
        highlightColor: '#0069D9',
        logoImg: '/img/logos/sponsors/digitalocean.png',
        logoImgCompact: '/img/logos/sponsors/digitalocean_compact.png',
        modalDescription:
            'A developer cloud with predictable pricing. Its Open Source Credits Program pays for hosting the upcoming Tabularis plugin registry.',
        features: [
            {icon: '💧', text: 'Droplets, App Platform and Kubernetes: the full developer cloud'},
            {icon: '🗄️', text: 'Managed PostgreSQL, MySQL, Redis and MongoDB'},
            {icon: '📦', text: 'Spaces: S3-compatible object storage with CDN included'},
            {icon: '💸', text: 'Predictable pricing, no surprise bills at the end of the month'},
            {icon: '❤️', text: 'Open Source Credits Program, supporting maintainers since day one'},
        ],
        offer: {
            title: '$25 in cloud credits for new accounts',
            description:
                'Sign up via the DigitalOcean referral program and get $25 in credit to spend over 60 days, enough to run a plugin registry, a side project, or both.',
        },
    },
    {
        id: 'vercel',
        name: 'Vercel',
        tagline: 'The platform for the modern web: ship, preview, and scale frontend apps with zero config.',
        url: 'https://vercel.com',
        accentColor: '#000000',
        highlightColor: '#e5e7eb',
        ctaTextColor: '#ffffff',
        logoImg: '/img/logos/sponsors/vercel.svg',
        logoImgCompact: '/img/logos/sponsors/vercel_compact.svg',
        invertLogoOnLight: true,
        modalDescription:
            'The platform for building and deploying the modern web. tabularis.dev runs on Vercel through its Open Source Program, Spring 2026 cohort.',
        features: [
            {icon: '▲', text: 'Git-based deploys with a live preview URL for every push'},
            {icon: '⚡', text: 'Global edge network, fast everywhere by default'},
            {icon: '🧩', text: 'First-class Next.js: framework and platform from one team'},
            {icon: '🔍', text: 'Preview deployments to review changes before they go live'},
            {icon: '❤️', text: 'Open Source Program: a year of support for maintainers'},
        ],
        offer: {
            title: 'Start building for free',
            description:
                "Vercel's Hobby tier is free for personal projects and open source. Deploy a Next.js app in minutes, no credit card required.",
        },
    },
    {
        id: 'usero',
        name: 'Usero',
        tagline: 'Feedback becomes code. Automatically.',
        url: 'https://usero.io',
        accentColor: '#0c0c31',
        highlightColor: '#7c3aed',
        logoImg: '/img/logos/sponsors/usero.png',
        logoImgCompact: '/img/logos/sponsors/usero_compact.png',
        modalDescription:
            'Turns user feedback into merged pull requests: it groups duplicate reports, prioritizes them, then opens a PR with the fix.',
        features: [
            {icon: '🧩', text: 'Multiple inputs: embed widget (7.6KB), GitHub Issues, or API'},
            {icon: '🧠', text: 'AI clustering & prioritization that surfaces what matters from the noise'},
            {icon: '⚙️', text: 'AI-powered PRs: Claude reads your code and writes real fixes, not tickets'},
            {icon: '✅', text: '96% success rate on targeted bugs (typos, broken links, UI glitches)'},
            {icon: '🎁', text: 'Free tier: 5 PRs/month, 1,000 feedback items'},
        ],
        offer: {
            title: 'Free for all Tabularis developers',
            description:
                'Connect your repo and let AI handle the bug fixes your users report. Free tier included, no credit card required.',
        },
    },
    {
        id: 'devglobe',
        name: 'DevGlobe',
        tagline: 'Connect your IDE, show up on the globe, and showcase your projects to a community of builders.',
        url: 'https://devglobe.app',
        accentColor: '#115BCA',
        highlightColor: '#1870F4',
        logoImg: '/img/logos/sponsors/devglobe.png',
        logoImgCompact: '/img/logos/sponsors/devglobe_compact.png',
        modalDescription:
            'A live globe of developers: connect your IDE, show what you are building and discover other projects.',
        features: [
            {icon: '🌍', text: 'Connect your IDE and appear live on the globe'},
            {icon: '🚀', text: 'Ship your project and get discovered by the community'},
            {icon: '📊', text: 'Your coding in numbers: track languages, streaks and patterns'},
            {icon: '🔌', text: 'Pick your editor: 25+ supported, install in one click'},
            {icon: '🔓', text: 'Free and open source'},
        ],
        offer: {
            title: 'Start tracking for free',
            description: 'Pick your editor, install the plugin, and join hundreds of developers already on the globe.',
        },
    },
    {
        id: 'tolgee',
        name: 'Tolgee',
        tagline: 'Open-source localization platform to translate your app in context, without the spreadsheet chaos.',
        url: 'https://tolgee.io',
        accentColor: '#EC407A',
        highlightColor: '#F06292',
        logoImg: '/img/logos/sponsors/tolgee.svg',
        logoImgCompact: '/img/logos/sponsors/tolgee_compact.svg',
        modalDescription:
            'An open-source localization platform for developers. Tabularis uses it to manage its translations in every supported language.',
        features: [
            {icon: '🌍', text: 'In-context editing directly inside your running app'},
            {icon: '🤖', text: 'AI-powered translations, machine translation & translation memory'},
            {icon: '🔓', text: 'Open source: self-host it or use the managed cloud'},
            {icon: '🧩', text: 'SDKs & integrations for React, Vue, Angular, Next.js and more'},
            {icon: '⚡', text: 'One-click translation updates without redeploying'},
        ],
        offer: {
            title: 'Free tier for open source & small teams',
            description:
                'Get started with Tolgee for free: self-host the platform or use the cloud free tier to localize your project from day one.',
        },
    },
    {
        id: '1password',
        name: '1Password',
        tagline: 'The password and secrets manager developers trust, free for open-source projects.',
        url: 'https://1password.com/developers',
        accentColor: '#145FE4',
        highlightColor: '#3B7BF0',
        logoImg: '/img/logos/sponsors/1password.png',
        logoImgCompact: '/img/logos/sponsors/1password_compact.png',
        logoImgBg: '#ffffff',
        modalDescription:
            "An end-to-end encrypted vault for passwords, passkeys, SSH keys and secrets. Tabularis uses its free open-source plan for the team's accounts, with CI secrets next.",
        features: [
            {icon: '🔐', text: 'End-to-end encrypted vaults, with data secured by a key only you hold'},
            {icon: '🤖', text: 'Secret manager for CI: op:// references resolved by load-secrets-action'},
            {icon: '🔑', text: 'Built-in SSH agent: biometric approvals, keys never touch disk'},
            {icon: '🪪', text: 'Passkeys, one-time codes and secure sharing across your team'},
            {icon: '❤️', text: 'Free plan for open-source projects'},
        ],
        offer: {
            title: 'Free for open-source projects',
            description:
                "1Password gives qualifying open-source projects a free Teams plan. Apply through their open-source program and manage your project's secrets the way larger teams do.",
        },
    },
    {
        id: 'jetbrains',
        name: 'JetBrains',
        tagline:
            'Professional developer tools: IntelliJ IDEA, WebStorm, DataGrip and the rest of the All Products Pack.',
        url: 'https://www.jetbrains.com',
        accentColor: '#000000',
        highlightColor: '#e5e7eb',
        ctaTextColor: '#ffffff',
        logoImg: '/img/logos/sponsors/jetbrains.png',
        logoImgCompact: '/img/logos/sponsors/jetbrains_compact.png',
        modalDescription:
            'The maker of IntelliJ IDEA, WebStorm, DataGrip and other IDEs. Its Open Source Support program gives the Tabularis maintainers a free All Products Pack license.',
        features: [
            {icon: '🧠', text: 'IntelliJ-based IDEs for every language: one philosophy, many tools'},
            {icon: '🔍', text: 'Deep static analysis, refactoring and debugging built in'},
            {icon: '🧩', text: 'All Products Pack: every JetBrains IDE under one license'},
            {icon: '🤝', text: 'Long-running Open Source Support program for maintainers'},
            {icon: '❤️', text: 'The Drive to Develop'},
        ],
        offer: {
            title: 'Free All Products Pack for the Tabularis maintainers',
            description:
                'JetBrains is providing Tabularis maintainers with a free annual All Products Pack subscription, covering the full suite of JetBrains IDEs.',
        },
    },
    {
        id: 'signpath',
        name: 'SignPath',
        tagline: 'Code signing for open source: signed Windows releases without the certificate bill.',
        url: 'https://signpath.io',
        accentColor: '#00BAF2',
        highlightColor: '#33C9F5',
        logoImg: '/img/logos/sponsors/signpath.png',
        logoImgCompact: '/img/logos/sponsors/signpath_compact.png',
        logoImgBg: '#ffffff',
        modalDescription:
            'Code signing for open source, with keys kept on hardware security modules. It is being wired into the Tabularis release pipeline so Windows builds ship signed.',
        features: [
            {icon: '✍️', text: 'Free code signing certificates for open source projects'},
            {icon: '🔐', text: 'Private keys on HSMs, never on build machines or USB tokens'},
            {icon: '⚙️', text: 'Signing integrated into CI, so every release is signed automatically'},
            {icon: '🔍', text: 'Verified builds: signed binaries provably come from the public repo'},
            {icon: '🛡️', text: 'No more "unknown publisher" warnings on Windows installers'},
        ],
        offer: {
            title: 'Free code signing for open source',
            description:
                'SignPath Foundation issues free code signing certificates to qualifying open source projects. Apply through their program and ship signed releases without buying a certificate.',
        },
    },
];
