import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const REPO = process.env.TABULARIS_APP_REPO ?? "TabularisDB/tabularis";
const REF = process.env.TABULARIS_APP_REF ?? "main";
const BASE = `https://raw.githubusercontent.com/${REPO}/${REF}`;

const targets = [
  {
    url: `${BASE}/src/version.ts`,
    out: "src/lib/version.ts",
    transform: (body) => {
      const match = body.match(/APP_VERSION\s*=\s*"([^"]+)"/);
      if (!match) throw new Error("Could not parse APP_VERSION from upstream src/version.ts");
      return `export const APP_VERSION = "${match[1]}";\n`;
    },
  },
  { url: `${BASE}/CHANGELOG.md`, out: "CHANGELOG.md" },
  { url: `${BASE}/plugins/registry.json`, out: "plugins/registry.json" },
];

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.text();
}

async function main() {
  for (const { url, out, transform } of targets) {
    const raw = await fetchText(url);
    const body = transform ? transform(raw) : raw;
    const abs = resolve(process.cwd(), out);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, body);
    console.log(`fetched ${url} -> ${out}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
