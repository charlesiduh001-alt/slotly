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
          background: "#fbf7f2",
          color: "#1f1a17",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#6b5f57", marginTop: 12 }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              borderRadius: 999,
              border: 0,
              background: "#6b2d5e",
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
