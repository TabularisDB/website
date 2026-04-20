import fs from "fs";
import path from "path";

export type SectionType = "fix" | "feat" | "breaking" | "perf" | "other";

export interface ChangelogEntry {
  description: string;
  scope?: string;
  commitHash?: string;
  commitUrl?: string;
}

export interface ChangelogSection {
  title: string;
  type: SectionType;
  entries: ChangelogEntry[];
}

export interface ChangelogVersion {
  version: string;
  date: string;
  compareUrl?: string;
  isMajor: boolean;
  sections: ChangelogSection[];
}

function sectionType(title: string): SectionType {
  const t = title.toLowerCase();
  if (t.includes("bug") || t.includes("fix")) return "fix";
  if (t.includes("breaking")) return "breaking";
  if (t.includes("performance")) return "perf";
  if (t.includes("feat")) return "feat";
  return "other";
}

function boldToHtml(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function parseEntry(line: string): ChangelogEntry | null {
  // Handles both **scope:** (colon inside bold) and **scope**: (colon outside)
  const match = line.match(/^\*\s+(?:\*\*([^*:]+):\*\*\s+|\*\*([^*]+)\*\*:\s+)?(.+)$/);
  if (!match) return null;

  const scope = (match[1] ?? match[2])?.trim();
  let description = match[3].trim();

  let commitHash: string | undefined;
  let commitUrl: string | undefined;

  const commitMatch = description.match(
    /\s*\(?\[([a-f0-9]{7,})\]\((https?:\/\/[^)]+)\)\)?/,
  );
  if (commitMatch) {
    commitHash = commitMatch[1];
    commitUrl = commitMatch[2];
    description = description.replace(commitMatch[0], "").trim();
  }

  description = description
    .replace(/,?\s*closes\s+\[#\d+\]\([^)]+\)/gi, "")
    .replace(/\(\s*\)$/, "")
    .trim();

  return { description: boldToHtml(description), scope, commitHash, commitUrl };
}

export function getChangelog(): ChangelogVersion[] {
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  if (!fs.existsSync(changelogPath)) return [];

  const lines = fs.readFileSync(changelogPath, "utf-8").split("\n");
  const versions: ChangelogVersion[] = [];
  let current: ChangelogVersion | null = null;
  let currentSection: ChangelogSection | null = null;

  for (const line of lines) {
    const versionMatch = line.match(
      /^(#{1,2})\s+\[([^\]]+)\]\(([^)]+)\)\s+\((\d{4}-\d{2}-\d{2})\)/,
    );
    if (versionMatch) {
      if (current) versions.push(current);
      current = {
        version: versionMatch[2],
        compareUrl: versionMatch[3],
        date: versionMatch[4],
        isMajor: versionMatch[1] === "#",
        sections: [],
      };
      currentSection = null;
      continue;
    }

    const sectionMatch = line.match(/^###\s+(.+)/);
    if (sectionMatch && current) {
      currentSection = {
        title: sectionMatch[1].trim(),
        type: sectionType(sectionMatch[1]),
        entries: [],
      };
      current.sections.push(currentSection);
      continue;
    }

    if (line.startsWith("* ") && currentSection) {
      const entry = parseEntry(line);
      if (entry) currentSection.entries.push(entry);
    }
  }

  if (current) versions.push(current);
  return versions;
}
