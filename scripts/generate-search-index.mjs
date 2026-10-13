import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { create, insert, save } from "@orama/orama";

const CONTENT_DIR = path.join(process.cwd(), "content");
const WIKI_DIR = path.join(CONTENT_DIR, "wiki");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const SEO_DIR = path.join(CONTENT_DIR, "seo");
const ROADMAP_DIR = path.join(CONTENT_DIR, "roadmap");
const APP_DIR = path.join(process.cwd(), "src", "app");
const VIDEOS_PATH = path.join(process.cwd(), "src", "lib", "videos", "index.ts");
const REGISTRY_PATH = path.join(process.cwd(), "plugins", "registry.json");
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

function insertPage({ slug, title, body = "", excerpt = "", meta, url }) {
  insert(db, {
    type: "page",
    slug,
    title,
    body,
    excerpt,
    meta,
    badge: "",
    url,
    category: "",
    tags: "",
  });
}

// Static app routes, discovered from src/app/**/page.tsx. Dynamic routes
// ([slug]) come from their content sources below; noindex pages are skipped.
const STRING = `(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`;
const unescape = (a, b) => (a ?? b).replace(/\\(.)/g, "$1");
const stripSuffix = (title) => title.replace(/\s*\|\s*Tabularis.*$/, "");

function findPageFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("[")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...findPageFiles(full));
    else if (entry.name === "page.tsx") found.push(full);
  }
  return found;
}

function firstString(source, pattern) {
  const m = source.match(new RegExp(`${pattern}\\s*${STRING}`));
  return m ? unescape(m[1], m[2]) : "";
}

for (const file of findPageFiles(APP_DIR)) {
  const source = fs.readFileSync(file, "utf-8");
  if (/robots:\s*\{\s*index:\s*false/.test(source)) continue;
  const route = path
    .relative(APP_DIR, path.dirname(file))
    .split(path.sep)
    .filter((seg) => seg && !seg.startsWith("("))
    .join("/");
  const title =
    firstString(source, "const title\\s*=") || firstString(source, "title:");
  if (!title) continue;
  const description =
    firstString(source, "const description\\s*=") ||
    firstString(source, "description:");
  // Card titles and descriptions declared in the page give it searchable text.
  const body = [...source.matchAll(new RegExp(`(?:title|description|label):\\s*${STRING}`, "g"))]
    .map((m) => unescape(m[1], m[2]))
    .join("\n");
  insertPage({
    slug: route ? `route-${route.replace(/\//g, "-")}` : "route-home",
    title: route ? stripSuffix(title) : "Tabularis",
    body,
    excerpt: description,
    meta: "Page",
    url: `/${route}`,
  });
}

// Roadmap initiatives
if (fs.existsSync(ROADMAP_DIR)) {
  const files = fs.readdirSync(ROADMAP_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(ROADMAP_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const slug = data.slug ?? file.replace(/\.md$/, "");
    insertPage({
      slug: `roadmap-${slug}`,
      title: data.title ?? "",
      body: stripMarkdown(content),
      excerpt: data.lede ?? "",
      meta: "Roadmap",
      url: `/roadmap/${slug}`,
    });
  }
}

// Demo videos (hardcoded in src/lib/videos/index.ts, read as text)
if (fs.existsSync(VIDEOS_PATH)) {
  const source = fs.readFileSync(VIDEOS_PATH, "utf-8");
  const re = new RegExp(`slug:\\s*${STRING},\\s*title:\\s*${STRING},\\s*description:\\s*${STRING}`, "g");
  let count = 0;
  for (const m of source.matchAll(re)) {
    const slug = unescape(m[1], m[2]);
    const title = unescape(m[3], m[4]);
    const description = unescape(m[5], m[6]);
    insertPage({
      slug: `demo-${slug}`,
      title,
      body: description,
      excerpt: description,
      meta: "Demo",
      url: `/demos/${slug}`,
    });
    count++;
  }
  if (count === 0) console.warn("No demo videos parsed from src/lib/videos/index.ts");
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
        url: plugin.registry_url ?? plugin.homepage,
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
