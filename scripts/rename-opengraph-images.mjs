import fs from "fs";
import path from "path";

// Next's static export emits each `opengraph-image` route as an
// extensionless file (e.g. out/blog/<slug>/opengraph-image) and references
// it from the HTML as `/opengraph-image?<hash>`. This runs AFTER `next build`
// and:
//   1. renames every such file to `opengraph-image.png`, and
//   2. rewrites the `/opengraph-image?` references in the emitted HTML and
//      RSC (.txt) payloads to `/opengraph-image.png?` so the PNGs are served
//      with a proper extension.
const OUT_DIR = path.join(process.cwd(), ".next");

let renamed = 0;
let rewritten = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name === "opengraph-image") {
      fs.renameSync(full, `${full}.png`);
      renamed++;
    }
  }
}

if (!fs.existsSync(OUT_DIR)) {
  console.error("out/ not found — run after `next build`");
  process.exit(1);
}

walk(OUT_DIR);

console.log(
  "Renamed %d opengraph-image files to opengraph-image.png; rewrote refs in %d HTML files",
  renamed,
  rewritten,
);
