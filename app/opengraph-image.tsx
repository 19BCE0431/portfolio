import { ImageResponse } from "next/og";
import { profile } from "./data/portfolio";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background:
            "linear-gradient(180deg, rgba(246,246,243,1) 0%, rgba(239,241,239,1) 55%, rgba(246,246,243,1) 100%)",
          color: "#111313",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#69796b",
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 600 }}>{profile.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 86,
              fontWeight: 650,
              lineHeight: 1.02,
              letterSpacing: -1.8,
              maxWidth: 980,
            }}
          >
            MBA (IIM Sirmaur) · Applied AI & Data Systems
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
            Product strategy, marketing, retail learning, and business
            decision-making.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "rgba(17,19,19,0.55)",
          }}
        >
          <div>mohitakrishna.in</div>
          <div>India</div>
        </div>
      </div>
    ),
    size,
  );
}
