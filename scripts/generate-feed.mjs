import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BASE_URL = "https://tabularis.dev";
const SITE_TITLE = "Tabularis Blog";
const SITE_DESCRIPTION =
  "Releases, guides and product notes from Tabularis — the open-source desktop database client.";
const AUTHOR = "Andrea Debernardi";
const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const OUT_DIR = path.join(process.cwd(), "out");
const MAX_ITEMS = 30;

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Custom :::...::: fenced blocks (newsletter, plugin, contributors) are
// interactive widgets that make no sense in a feed — drop them so they don't
// leak as raw text into the rendered HTML.
function stripCustomBlocks(md) {
  return md.replace(/^:::[\s\S]*?:::\s*$/gm, "").replace(/:::[^\n:]+:::/g, "");
}

// Resolve root-relative URLs (src="/...", href="/...") to absolute so feed
// readers can load images and links outside the site context.
function absolutizeUrls(html) {
  return html.replace(/(src|href)="\/(?!\/)/g, `$1="${BASE_URL}/`);
}

function toRfc822(iso) {
  const hasTime = iso.includes("T");
  const d = new Date(hasTime ? iso : iso + "T12:00:00Z");
  return d.toUTCString();
}

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

const posts = files
  .map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const html = absolutizeUrls(marked.parse(stripCustomBlocks(content)));
    return {
      slug,
      title: data.title ?? "",
      date: data.date ?? "",
      excerpt: data.excerpt ?? "",
      tags: data.tags ?? [],
      url: `${BASE_URL}/blog/${slug}`,
      image: `${BASE_URL}/blog/${slug}/opengraph-image.png`,
      html,
    };
  })
  .sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : a.slug.localeCompare(b.slug);
  })
  .slice(0, MAX_ITEMS);

const lastBuild = posts[0] ? toRfc822(posts[0].date) : new Date().toUTCString();

// ---- RSS 2.0 (feed.xml) ----
const rssItems = posts
  .map(
    (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${p.url}</link>
      <guid isPermaLink="true">${p.url}</guid>
      <pubDate>${toRfc822(p.date)}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
      <content:encoded><![CDATA[${p.html}]]></content:encoded>
      <enclosure url="${p.image}" type="image/png" />
${p.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n")}
    </item>`,
  )
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(OUT_DIR, "feed.xml"), rss);

// ---- JSON Feed 1.1 (feed.json) ----
const jsonFeed = {
  version: "https://jsonfeed.org/version/1.1",
  title: SITE_TITLE,
  home_page_url: `${BASE_URL}/blog`,
  feed_url: `${BASE_URL}/feed.json`,
  description: SITE_DESCRIPTION,
  language: "en",
  authors: [{ name: AUTHOR }],
  items: posts.map((p) => ({
    id: p.url,
    url: p.url,
    title: p.title,
    summary: p.excerpt,
    content_html: p.html,
    image: p.image,
    date_published: p.date.includes("T") ? p.date : `${p.date}T12:00:00Z`,
    tags: p.tags,
    authors: [{ name: AUTHOR }],
  })),
};

fs.writeFileSync(
  path.join(OUT_DIR, "feed.json"),
  JSON.stringify(jsonFeed, null, 2) + "\n",
);

console.log("Generated feed.xml and feed.json with %d items", posts.length);
