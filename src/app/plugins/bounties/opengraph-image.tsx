import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";
export const alt = "Plugin Bounty Board — Tabularis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

// Radar geometry (SVG is 660×630)
const CX = 330;
const CY = 315;
const MAX_R = 250;

function pct(px: number, py: number): [number, number] {
  const scale = (MAX_R * 2) / 100;
  return [
    Math.round((CX + (px - 50) * scale) * 10) / 10,
    Math.round((CY + (py - 50) * scale) * 10) / 10,
  ];
}

function polar(deg: number, r: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [
    Math.round((CX + r * Math.sin(rad)) * 10) / 10,
    Math.round((CY - r * Math.cos(rad)) * 10) / 10,
  ];
}

interface DotData {
  sx: number;
  sy: number;
  accent: string;
  r: number;
  star: boolean;
}

function buildDots(): DotData[] {
  const raw: [number, number, string, number, boolean][] = [
    [25, 33, "#f43f5e", 9, true],   // oracle (most-wanted)
    [76, 38, "#ff5a3d", 7, false],  // sql-server
    [66, 20, "#ef4444", 6, false],  // amazon-redshift
    [72, 26, "#f97316", 6, false],  // cockroachdb
    [84, 46, "#22c55e", 5, false],  // tidb
    [18, 43, "#60a5fa", 6, false],  // cassandra
    [47, 30, "#0ea5e9", 5, false],  // mariadb
    [57, 70, "#38bdf8", 7, false],  // snowflake
    [32, 68, "#22c55e", 6, false],  // mongodb
    [68, 60, "#facc15", 6, false],  // dynamodb
    [40, 18, "#a78bfa", 5, false],  // trino-presto
    [22, 58, "#334155", 4, false],
    [62, 44, "#334155", 4, false],
    [80, 64, "#334155", 4, false],
    [44, 80, "#334155", 4, false],
  ];
  return raw.map(([x, y, accent, r, star]) => {
    const [sx, sy] = pct(x, y);
    return { sx, sy, accent, r, star };
  });
}

interface EdgeData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function buildEdges(dots: DotData[]): EdgeData[] {
  const pairs: [number, number][] = [
    [0, 5], [0, 2], [2, 3], [2, 1],
    [1, 4], [7, 9], [8, 5], [10, 6],
  ];
  return pairs.map(([a, b]) => ({
    x1: dots[a].sx,
    y1: dots[a].sy,
    x2: dots[b].sx,
    y2: dots[b].sy,
  }));
}

