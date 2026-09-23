"use client";

// Last-resort fallback if the root layout itself fails. It replaces the whole
// document, so it can't rely on the app's styles and uses inline ones.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#ffffff",
          color: "#111111",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -1, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#6b7280", marginTop: 12 }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 24,
              padding: "12px 20px",
              borderRadius: 8,
              border: 0,
              background: "#111111",
              color: "white",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
