import { ImageResponse } from "next/og";
import { profile } from "./data/portfolio";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#f6f6f3",
          color: "#111313",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 600 }}>{profile.name}</div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 650,
              lineHeight: 1.02,
              letterSpacing: -1.8,
            }}
          >
            Archive of applied systems
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(17,19,19,0.62)",
              maxWidth: 980,
            }}
          >
            AI, automation, market signals, retail learning, and MBA case notes.
          </div>
        </div>

        <div style={{ fontSize: 22, color: "rgba(17,19,19,0.55)" }}>
          mohitakrishna.in
        </div>
      </div>
    ),
    size,
  );
}
