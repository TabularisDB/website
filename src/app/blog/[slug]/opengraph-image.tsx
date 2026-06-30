import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { renderCodeTerminalOgImage } from "@/lib/ogCodeTerminal";
import { renderScreenshotSplitOgImage } from "@/lib/ogScreenshotSplit";
import fs from "fs";
import path from "path";

export const alt = "Tabularis Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

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

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const og = post?.meta.og;
  const release = post?.meta.release;

  const logoSrc = readPublicImage("/img/logo.png");
  const screenshotSrc = og?.image ? readPublicImage(og.image) : null;

  // Forced cover: a post can supply a ready-made 1200×630 image via `og.cover`,
  // which is rendered full-bleed and bypasses the generated template entirely.
  const coverSrc = og?.cover ? readPublicImage(og.cover) : null;
  if (coverSrc) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "1200px", height: "630px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverSrc} alt="" width={1200} height={630} style={{ objectFit: "cover" }} />
      </div>,
      { ...size },
    );
  }

  // Alternative template, opt-in per post via `og.template`. The JetBrains
  // Mono terminal card lives in its own module; the screenshot template below
  // stays the default.
  if (og?.template === "code-terminal") {
    return renderCodeTerminalOgImage({
      title: og.title,
      accent: og.accent,
      claim: og.claim,
      codeTitle: og.codeTitle,
      codeLines: og.codeLines,
    });
  }

  // Split layout with a framed product screenshot on the right.
  if (og?.template === "screenshot-split") {
    return renderScreenshotSplitOgImage({
      title: og.title,
      accent: og.accent,
      claim: og.claim,
      image: og.image,
      appLabel: og.appLabel,
      release,
    });
  }

  const [font400, font800] = await Promise.all([loadFont(400), loadFont(800)]);

  const fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"] = [];
  if (font400) fonts.push({ name: "Inter", data: font400, weight: 400 });
  if (font800) fonts.push({ name: "Inter", data: font800, weight: 800 });

  // Bespoke partnership lockup for the Vercel Open Source Program post — a
  // logo composition (Vercel △ + Tabularis cube) on the house background,
  // instead of the screenshot template.
  if (slug === "vercel-open-source-program") {
    return new ImageResponse(
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#020617",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
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
            top: "-180px",
            left: "300px",
            width: "700px",
            height: "500px",
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

        {/* Tabularis Blog pill */}
        <div
          style={{
            position: "absolute",
            top: "44px",
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
              <img src={logoSrc} width={14} height={14} alt="" style={{ objectFit: "contain" }} />
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#e2e8f0",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            <span style={{ color: "#38bdf8", fontWeight: 800 }}>Tabularis</span>
            <span>Blog</span>
          </div>
        </div>

        {/* Logo lockup: Vercel △  +  Tabularis cube */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            marginBottom: "56px",
          }}
        >
          <div
            style={{
              width: "152px",
              height: "152px",
              borderRadius: "34px",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="94" height="80" viewBox="0 0 94 80">
              <path d="M47 0 L94 80 L0 80 Z" fill="#000000" />
            </svg>
          </div>

          <div style={{ display: "flex", fontSize: "60px", fontWeight: 400, color: "#475569" }}>
            +
          </div>

          <div
            style={{
              width: "152px",
              height: "152px",
              borderRadius: "34px",
              background: "#0b0c0e",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {logoSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} width={100} height={100} alt="" style={{ objectFit: "contain" }} />
            )}
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "52px",
            fontWeight: 800,
            letterSpacing: "-1.4px",
            lineHeight: 1.08,
            textAlign: "center",
          }}
        >
          <span
            style={{
              backgroundImage: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Tabularis joins the
          </span>
          <span style={{ color: "#ffffff" }}>Vercel Open Source Program</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: "21px",
            fontWeight: 400,
            color: "#94a3b8",
            letterSpacing: "-0.2px",
            marginTop: "22px",
          }}
        >
          Spring 2026 cohort · a year of support for the open-source web
        </div>

        {/* tabularis.dev */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "64px",
            display: "flex",
            color: "#64748b",
            fontSize: "20px",
            fontWeight: 800,
            letterSpacing: "-0.3px",
          }}
        >
          tabularis.dev
        </div>
      </div>,
      { ...size, fonts },
    );
  }

  if (!og) {
    return new ImageResponse(
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "48px",
          fontWeight: 800,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {post?.meta.title ?? "Tabularis Blog"}
      </div>,
      { ...size, fonts },
    );
  }

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

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "48px",
          width: "100%",
          height: "630px",
        }}
      >
        {/* Badge row: "Tabularis Blog" + version */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          {/* Tabularis Blog badge */}
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
                gap: "4px",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: 400,
              }}
            >
              <span style={{ color: "#38bdf8", fontWeight: 800 }}>
                Tabularis
              </span>
              <span>Blog</span>
            </div>
          </div>

          {/* Version badge */}
          {release && (
            <div
              style={{
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

        {/* Tagline — two separate lines */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "48px",
            fontWeight: 800,
            letterSpacing: "-1.2px",
            lineHeight: 1.1,
            marginBottom: "14px",
            maxWidth: "1000px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              backgroundImage:
                "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {og.title}
          </span>
          <span style={{ color: "#ffffff" }}>{og.accent}</span>
        </div>

        {/* Claim */}
        <div
          style={{
            fontSize: "19px",
            fontWeight: 400,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "700px",
            letterSpacing: "-0.3px",
            marginBottom: "32px",
          }}
        >
          {og.claim}
        </div>

        {/* Screenshot — natural width, clipped at bottom by overflow hidden */}
        {screenshotSrc && (
          <div
            style={{
              width: "1040px",
              flex: 1,
              overflow: "hidden",
              borderRadius: "8px 8px 0 0",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshotSrc} alt="" style={{ width: "100%" }} />
          </div>
        )}
      </div>
    </div>,
    { ...size, fonts },
  );
}
