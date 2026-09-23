import { ImageResponse } from "next/og";
import { business } from "@/lib/business";

// Preview card shown when the site is shared (WhatsApp, LinkedIn, X, Slack…).
export const alt = `${business.name}: book hair, nails and grooming online`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const slots = ["9:00 AM", "10:30 AM", "12:00 PM", "2:30 PM"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 72,
          background: "radial-gradient(circle at 85% 10%, #eedbe8, #fbf7f2 55%)",
          fontFamily: "serif",
          color: "#1f1a17",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                background: "linear-gradient(135deg, #8f3f7c, #2e1128)",
                color: "white",
                fontSize: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              G
            </div>
            <div style={{ fontSize: 40, fontWeight: 600 }}>{business.name}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.05, maxWidth: 640 }}>
              Your next appointment, booked in
            </div>
            <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.1, color: "#6b2d5e" }}>under a minute.</div>
          </div>
          <div style={{ fontSize: 28, color: "#6b5f57", fontFamily: "sans-serif" }}>{business.tagline}</div>
        </div>
        <div
          style={{
            width: 360,
            alignSelf: "center",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: 32,
            borderRadius: 32,
            background: "white",
            border: "2px solid #e6dace",
            boxShadow: "0 30px 60px rgba(46,17,40,0.15)",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 22, color: "#6b5f57" }}>Next available</div>
          <div style={{ fontSize: 34, fontWeight: 700, fontFamily: "serif" }}>Silk Press</div>
          {slots.map((t, i) => (
            <div
              key={t}
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "14px 0",
                borderRadius: 16,
                fontSize: 24,
                fontWeight: 600,
                background: i === 0 ? "#6b2d5e" : "white",
                color: i === 0 ? "white" : "#1f1a17",
                border: i === 0 ? "2px solid #6b2d5e" : "2px solid #e6dace",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
