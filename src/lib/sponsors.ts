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
];
