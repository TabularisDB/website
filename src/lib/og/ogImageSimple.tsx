import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

function readPublicImage(filePath: string): string | null {
  try {
    const abs = path.join(process.cwd(), "public", filePath.replace(/^\//, ""));
    const buf = fs.readFileSync(abs);
    const ext = path.extname(abs).toLowerCase().slice(1);
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function loadFont(weight: 400 | 800): Promise<ArrayBuffer | null> {
  try {
    const url = `https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.15/files/inter-latin-${weight}-normal.woff`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

export interface SimpleOgOptions {
  title: string;
  kicker?: string;
}

export async function renderSimpleOgImage({
  title,
  kicker,
}: SimpleOgOptions): Promise<ImageResponse> {
  const logoSrc = readPublicImage("/img/logo.png");
  const [font400, font800] = await Promise.all([loadFont(400), loadFont(800)]);

  const fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"] = [];
  if (font400) fonts.push({ name: "Inter", data: font400, weight: 400 });
  if (font800) fonts.push({ name: "Inter", data: font800, weight: 800 });

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: "#020617",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Grid — horizontal lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "27px 27px",
        }}
      />
      {/* Grid — vertical lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "27px 27px",
        }}
      />

      {/* Glow — top center */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "200px",
          width: "800px",
          height: "534px",
          background:
            "radial-gradient(ellipse at center, rgba(14,165,233,0.25) 0%, transparent 65%)",
          borderRadius: "50%",
        }}
      />
      {/* Glow — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: "-134px",
          left: "-67px",
          width: "534px",
          height: "534px",
          background:
            "radial-gradient(circle at center, rgba(99,102,241,0.2) 0%, transparent 65%)",
          borderRadius: "50%",
        }}
      />
      {/* Glow — right */}
      <div
        style={{
          position: "absolute",
          top: "200px",
          right: "-134px",
          width: "667px",
          height: "667px",
          background:
            "radial-gradient(circle at center, rgba(56,189,248,0.15) 0%, transparent 65%)",
          borderRadius: "50%",
        }}
      />

      {/* Logo + wordmark — top left */}
      <div
        style={{
          position: "absolute",
          top: "56px",
          left: "64px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {logoSrc && (
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#020617",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              width={28}
              height={28}
              alt=""
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
        <span
          style={{
            color: "#e2e8f0",
            fontSize: "30px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
          }}
        >
          <span style={{ color: "#38bdf8" }}>tabularis</span>
        </span>
      </div>

      {/* Centered content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "0 80px",
        }}
      >
        {kicker && (
          <div
            style={{
              padding: "6px 16px",
              background: "rgba(15,23,42,0.7)",
              border: "1px solid rgba(56,189,248,0.3)",
              borderRadius: "100px",
              color: "#38bdf8",
              fontSize: "16px",
              fontWeight: 800,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "28px",
            }}
          >
            {kicker}
          </div>
        )}

        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: 800,
            letterSpacing: "-1.6px",
            lineHeight: 1.1,
            maxWidth: "1000px",
            textAlign: "center",
            backgroundImage:
              "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </div>

      </div>
    </div>,
    { ...OG_SIZE, fonts },
  );
}
