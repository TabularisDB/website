import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "@/lib/markdown";

export type InitiativeStatus = "in-progress" | "planned" | "done";

export interface InitiativeLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface InitiativeMeta {
  slug: string;
  title: string;
  category: string;
  status: InitiativeStatus;
  order: number;
  lede: string;
  progressDone?: number;
  progressTotal?: number;
  progressLabel?: string;
  links?: InitiativeLink[];
}

export interface Initiative {
  meta: InitiativeMeta;
  html: string;
}

const ROADMAP_DIR = path.join(process.cwd(), "content", "roadmap");

function parseMeta(slug: string, data: Record<string, unknown>): InitiativeMeta {
  return {
    slug,
    title: (data.title as string) ?? "",
    category: (data.category as string) ?? "",
    status: (data.status as InitiativeStatus) ?? "in-progress",
    order: (data.order as number) ?? 99,
    lede: (data.lede as string) ?? "",
    progressDone: data.progressDone as number | undefined,
    progressTotal: data.progressTotal as number | undefined,
    progressLabel: data.progressLabel as string | undefined,
    links: (data.links as InitiativeLink[] | undefined) ?? [],
  };
}

export function getAllInitiatives(): Initiative[] {
  if (!fs.existsSync(ROADMAP_DIR)) return [];
  const files = fs.readdirSync(ROADMAP_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(ROADMAP_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const meta = parseMeta(slug, data);
      const html = marked.parse(content) as string;
      return { meta, html };
    })
    .sort((a, b) => a.meta.order - b.meta.order);
}

export function getAllInitiativeMetas(): InitiativeMeta[] {
  return getAllInitiatives().map((i) => i.meta);
}

export function getInitiativeBySlug(slug: string): Initiative | null {
  const mdPath = path.join(ROADMAP_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) return null;
  const raw = fs.readFileSync(mdPath, "utf-8");
  const { data, content } = matter(raw);
  const meta = parseMeta(slug, data);
  const html = marked.parse(content) as string;
  return { meta, html };
}

export function getAllInitiativeSlugs(): string[] {
  if (!fs.existsSync(ROADMAP_DIR)) return [];
  return fs
    .readdirSync(ROADMAP_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
