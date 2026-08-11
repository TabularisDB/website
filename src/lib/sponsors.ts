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
  logoChar?: string;
  logoBg?: string;
  modalDescription?: string;
  features?: SponsorFeature[];
  offer?: SponsorOffer;
  kind?: "sponsor" | "supporter";
}

export const SPONSORS: Sponsor[] = [
  {
    id: "turbosmtp",
    name: "turboSMTP",
    tagline: "Professional SMTP relay — your emails delivered straight to the inbox, never to spam",
    url: "https://www.serversmtp.com",
    accentColor: "#1a6fb5",
    logoImg: "/img/sponsors/turbosmtp.png",
    logoImgCompact: "/img/sponsors/turbosmtp_compact.png",
    logoImgBg: "#ffffff",
    modalDescription:
      "turboSMTP is a professional SMTP relay service trusted by 100,000+ businesses worldwide. Its infrastructure spans Europe, USA, Middle East and Asia, ensuring your transactional emails, notifications, and newsletters land in the inbox — not the spam folder. Built for developers who need email to just work, with real-time tracking, webhooks, and 24/7 multilingual support.",
    features: [
      { icon: "📬", text: "Industry-leading deliverability vs. standard providers" },
      { icon: "🌍", text: "Global infrastructure — EU, USA, Middle East, Asia" },
      { icon: "🔒", text: "GDPR compliant with full email authentication" },
      { icon: "📊", text: "Real-time tracking, reporting & webhooks" },
      { icon: "💬", text: "24/7 support via chat, ticket & phone" },
    ],
    offer: {
      title: "Free account for Tabularis developers",
      description:
        "Every developer who joins Tabularis gets a free turboSMTP account to send emails from their own platform — reliably and without ending up in spam.",
    },
  },
  {
    id: "kilocode",
    name: "Kilo Code",
    tagline: "Open source AI coding agent — build, ship, and iterate faster with 500+ models",
    url: "https://www.kilo.ai",
    accentColor: "#f5d800",
    ctaTextColor: "#000000",
    logoImg: "/img/sponsors/kilocode.png",
    logoImgCompact: "/img/sponsors/kilocode_compact.png",
    modalDescription:
      "Kilo Code is the most popular open source AI coding agent, running directly inside VS Code and JetBrains IDEs. It gives you access to 500+ models from any provider, supports local execution for full privacy, and never trains on your code. From quick edits to long-running cloud agents, it adapts to how you actually work — with zero telemetry by default.",
    features: [
      { icon: "🔓", text: "100% open source — Apache 2.0, fully inspectable" },
      { icon: "🤖", text: "500+ models — OpenAI, Anthropic, Gemini, Ollama and more" },
      { icon: "🔒", text: "Privacy-first — no telemetry, never trains on your code" },
      { icon: "🧠", text: "Agentic modes: Ask, Architect, Code, Debug, Orchestrator" },
      { icon: "⚡", text: "Works in VS Code & JetBrains with no forks required" },
    ],
    offer: {
      title: "Free & open source for every developer",
      description:
        "Kilo Code is free to use for all Tabularis developers. Install it in your IDE, bring your own API keys at zero markup, and start shipping faster today.",
    },
  },
  {
    id: "openai",
    name: "OpenAI",
    tagline: "Supporting Tabularis through the Codex for Open Source program.",
    url: "https://openai.com/codex/",
    accentColor: "#10A37F",
    highlightColor: "#10A37F",
    ctaTextColor: "#ffffff",
    logoImg: "/img/sponsors/openai.png",
    logoImgCompact: "/img/sponsors/openai_compact.png",
    logoImgBg: "#ffffff",
    kind: "supporter",
    modalDescription:
      "OpenAI supports Tabularis through Codex for Open Source, providing Codex access to help maintain and improve the project.",
    features: [
      { icon: "⌨️", text: "Codex access for open-source maintenance" },
      { icon: "🔍", text: "Support for issue investigation, implementation, and review" },
      { icon: "❤️", text: "Helping keep Tabularis free and open source" },
    ],
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    tagline: "Simple, predictable cloud infrastructure for developers and growing teams.",
    url: "https://m.do.co/c/f6ab3d158275",
    accentColor: "#0080FF",
    highlightColor: "#0069D9",
    logoImg: "/img/sponsors/digitalocean.png",
    logoImgCompact: "/img/sponsors/digitalocean_compact.png",
    modalDescription:
      "DigitalOcean is the developer cloud built for shipping. Droplets, managed databases, App Platform, Spaces object storage and Kubernetes — all with predictable pricing and documentation developers actually want to read. Tabularis was accepted into the DigitalOcean Open Source Credits Program, and we're using that credit to host the upcoming plugin registry infrastructure.",
    features: [
      { icon: "💧", text: "Droplets, App Platform, Kubernetes — the full developer cloud" },
      { icon: "🗄️", text: "Managed PostgreSQL, MySQL, Redis and MongoDB" },
      { icon: "📦", text: "Spaces — S3-compatible object storage with CDN included" },
      { icon: "💸", text: "Predictable pricing, no surprise bills at the end of the month" },
      { icon: "❤️", text: "Open Source Credits Program — supporting maintainers since day one" },
    ],
    offer: {
      title: "$25 in cloud credits for new accounts",
      description:
        "Sign up via the DigitalOcean referral program and get $25 in credit to spend over 60 days — enough to run a plugin registry, a side project, or both.",
    },
  },
  {
    id: "vercel",
    name: "Vercel",
    tagline: "The platform for the modern web — ship, preview, and scale frontend apps with zero config.",
    url: "https://vercel.com",
    accentColor: "#000000",
    highlightColor: "#e5e7eb",
    ctaTextColor: "#ffffff",
    logoImg: "/img/sponsors/vercel.svg",
    logoImgCompact: "/img/sponsors/vercel_compact.svg",
    modalDescription:
      "Vercel is the platform for building and deploying the modern web — Git-based deploys, a preview URL for every change, a global edge network, and a developer experience that turns shipping into a non-event. tabularis.dev itself is an open-source Next.js app deployed on Vercel. Tabularis was accepted into the Vercel Open Source Program for the Spring 2026 cohort.",
    features: [
      { icon: "▲", text: "Git-based deploys — a live preview URL for every push" },
      { icon: "⚡", text: "Global edge network — fast everywhere, by default" },
      { icon: "🧩", text: "First-class Next.js — framework and platform, one team" },
      { icon: "🔍", text: "Preview deployments — review changes before they go live" },
      { icon: "❤️", text: "Open Source Program — a year of support for maintainers" },
    ],
    offer: {
      title: "Start building for free",
      description:
        "Vercel's Hobby tier is free for personal projects and open source — deploy a Next.js app in minutes, no credit card required.",
    },
  },
  {
    id: "usero",
    name: "Usero",
    tagline: "Feedback becomes code. Automatically.",
    url: "https://usero.io",
    accentColor: "#0c0c31",
    highlightColor: "#7c3aed",
    logoImg: "/img/sponsors/usero.png",
    logoImgCompact: "/img/sponsors/usero_compact.png",
    modalDescription:
      "Usero turns user feedback into merged pull requests. Collect feedback through a lightweight widget, GitHub Issues, or API. AI clusters duplicates, prioritizes what matters, then Claude reads your codebase and opens a PR with the actual fix.",
    features: [
      { icon: "🧩", text: "Multiple inputs — embed widget (7.6KB), GitHub Issues, or API" },
      { icon: "🧠", text: "AI clustering & prioritization — surfaces what matters from the noise" },
      { icon: "⚙️", text: "AI-powered PRs — Claude reads your code and writes real fixes, not tickets" },
      { icon: "✅", text: "96% success rate on targeted bugs (typos, broken links, UI glitches)" },
      { icon: "🎁", text: "Free tier — 5 PRs/month, 1,000 feedback items" },
    ],
    offer: {
      title: "Free for all Tabularis developers",
      description:
        "Connect your repo and let AI handle the bug fixes your users report. Free tier included — no credit card required.",
    },
  },
  {
    id: "devglobe",
    name: "DevGlobe",
    tagline: "Connect your IDE, show up on the globe, and showcase your projects to a community of builders.",
    url: "https://devglobe.app",
    accentColor: "#115BCA",
    highlightColor: "#1870F4",
    logoImg: "/img/sponsors/devglobe.png",
    logoImgCompact: "/img/sponsors/devglobe_compact.png",
    modalDescription:
      "Connect your IDE, appear live on the globe, and showcase your projects to a community of builders. Track your coding stats, discover what others are working on, and get noticed. Free and open source. 25+ editors supported.",
    features: [
      { icon: "🌍", text: "Connect your IDE and appear live on the globe" },
      { icon: "🚀", text: "Ship your project — get discovered by the community" },
      { icon: "📊", text: "Your coding, in numbers — track languages, streaks and patterns" },
      { icon: "🔌", text: "Pick your editor — 25+ supported, install in one click" },
      { icon: "🔓", text: "Free and open source" },
    ],
    offer: {
      title: "Start tracking for free",
      description:
        "Pick your editor, install the plugin, and join hundreds of developers already on the globe.",
    },
  },
  {
    id: "tolgee",
    name: "Tolgee",
    tagline: "Open-source localization platform — translate your app in context, without the spreadsheet chaos.",
    url: "https://tolgee.io",
    accentColor: "#EC407A",
    highlightColor: "#F06292",
    logoImg: "/img/sponsors/tolgee.svg",
    logoImgCompact: "/img/sponsors/tolgee_compact.svg",
    modalDescription:
      "Tolgee is an open-source localization platform built for developers. Translate your app in context with an in-place editor, leverage AI-assisted translations and translation memory, and keep your team in sync — all without copy-pasting strings into spreadsheets. Tabularis uses Tolgee to manage its translations across every supported language.",
    features: [
      { icon: "🌍", text: "In-context editing — translate directly inside your running app" },
      { icon: "🤖", text: "AI-powered translations, machine translation & translation memory" },
      { icon: "🔓", text: "Open source — self-host it or use the managed cloud" },
      { icon: "🧩", text: "SDKs & integrations for React, Vue, Angular, Next.js and more" },
      { icon: "⚡", text: "One-click translation updates without redeploying" },
    ],
    offer: {
      title: "Free tier for open source & small teams",
      description:
        "Get started with Tolgee for free — self-host the platform or use the cloud free tier to localize your project from day one.",
    },
  },
  {
    id: "1password",
    name: "1Password",
    tagline: "The password and secrets manager developers trust — free for open-source projects.",
    url: "https://1password.com/developers",
    accentColor: "#145FE4",
    highlightColor: "#3B7BF0",
    logoImg: "/img/sponsors/1password.png",
    logoImgCompact: "/img/sponsors/1password_compact.png",
    logoImgBg: "#ffffff",
    modalDescription:
      "1Password keeps passwords, passkeys, SSH keys and secrets in one end-to-end encrypted vault, with your data secured by a key only you hold. It's also built for developers: a secret manager for GitHub Actions via op:// references, an SSH agent that approves connections with biometrics, and CLI integration that keeps secrets out of your dotfiles. Tabularis was accepted into 1Password's free plan for open-source projects, and uses it to manage the team's accounts — with CI secrets next.",
    features: [
      { icon: "🔐", text: "End-to-end encrypted vaults — data encrypted with a key only you hold" },
      { icon: "🤖", text: "Secret manager for CI — op:// references resolved by load-secrets-action" },
      { icon: "🔑", text: "Built-in SSH agent — biometric approvals, keys never touch disk" },
      { icon: "🪪", text: "Passkeys, one-time codes and secure sharing across your team" },
      { icon: "❤️", text: "Free plan for open-source projects" },
    ],
    offer: {
      title: "Free for open-source projects",
      description:
        "1Password gives qualifying open-source projects a free Teams plan. Apply through their open-source program and manage your project's secrets the way larger teams do.",
    },
  },
  {
    id: "jetbrains",
    name: "JetBrains",
    tagline: "Professional developer tools — IntelliJ IDEA, WebStorm, DataGrip and the rest of the All Products Pack.",
    url: "https://www.jetbrains.com",
    accentColor: "#000000",
    highlightColor: "#e5e7eb",
    ctaTextColor: "#ffffff",
    logoImg: "/img/sponsors/jetbrains.png",
    logoImgCompact: "/img/sponsors/jetbrains_compact.png",
    modalDescription:
      "JetBrains makes the IDEs a huge share of professional developers reach for every day — IntelliJ IDEA, WebStorm, PyCharm, GoLand, RustRover and the rest of the lineup, all built on the same fast, deeply-integrated tooling philosophy. Tabularis was accepted into the JetBrains Open Source Support program, which provides maintainers with a free All Products Pack license to build with the same tools their users rely on.",
    features: [
      { icon: "🧠", text: "IntelliJ-based IDEs for every language — one philosophy, many tools" },
      { icon: "🔍", text: "Deep static analysis, refactoring and debugging built in" },
      { icon: "🧩", text: "All Products Pack — every JetBrains IDE under one license" },
      { icon: "🤝", text: "Long-running Open Source Support program for maintainers" },
      { icon: "❤️", text: "The Drive to Develop" },
    ],
    offer: {
      title: "Free All Products Pack for the Tabularis maintainers",
      description:
        "JetBrains is providing Tabularis maintainers with a free annual All Products Pack subscription, covering the full suite of JetBrains IDEs.",
    },
  },
  {
    id: "signpath",
    name: "SignPath",
    tagline: "Code signing for open source — signed Windows releases without the certificate bill.",
    url: "https://signpath.io",
    accentColor: "#00BAF2",
    highlightColor: "#33C9F5",
    logoImg: "/img/sponsors/signpath.png",
    logoImgCompact: "/img/sponsors/signpath_compact.png",
    logoImgBg: "#ffffff",
    modalDescription:
      "SignPath.io is a code signing platform that keeps private keys on Hardware Security Modules and plugs signing directly into CI pipelines — no USB tokens, no keys on build machines. Through the SignPath Foundation, it provides free code signing certificates to qualifying open source projects, verifying that every signed binary was built from the project's public repository. Tabularis was accepted into the program, and signing is being wired into the release pipeline so Windows builds ship signed.",
    features: [
      { icon: "✍️", text: "Free code signing certificates for open source projects" },
      { icon: "🔐", text: "Private keys on HSMs — never on build machines or USB tokens" },
      { icon: "⚙️", text: "Signing integrated into CI — every release signed automatically" },
      { icon: "🔍", text: "Verified builds — signed binaries provably come from the public repo" },
      { icon: "🛡️", text: "No more \"unknown publisher\" warnings on Windows installers" },
    ],
    offer: {
      title: "Free code signing for open source",
      description:
        "SignPath Foundation issues free code signing certificates to qualifying open source projects. Apply through their program and ship signed releases without buying a certificate.",
    },
  },
];

