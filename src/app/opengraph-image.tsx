import { ImageResponse } from "next/og";
import { logoDataUri } from "@/components/logo";
import { business } from "@/lib/business";

// Preview card shown when the site is shared (WhatsApp, LinkedIn, X, Slack…).
export const alt = `${business.name}: book hair, nails and grooming online`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const slots = ["9:00 AM", "10:30 AM", "12:00 PM", "2:30 PM"];
  // A two-week strip of the calendar grid; filled tiles are "available".
  const days = Array.from({ length: 14 }, (_, i) => ({ n: ((20 + i) % 30) + 1, available: ![0, 6, 7, 13].includes(i) }));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", padding: 72, background: "#ffffff", color: "#111111" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", paddingRight: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoDataUri()} width={56} height={56} alt="" />
            <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>{business.name}</div>
          </div>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2.5, display: "flex" }}>
            The easier way to book your next appointment
          </div>
          <div style={{ fontSize: 26, color: "#6b7280" }}>{business.tagline}</div>
        </div>
        <div
          style={{
            width: 380,
            alignSelf: "center",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 28,
            borderRadius: 16,
            background: "white",
            border: "2px solid #e5e7eb",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 600 }}>Silk Press · 1 hr 30 min</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {days.map((d) => (
              <div
                key={d.n}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: d.available ? 600 : 400,
                  background: d.n === 24 ? "#1b2a5e" : d.available ? "#f5f5f5" : "white",
                  color: d.n === 24 ? "white" : d.available ? "#111111" : "#898989",
                }}
              >
                {d.n}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {slots.map((t) => (
              <div
                key={t}
                style={{
                  width: 156,
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px 0",
                  borderRadius: 8,
                  fontSize: 20,
                  fontWeight: 600,
                  border: "2px solid #e5e7eb",
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "12px 0",
              borderRadius: 8,
              background: "#111111",
              color: "white",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Confirm
          </div>
        </div>
      </div>
    ),
    size,
  );
}
