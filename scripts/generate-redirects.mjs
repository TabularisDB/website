import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "out");

const REDIRECTS = [
  {
    from: "/blog/v0100-ai-safety-audit-approvals",
    to: "/blog/v0100-ai-safety-audit-approval",
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

for (const { from, to } of REDIRECTS) {
  const html = renderHtml(to);
  const flatPath = path.join(OUT_DIR, `${from}.html`);
  const dirPath = path.join(OUT_DIR, from, "index.html");

  fs.mkdirSync(path.dirname(flatPath), { recursive: true });
  fs.writeFileSync(flatPath, html);

  fs.mkdirSync(path.dirname(dirPath), { recursive: true });
  fs.writeFileSync(dirPath, html);

  console.log(`Redirect: ${from} -> ${to}`);
}
