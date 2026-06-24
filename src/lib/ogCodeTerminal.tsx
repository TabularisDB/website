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

async function loadMonoFont(weight: 400 | 700): Promise<ArrayBuffer | null> {
  try {
    const url = `https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.21/files/jetbrains-mono-latin-${weight}-normal.woff`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

// One Dark-ish palette.
const C = {
  punct: "#5c6370",
  key: "#c678dd",
  str: "#98c379",
  num: "#d19a66",
  text: "#abb2bf",
  req: "#38bdf8",
  res: "#4ade80",
  comment: "#5c6370",
};

interface Tok {
  text: string;
  color: string;
  bold?: boolean;
}

/**
 * Light JSON-ish tokenizer for the terminal mock. Recognises a line prefix
 * (`> ` request, `< ` response, `$ ` shell, `# ` comment) and colours quoted
 * strings (keys vs values by a trailing colon), numbers, and punctuation.
 */
function tokenizeCodeLine(line: string): Tok[] {
  const toks: Tok[] = [];
  const prefixMatch = line.match(/^(> |< |\$ |# )/);
  let rest = line;

  if (prefixMatch) {
    const p = prefixMatch[1];
    if (p === "# ") return [{ text: line, color: C.comment }];
    const color = p === "> " ? C.req : p === "< " ? C.res : C.punct;
    toks.push({ text: p, color, bold: p === "> " || p === "< " });
    rest = line.slice(p.length);
  }

  const re = /("(?:[^"\\]|\\.)*")|(\d+(?:\.\d+)?)|([^"\d]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest)) !== null) {
    if (m[1]) {
      // Quoted string — a following ':' makes it a key.
      const after = rest.slice(re.lastIndex).match(/^\s*:/);
      toks.push({ text: m[1], color: after ? C.key : C.str });
    } else if (m[2]) {
      toks.push({ text: m[2], color: C.num });
    } else {
      toks.push({ text: m[3], color: C.punct });
    }
  }
  return toks;
}

export interface CodeTerminalOgOptions {
  /** White first headline line. */
  title?: string;
  /** Cyan-gradient second headline line. */
  accent?: string;
  /** Subtitle under the headline. */
  claim?: string;
  /** Terminal title-bar label. */
  codeTitle?: string;
  /** Terminal body lines (tokenised for colour). */
  codeLines?: string[];
}

const DEFAULT_LINES = [
  "# one process per driver, over a pipe",
  "",
  '> {"method":"get_tables",',
  '  "params":{"db":"sales"},"id":7}',
  "",
  '< {"result":["users","orders"],',
  '  "id":7}',
];

/**
 * Alternative blog OG template: the release-cover dark grid/glow language, set
 * entirely in JetBrains Mono, with a terminal mock on the right. Opt in per
 * post via `og.template: "code-terminal"`.
 */
export async function renderCodeTerminalOgImage({
  title,
  accent,
  claim,
  codeTitle = "tabularis",
  codeLines,
}: CodeTerminalOgOptions): Promise<ImageResponse> {
  const logoSrc = readPublicImage("/img/logo.png");
  const [mono400, mono700] = await Promise.all([
    loadMonoFont(400),
    loadMonoFont(700),
  ]);

  const fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"] = [];
  if (mono400) fonts.push({ name: "JetBrains Mono", data: mono400, weight: 400 });
  if (mono700) fonts.push({ name: "JetBrains Mono", data: mono700, weight: 700 });

  const lines = codeLines && codeLines.length ? codeLines : DEFAULT_LINES;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: "#020617",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', monospace",
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
          width: "600px",
          height: "630px",
          padding: "56px",
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
            alignSelf: "flex-start",
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
            <span style={{ color: "#38bdf8", fontWeight: 700 }}>Tabularis</span>
            <span>Blog</span>
          </div>
        </div>

        {/* Headline + claim */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "43px",
              fontWeight: 700,
              letterSpacing: "-1.5px",
              lineHeight: 1.18,
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
                fontSize: "17px",
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
            fontWeight: 700,
            letterSpacing: "-0.3px",
          }}
        >
          tabularis.dev
        </div>
      </div>

      {/* RIGHT column — terminal mock */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingRight: "50px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "540px",
            background: "#0b0e14",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#ff5f56" }} />
            <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#ffbd2e" }} />
            <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#27c93f" }} />
            <div style={{ display: "flex", marginLeft: "10px", color: "#7d8590", fontSize: "13px" }}>
              {codeTitle}
            </div>
          </div>
          {/* Body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "22px",
              fontSize: "14.5px",
              lineHeight: 1.5,
            }}
          >
            {lines.map((line, i) =>
              line === "" ? (
                <div key={i} style={{ display: "flex", height: "14px" }} />
              ) : (
                <div key={i} style={{ display: "flex" }}>
                  {tokenizeCodeLine(line).map((t, j) => (
                    <span
                      key={j}
                      style={{
                        color: t.color,
                        fontWeight: t.bold ? 700 : 400,
                        whiteSpace: "pre",
                      }}
                    >
                      {t.text}
                    </span>
                  ))}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts },
  );
}
