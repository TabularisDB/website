import fs from "fs";
import path from "path";

const SPONSORS_FILE = path.join(process.cwd(), "src", "lib", "sponsors.ts");
const OUT_DIR = path.join(process.cwd(), "public");

let source = fs.readFileSync(SPONSORS_FILE, "utf-8");

source = source.replace(/export\s+interface\s+\w+\s*\{[^}]*\}\s*/g, "");
source = source.replace(/(export\s+const\s+\w+)\s*:\s*[^=]+=/g, "$1 =");

const dataUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { SPONSORS } = await import(dataUrl);

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

fs.writeFileSync(
  path.join(OUT_DIR, "sponsors.json"),
  JSON.stringify(SPONSORS, null, 2) + "\n",
);

console.log("Generated sponsors.json with %d sponsors", SPONSORS.length);
