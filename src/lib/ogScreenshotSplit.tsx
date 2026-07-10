import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const OG_SIZE = { width: 1200, height: 630 } as const;

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

export interface ScreenshotSplitOgOptions {
  /** White first headline line. */
  title?: string;
  /** Cyan-gradient second headline line. */
  accent?: string;
  /** Subtitle under the headline. */
  claim?: string;
  /** Path under /public to the product screenshot shown on the right. */
  image?: string;
  /** Accepted for frontmatter compatibility; not rendered (no window chrome). */
  appLabel?: string;
  /** Optional version badge (e.g. "v0.13.4"). */
  release?: string;
  /** Drop the border/shadow frame around the image — for transparent artwork. */
  frameless?: boolean;
}

/**
 * Blog OG template sharing the code-terminal split layout — left text column,
 * right framed visual — but the right panel is a product screenshot inside a
 * window chrome instead of a terminal mock. Opt in per post via
 * `og.template: "screenshot-split"`.
 */
export async function renderScreenshotSplitOgImage({
  title,
  accent,
  claim,
  image,
  release,
  frameless,
}: ScreenshotSplitOgOptions): Promise<ImageResponse> {
  const logoSrc = readPublicImage("/img/logo.png");
  const shotSrc = image ? readPublicImage(image) : null;
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
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "27px 27px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "27px 27px",
        }}
      />
      {/* Glows */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "120px",
          width: "760px",
          height: "520px",
          background:
            "radial-gradient(ellipse at center, rgba(14,165,233,0.22) 0%, transparent 65%)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-160px",
          right: "-80px",
          width: "560px",
          height: "560px",
          background:
            "radial-gradient(circle at center, rgba(99,102,241,0.18) 0%, transparent 65%)",
          borderRadius: "50%",
        }}
      />

      {/* LEFT column */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "590px",
          height: "630px",
          padding: "56px",
        }}
      >
        {/* Badge row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 14px 4px 4px",
              background: "rgba(15,23,42,0.7)",
              border: "1px solid rgba(56,189,248,0.3)",
              borderRadius: "100px",
            }}
          >
            {logoSrc && (
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  background: "#020617",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  width={14}
                  height={14}
                  alt=""
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: 400,
              }}
            >
              <span style={{ color: "#38bdf8", fontWeight: 800 }}>Tabularis</span>
              <span>Blog</span>
            </div>
          </div>
          {release && (
            <div
              style={{
                display: "flex",
                padding: "4px 12px",
                background: "rgba(88,166,255,0.12)",
                border: "1px solid rgba(88,166,255,0.3)",
                borderRadius: "100px",
                color: "#58a6ff",
                fontSize: "13px",
                fontWeight: 800,
              }}
            >
              {release}
            </div>
          )}
        </div>

        {/* Headline + claim */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "46px",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              lineHeight: 1.12,
            }}
          >
            {title && <span style={{ color: "#ffffff" }}>{title}</span>}
            {accent && (
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {accent}
              </span>
            )}
          </div>
          {claim && (
            <div
              style={{
                display: "flex",
                fontSize: "18px",
                fontWeight: 400,
                color: "#94a3b8",
                lineHeight: 1.55,
                marginTop: "22px",
                maxWidth: "470px",
              }}
            >
              {claim}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            color: "#64748b",
            fontSize: "18px",
            fontWeight: 800,
            letterSpacing: "-0.3px",
          }}
        >
          tabularis.dev
        </div>
      </div>

      {/* RIGHT column — bare product screenshot, no window chrome */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {shotSrc && (
          <div
            style={{
              display: "flex",
              width: "620px",
              height: "520px",
              overflow: "hidden",
              alignItems: "center",
              ...(frameless
                ? {}
                : {
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRight: "none",
                    borderRadius: "12px 0 0 12px",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                  }),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shotSrc} alt="" style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>
    </div>,
    { ...OG_SIZE, fonts },
  );
}