// GitHub Sponsors tiers — https://github.com/sponsors/debba
// These mirror the tiers configured in the Sponsors dashboard. GitHub does not
// expose tier creation via API, so the dashboard remains the source of truth;
// this array keeps a code-side copy for display and reference.
export interface SponsorTier {
  id: string;
  name: string;
  /** Price in USD. */
  amount: number;
  /** "recurring" = monthly, "one-time" = single donation. */
  frequency: "recurring" | "one-time";
  description: string;
  benefits: string[];
  /** Highlighted as the suggested tier in the UI. */
  featured?: boolean;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: "coffee",
    name: "Buy me a coffee ☕",
    amount: 15,
    frequency: "one-time",
    description: "A one-off thank-you to keep Tabularis moving.",
    benefits: ["Your name in the backers list"],
  },
  {
    id: "supporter",
    name: "Supporter",
    amount: 5,
    frequency: "recurring",
    description: "Support Tabularis development every month.",
    benefits: [
      "Sponsor badge on your GitHub profile",
      "Our gratitude in the release notes shout-outs",
    ],
  },
  {
    id: "backer",
    name: "Backer",
    amount: 20,
    frequency: "recurring",
    description: "Everything in Supporter, plus a spot in the README.",
    benefits: [
      "Sponsor badge on your GitHub profile",
      "Your logo or name in the Tabularis project README",
    ],
    featured: true,
  },
  {
    id: "bronze",
    name: "Bronze Sponsor",
    amount: 50,
    frequency: "recurring",
    description: "Everything in Backer, plus visibility on the website.",
    benefits: [
      "Your logo or name on the Tabularis website (tabularis.dev)",
      "Logo or name in the project README",
      "Sponsor badge on your GitHub profile",
    ],
  },
  {
    id: "gold",
    name: "Company / Gold Sponsor",
    amount: 250,
    frequency: "recurring",
    description: "For companies backing Tabularis.",
    benefits: [
      "Prominent logo on tabularis.dev/sponsors with link + tagline",
      "Logo on the project website & README",
      "A social shout-out on our channels (Bluesky / X)",
      "Priority consideration for feature discussions",
    ],
  },
];
