import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "@/lib/markdown";
import { wrapVideosInHtml } from "@/lib/markdownVideos";
import { DEFAULT_AUTHOR_HANDLE } from "@/lib/authors";

export interface PostOg {
  title: string;
  accent: string;
  claim: string;
  image: string;
  // When set, forces this exact 1200×630 image as the OG card, bypassing the
  // generated title/accent/claim template. Path is relative to /public.
  cover?: string;
  // Selects the generated OG template. Omitted / "default" → the screenshot
  // template; "code-terminal" → the JetBrains Mono terminal template;
  // "screenshot-split" → the split layout with a framed product screenshot.
  template?: "default" | "code-terminal" | "screenshot-split";
  // Terminal template only: title-bar label and the monospace body lines
  // (lightly syntax-highlighted; prefix a line with "> ", "< ", "$ " or "# ").
  codeTitle?: string;
  codeLines?: string[];
  // screenshot-split template only: window title-bar label above the screenshot.
  appLabel?: string;
  // screenshot-split template only: drop the border/shadow frame around the
  // right-hand image — for transparent artwork (logos) instead of screenshots.
  frameless?: boolean;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  release: string;
  tags: string[];
  excerpt: string;
  og?: PostOg;
  readingTime: number;
  /** Lowercased author handles; first is the primary author. */
  authors: string[];
}

/**
 * Path to a post's Open Graph image, used as the card/hero visual.
 * In production the static export emits `opengraph-image.png`, and the
 * extension-less convention route is served as application/octet-stream by
 * static hosts (rejected by link-card scrapers) — so we use `.png` there.
 * The dev server only serves the extension-less convention route, so omit
 * `.png` in development.
 */
export function postOgImage(slug: string): string {
  const ext = process.env.NODE_ENV === "production" ? ".png" : "";
  return `/blog/${slug}/opengraph-image${ext}`;
}

function parseAuthors(data: Record<string, unknown>): string[] {
  const raw = data.authors as string[] | undefined;
  const handles = raw && raw.length ? raw : [DEFAULT_AUTHOR_HANDLE];
  return handles.map((h) => String(h).toLowerCase());
}

const WORDS_PER_MINUTE = 200;

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// The first page shows a featured hero post + a 6-card grid (7 total);
// every subsequent page shows a full 6-card grid.
export const FIRST_PAGE_POSTS = 7;
export const POSTS_PER_PAGE = 6;

export function getTotalPages(): number {
  const total = getAllPosts().length;
  if (total <= FIRST_PAGE_POSTS) return 1;
  return 1 + Math.ceil((total - FIRST_PAGE_POSTS) / POSTS_PER_PAGE);
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: (data.title as string) ?? "",
      date: (data.date as string) ?? "",
      release: (data.release as string) ?? "",
      tags: (data.tags as string[]) ?? [],
      excerpt: (data.excerpt as string) ?? "",
      og: data.og as PostOg | undefined,
      readingTime: estimateReadingTime(content),
      authors: parseAuthors(data),
    } satisfies PostMeta;
  });

  // Sort by date descending; use slug as stable tiebreaker
  return posts.sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : a.slug.localeCompare(b.slug);
  });
}

/** Posts authored (or co-authored) by the given handle, newest first. */
export function getPostsByAuthor(handle: string): PostMeta[] {
  const h = handle.toLowerCase();
  return getAllPosts().filter((p) => p.authors.includes(h));
}

/** Every author handle that has at least one published post. */
export function getAllAuthorHandles(): string[] {
  const set = new Set<string>();
  for (const p of getAllPosts()) for (const a of p.authors) set.add(a);
  return [...set];
}

