import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { create, insert, save } from "@orama/orama";

const CONTENT_DIR = path.join(process.cwd(), "content");
const WIKI_DIR = path.join(CONTENT_DIR, "wiki");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const SEO_DIR = path.join(CONTENT_DIR, "seo");
const REGISTRY_PATH = path.join(process.cwd(), "..", "plugins", "registry.json");
const OUT_PATH = path.join(process.cwd(), "public", "search-index.json");

function stripMarkdown(md) {
  return md
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~`>|]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

const db = create({
  schema: {
    type: "enum",
    slug: "string",
    title: "string",
    body: "string",
    excerpt: "string",
    meta: "string",
    badge: "string",
    url: "string",
    category: "string",
    tags: "string",
  },
});

// Wiki pages
if (fs.existsSync(WIKI_DIR)) {
  const files = fs.readdirSync(WIKI_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(WIKI_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    insert(db, {
      type: "wiki",
      slug,
      title: data.title ?? "",
      body: stripMarkdown(content),
      excerpt: data.excerpt ?? "",
      meta: "Wiki",
      badge: "",
      url: "",
      category: data.category ?? "",
      tags: "",
    });
  }
}

// Blog posts
if (fs.existsSync(POSTS_DIR)) {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    insert(db, {
      type: "post",
      slug,
      title: data.title ?? "",
      body: stripMarkdown(content),
      excerpt: data.excerpt ?? "",
      meta: data.date ?? "",
      badge: data.release ?? "",
      url: "",
      category: "",
      tags: (data.tags ?? []).join(" "),
    });
  }
}

// SEO pages
if (fs.existsSync(SEO_DIR)) {
  const files = fs.readdirSync(SEO_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(SEO_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const section = data.section ?? "solutions";
    insert(db, {
      type: "page",
      slug,
      title: data.title ?? "",
      body: stripMarkdown(content),
      excerpt: data.excerpt ?? "",
      meta: section === "compare" ? "Compare" : "Solutions",
      badge: "",
      url: `/${section}/${slug}`,
      category: section,
      tags: "",
    });
  }
}

// Plugins
if (fs.existsSync(REGISTRY_PATH)) {
  try {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
    for (const plugin of registry.plugins ?? []) {
      insert(db, {
        type: "plugin",
        slug: plugin.id,
        title: plugin.name,
        body: plugin.description,
        excerpt: plugin.description,
        meta: "Plugin",
        badge: `v${plugin.latest_version}`,
        url: plugin.homepage,
        category: "",
        tags: "",
      });
    }
  } catch {
    console.warn("Could not read plugin registry");
  }
}

const serialized = save(db);
fs.writeFileSync(OUT_PATH, JSON.stringify(serialized));

const stats = { wiki: 0, post: 0, plugin: 0, page: 0 };
const docs = serialized.docs?.docs ?? {};
for (const doc of Object.values(docs)) {
  if (doc?.type) stats[doc.type]++;
}
console.log(
  "Generated search-index.json: %d wiki, %d posts, %d plugins, %d pages",
  stats.wiki,
  stats.post,
  stats.plugin,
  stats.page,
);
