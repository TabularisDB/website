import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");

// Content dir → canonical URL builder. The redirect target is the
// canonical URL of the file that declared `redirect_from:` in its frontmatter.
const SOURCES = [
  {
    dir: path.join(ROOT, "content", "posts"),
    canonical: (slug) => `/blog/${slug}`,
  },
  {
    dir: path.join(ROOT, "content", "wiki"),
    canonical: (slug) => `/wiki/${slug}`,
  },
  {
    dir: path.join(ROOT, "content", "seo"),
    canonical: (slug, data) => `/${data.section ?? "solutions"}/${slug}`,
  },
  {
    dir: path.join(ROOT, "content", "roadmap"),
    canonical: (slug) => `/roadmap/${slug}`,
  },
];

function renderHtml(target) {
  const safe = target.replace(/"/g, "&quot;");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="${safe}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${safe}">
<script>window.location.replace(${JSON.stringify(target)});</script>
</head>
<body>
<p>Redirecting to <a href="${safe}">${safe}</a>…</p>
</body>
</html>
`;
}

function emitRedirect(from, to) {
  if (!from.startsWith("/")) {
    throw new Error(`redirect_from must be an absolute path starting with /: ${from}`);
  }
  if (from === to) {
    throw new Error(`redirect_from points at its own canonical URL: ${from}`);
  }

  const html = renderHtml(to);
  const rel = from.replace(/^\/+/, "");
  const flat = path.join(OUT_DIR, `${rel}.html`);
  const idx = path.join(OUT_DIR, rel, "index.html");

  // Refuse to clobber a real exported page (catches typos in redirect_from)
  for (const target of [flat, idx]) {
    if (fs.existsSync(target)) {
      throw new Error(
        `redirect_from "${from}" would overwrite existing file at ${target} — fix the slug or remove the entry`,
      );
    }
  }

  fs.mkdirSync(path.dirname(flat), { recursive: true });
  fs.writeFileSync(flat, html);
  fs.mkdirSync(path.dirname(idx), { recursive: true });
  fs.writeFileSync(idx, html);
  console.log(`Redirect: ${from} -> ${to}`);
}

let total = 0;
for (const { dir, canonical } of SOURCES) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data } = matter(raw);
    const list = data.redirect_from;
    if (!list) continue;
    const entries = Array.isArray(list) ? list : [list];
    const to = canonical(slug, data);
    for (const from of entries) {
      emitRedirect(from, to);
      total++;
    }
  }
}

if (total === 0) {
  console.log("No redirect_from entries found");
}