export function getPaginatedPosts(page: number): {
  posts: PostMeta[];
  totalPages: number;
  currentPage: number;
} {
  const all = getAllPosts();
  const totalPages = getTotalPages();
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start =
    currentPage === 1
      ? 0
      : FIRST_PAGE_POSTS + (currentPage - 2) * POSTS_PER_PAGE;
  const count = currentPage === 1 ? FIRST_PAGE_POSTS : POSTS_PER_PAGE;
  return {
    posts: all.slice(start, start + count),
    totalPages,
    currentPage,
  };
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  getAllPosts().forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

export async function getPostBySlug(
  slug: string,
): Promise<{ meta: PostMeta; html: string } | null> {
  const mdPath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) return null;

  const raw = fs.readFileSync(mdPath, "utf-8");
  const { data, content } = matter(raw);

  const meta: PostMeta = {
    slug,
    title: (data.title as string) ?? "",
    date: (data.date as string) ?? "",
    release: (data.release as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    excerpt: (data.excerpt as string) ?? "",
    og: data.og as PostOg | undefined,
    readingTime: estimateReadingTime(content),
    authors: parseAuthors(data),
  };

  let processedContent = content;
  if (processedContent.includes(":::contributors:::")) {
    if (meta.release) {
      const usernames = await fetchReleaseContributors(meta.release);
      processedContent = processedContent.replace(
        ":::contributors:::",
        renderContributorsHtml(usernames, meta.release),
      );
    } else {
      processedContent = processedContent.replace(":::contributors:::", "");
    }
  }

  const rawHtml = marked.parse(processedContent) as string;
  const html = wrapVideosInHtml(rawHtml);
  return { meta, html };
}

async function fetchReleaseContributors(tag: string): Promise<string[]> {
  try {
    const headers = { Accept: "application/vnd.github+json" };
    const relRes = await fetch(
      "https://api.github.com/repos/TabularisDB/tabularis/releases?per_page=100",
      { headers },
    );
    const allReleases: {
      tag_name: string;
      published_at: string;
      prerelease: boolean;
      draft: boolean;
    }[] = await relRes.json();
    // Nightly builds are published as prereleases; only stable releases
    // define the contributor window.
    const releases = allReleases.filter((r) => !r.prerelease && !r.draft);
    const idx = releases.findIndex((r) => r.tag_name === tag);
    const prevTag =
      idx >= 0 && idx + 1 < releases.length
        ? releases[idx + 1].tag_name
        : null;
    if (!prevTag) return [];

    const users = new Set<string>();

    const cmpRes = await fetch(
      `https://api.github.com/repos/TabularisDB/tabularis/compare/${prevTag}...${tag}`,
      { headers },
    );
    const data: {
      commits: { author: { login: string; type: string } | null }[];
    } = await cmpRes.json();
    for (const commit of data.commits ?? []) {
      const author = commit.author;
      if (
        author?.login &&
        author.type !== "Bot" &&
        !author.login.endsWith("[bot]")
      ) {
        users.add(author.login);
      }
    }

    const prevDate = releases[idx + 1].published_at;
    const curDate = releases[idx].published_at;
    if (prevDate && curDate) {
      const prsRes = await fetch(
        `https://api.github.com/search/issues?q=repo:TabularisDB/tabularis+is:pr+is:merged+merged:${prevDate}..${curDate}&per_page=100`,
        { headers },
      );
      const prsData: {
        items: { user: { login: string; type: string } | null }[];
      } = await prsRes.json();
      for (const pr of prsData.items ?? []) {
        const user = pr.user;
        if (
          user?.login &&
          user.type !== "Bot" &&
          !user.login.endsWith("[bot]")
        ) {
          users.add(user.login);
        }
      }
    }

    return Array.from(users);
  } catch {
    return [];
  }
}

function renderContributorsHtml(usernames: string[], release?: string): string {
  if (!usernames.length) return "";
  const label = release ? `Contributors in ${release}` : "Contributors";
  const items = usernames
    .map(
      (u) =>
        `<a class="contributor-item" href="https://github.com/${u}" target="_blank" rel="noopener noreferrer">` +
        `<img src="https://github.com/${u}.png?size=64" alt="${u}" class="contributor-avatar" width="52" height="52" />` +
        `<span class="contributor-name">@${u}</span>` +
        `</a>`,
    )
    .join("");
  return `<div class="contributors-block"><span class="contributors-label">${label}</span><div class="contributors-list">${items}</div></div>`;
}

export function getReleaseDate(version: string): string | null {
  const tag = version.startsWith("v") ? version : `v${version}`;
  const post = getAllPosts().find((p) => p.release === tag);
  return post?.date ?? null;
}

export function getAdjacentPosts(slug: string): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export function formatDate(iso: string): string {
  const hasTime = iso.includes("T");
  const d = new Date(hasTime ? iso : iso + "T12:00:00Z");
  const dateStr = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  if (hasTime) {
    return `${dateStr}, ${iso.slice(11, 16)}`;
  }
  return dateStr;
}
