import fs from "fs";
import path from "path";

export const dynamic = "force-static";
export const alt = "Tabularis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public", "img", "og.png"),
  );
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
