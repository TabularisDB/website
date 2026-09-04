// Author registry for blog posts.
//
// Posts declare authorship via an `authors:` frontmatter array of handles
// (e.g. `authors: ["NewtTheWolf", "debba"]`). The FIRST handle is the primary
// author. Posts without an `authors` field fall back to DEFAULT_AUTHOR_HANDLE,
// which preserves the original "every post is by Andrea" behaviour.
//
// Handles are matched case-insensitively; the lowercased handle is also the
// URL slug for the author archive at /blog/author/<handle>.

export interface Author {
  /** Lowercase, URL-safe slug. Used in /blog/author/<handle>. */
  handle: string;
  name: string;
  /** GitHub username — drives the avatar and profile link. */
  github: string;
  bio: string;
}

export const DEFAULT_AUTHOR_HANDLE = "debba";

export const AUTHORS: Record<string, Author> = {
  debba: {
    handle: "debba",
    name: "Andrea Debernardi",
    github: "debba",
    bio: "Developer & creator of Tabularis. Building open-source tools for developers.",
  },
  newtthewolf: {
    handle: "newtthewolf",
    name: "Dominik Spitzli",
    github: "NewtTheWolf",
    bio: "Maintainer of Tabularis and Rust enthusiast. Building open-source developer tools.",
  },
};

export function getAuthor(handle: string): Author {
  return AUTHORS[handle.toLowerCase()] ?? AUTHORS[DEFAULT_AUTHOR_HANDLE];
}

/** Resolve an ordered, de-duplicated list of authors from frontmatter handles. */
export function resolveAuthors(handles?: string[]): Author[] {
  const list = handles && handles.length ? handles : [DEFAULT_AUTHOR_HANDLE];
  const seen = new Set<string>();
  const out: Author[] = [];
  for (const h of list) {
    const key = h.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(getAuthor(key));
  }
  return out;
}

export function authorAvatarUrl(github: string): string {
  return `https://github.com/${github}.png`;
}

export function authorGitHubUrl(github: string): string {
  return `https://github.com/${github}`;
}
