import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Tabularis Sponsors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#0d1117",
          padding: "80px 96px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://github.com/TabularisDB/tabularis/blob/main/website/public/img/logo.png?raw=true"
            width={48}
            height={48}
            alt="Tabularis"
            style={{ borderRadius: 10 }}
          />
          <span style={{ color: "#e6edf3", fontSize: 28, fontWeight: 600, letterSpacing: "-0.5px" }}>
            tabularis
          </span>
        </div>

        {/* Main heading */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 820,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>🤝</span>
            <span
              style={{
                color: "#a78bfa",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Sponsors
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 64,
              fontWeight: 700,
              color: "#e6edf3",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
            }}
          >
            <span>Support open source</span>
            <span>database tooling.</span>
          </div>

          <p
            style={{
              fontSize: 26,
              color: "#8b949e",
              margin: 0,
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            Help keep Tabularis free for every developer.
          </p>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 56,
            gap: 12,
          }}
        >
          <div
            style={{
              background: "#a78bfa",
              color: "#0d1117",
              fontSize: 20,
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 8,
              display: "flex",
            }}
          >
            tabularis.dev/sponsors
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