export default async function Image() {
  const logoSrc = readPublicImage("/img/logo.png");
  const [font400, font800] = await Promise.all([loadFont(400), loadFont(800)]);

  const fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"] =
    [];
  if (font400) fonts.push({ name: "Inter", data: font400, weight: 400 });
  if (font800) fonts.push({ name: "Inter", data: font800, weight: 800 });

  const DOTS = buildDots();
  const EDGES = buildEdges(DOTS);

  // Sweep arm at 35° from north (pointing NNE toward sql-server / redshift cluster)
  const SWEEP = 35;
  const [armX, armY] = polar(SWEEP, MAX_R);
  const [beamL1x, beamL1y] = polar(SWEEP - 10, MAX_R);
  const [beamL2x, beamL2y] = polar(SWEEP + 12, MAX_R);
  const [trailNx, trailNy] = polar(0, MAX_R); // north (trail start)

  // Ring radii
  const r1 = Math.round(MAX_R * 0.25);
  const r2 = Math.round(MAX_R * 0.5);
  const r3 = Math.round(MAX_R * 0.75);
  const r4 = MAX_R;

  const oracle = DOTS[0];

  return new ImageResponse(
    (
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
        {/* Grid H */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Grid V */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Left ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "520px",
            height: "520px",
            background:
              "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 60%)",
            borderRadius: "50%",
          }}
        />

        {/* Oracle glow (positioned in image space at oracle dot) */}
        <div
          style={{
            position: "absolute",
            top: "90px",
            left: "590px",
            width: "280px",
            height: "280px",
            background:
              "radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 60%)",
            borderRadius: "50%",
          }}
        />

        {/* Left panel */}
        <div
          style={{
            position: "relative",
            width: "540px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "56px 56px 56px 64px",
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "36px",
            }}
          >
            {logoSrc ? (
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "50%",
                  border: "1px solid rgba(56,189,248,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  width={26}
                  height={26}
                  alt=""
                  style={{ objectFit: "contain" }}
                />
              </div>
            ) : null}
            <span
              style={{
                color: "#38bdf8",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.3px",
              }}
            >
              tabularis
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginBottom: "22px",
              padding: "5px 16px",
              background: "rgba(244,63,94,0.12)",
              border: "1px solid rgba(244,63,94,0.45)",
              borderRadius: "100px",
              color: "#f43f5e",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "1.4px",
              textTransform: "uppercase",
            }}
          >
            Open Bounties
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "68px",
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: "-2.5px",
              color: "#f1f5f9",
              marginBottom: "22px",
            }}
          >
            <span>Plugin</span>
            <span>Bounty Board</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              fontWeight: 400,
              color: "#64748b",
              lineHeight: 1.4,
              marginBottom: "40px",
            }}
          >
            Ship a driver. Earn your spot on the map.
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "32px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              <span
                style={{
                  color: "#38bdf8",
                  fontSize: "32px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  lineHeight: "1",
                }}
              >
                7
              </span>
              <span
                style={{
                  color: "#475569",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
              >
                constellation
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              <span
                style={{
                  color: "#f43f5e",
                  fontSize: "32px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  lineHeight: "1",
                }}
              >
                1
              </span>
              <span
                style={{
                  color: "#475569",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
              >
                most wanted
              </span>
            </div>
          </div>
        </div>

        {/* Oracle label (SVG text not supported; use absolute HTML div) */}
        <div
          style={{
            position: "absolute",
            left: "685px",
            top: "185px",
            width: "120px",
            display: "flex",
            justifyContent: "center",
            color: "#f43f5e",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          MOST WANTED
        </div>

        {/* Vertical separator */}
        <div
          style={{
            position: "absolute",
            left: "540px",
            top: "56px",
            width: "1px",
            height: "518px",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(56,189,248,0.18) 20%, rgba(56,189,248,0.18) 80%, transparent 100%)",
          }}
        />

        {/* Radar SVG */}
        <svg
          style={{ position: "absolute", right: "0", top: "0" }}
          width="660"
          height="630"
          viewBox="0 0 660 630"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rings */}
          <circle cx={CX} cy={CY} r={r1} fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={r2} fill="none" stroke="rgba(56,189,248,0.14)" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={r3} fill="none" stroke="rgba(56,189,248,0.10)" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={r4} fill="none" stroke="rgba(56,189,248,0.07)" strokeWidth="1" />

          {/* Crosshair */}
          <line x1={CX} y1={CY - MAX_R - 8} x2={CX} y2={CY + MAX_R + 8} stroke="rgba(56,189,248,0.07)" strokeWidth="1" />
          <line x1={CX - MAX_R - 8} y1={CY} x2={CX + MAX_R + 8} y2={CY} stroke="rgba(56,189,248,0.07)" strokeWidth="1" />

          {/* Trailing sweep arc (north → sweep) */}
          <path
            d={`M ${CX} ${CY} L ${trailNx} ${trailNy} A ${MAX_R} ${MAX_R} 0 0 1 ${armX} ${armY} Z`}
            fill="rgba(56,189,248,0.05)"
          />

          {/* Beam highlight */}
          <path
            d={`M ${CX} ${CY} L ${beamL1x} ${beamL1y} A ${MAX_R} ${MAX_R} 0 0 1 ${beamL2x} ${beamL2y} Z`}
            fill="rgba(56,189,248,0.1)"
          />

          {/* Sweep arm */}
          <line x1={CX} y1={CY} x2={armX} y2={armY} stroke="rgba(56,189,248,0.85)" strokeWidth="2" />
          <circle cx={armX} cy={armY} r="5" fill="rgba(56,189,248,0.45)" />
          <circle cx={armX} cy={armY} r="3" fill="rgba(56,189,248,1)" />

          {/* Constellation edges */}
          {EDGES.map((e, i) => (
            <line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="rgba(56,189,248,0.22)"
              strokeWidth="1"
              strokeDasharray="4 5"
            />
          ))}

          {/* Regular dots (non-star) */}
          {DOTS.filter((d) => !d.star).map((d, i) => (
            <g key={i}>
              <circle cx={d.sx} cy={d.sy} r={d.r + 3} fill={d.accent} opacity="0.25" />
              <circle cx={d.sx} cy={d.sy} r={d.r} fill={d.accent} />
            </g>
          ))}

          {/* Oracle (most-wanted) — rendered last to appear on top */}
          <circle cx={oracle.sx} cy={oracle.sy} r={oracle.r + 22} fill={oracle.accent} opacity="0.07" />
          <circle cx={oracle.sx} cy={oracle.sy} r={oracle.r + 13} fill={oracle.accent} opacity="0.14" />
          <circle cx={oracle.sx} cy={oracle.sy} r={oracle.r + 5} fill={oracle.accent} opacity="0.32" />
          <circle cx={oracle.sx} cy={oracle.sy} r={oracle.r} fill={oracle.accent} />
          <circle cx={oracle.sx} cy={oracle.sy} r={oracle.r * 0.38} fill="white" opacity="0.88" />

          {/* Center */}
          <circle cx={CX} cy={CY} r="10" fill="rgba(56,189,248,0.12)" />
          <circle cx={CX} cy={CY} r="5" fill="rgba(56,189,248,0.7)" />
          <circle cx={CX} cy={CY} r="2.5" fill="white" opacity="0.9" />
        </svg>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}
