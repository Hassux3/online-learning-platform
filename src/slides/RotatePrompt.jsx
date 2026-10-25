// Blocks the deck on small portrait screens and asks the presenter to
// rotate their device — a 16:9 slide canvas squeezed into a phone's
// portrait width is too small to read, landscape is the only usable mode.
export default function RotatePrompt({ touch }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "#05070b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 32px",
        gap: 22,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          border: "2px solid #6ee7b7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "rotateHint 1.8s ease-in-out infinite",
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      </div>
      <div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 21, fontWeight: 800, color: "#f3f6fa", margin: 0 }}>
          Rotate your {touch ? "device" : "window"}
        </h2>
        <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14.5, color: "#8b97a8", marginTop: 10, maxWidth: 320, lineHeight: 1.6 }}>
          {touch
            ? "This presentation is built for landscape. Turn your phone sideways to start."
            : "This presentation needs a wider, landscape-shaped window to display properly."}
        </p>
      </div>
      <style>{`@keyframes rotateHint{0%,100%{transform:rotate(0deg)}50%{transform:rotate(90deg)}}`}</style>
    </div>
  );
}
