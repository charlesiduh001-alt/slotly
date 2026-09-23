import { ImageResponse } from "next/og";

// Home-screen icon for iOS ("Add to Home Screen").
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          color: "white",
          fontSize: 104,
          fontWeight: 600,
          letterSpacing: -4,
        }}
      >
        G
      </div>
    ),
    size,
  );
}
