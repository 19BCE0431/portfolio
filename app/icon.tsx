import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "#111313",
          color: "#fbfbf8",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: -0.5,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        M
      </div>
    ),
    size,
  );
}

