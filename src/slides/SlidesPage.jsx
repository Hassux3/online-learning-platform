import { useState } from "react";
import SlideFrame, { SW, SH } from "./SlideFrame";
import { SLIDES } from "./slidesData";
import { SLIDE_CSS } from "./theme";
import Presentation from "./Presentation";
import { exportSlidesToPdf } from "./pdfExport";

const THUMB_W = 272;
const THUMB_SCALE = THUMB_W / SW;
const THUMB_H = SH * THUMB_SCALE;

function Thumb({ slide, index, onOpen }) {
  return (
    <button
      onClick={() => onOpen(index)}
      style={{
        width: THUMB_W,
        height: THUMB_H,
        border: "1px solid var(--sline, rgba(255,255,255,.09))",
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
        padding: 0,
        background: "#0a0e14",
        cursor: "pointer",
        flexShrink: 0,
      }}
      title={`Jump to slide ${index + 1}`}
    >
      <div style={{ width: SW, height: SH, transform: `scale(${THUMB_SCALE})`, transformOrigin: "top left" }}>
        <SlideFrame slide={slide} index={index} total={SLIDES.length} />
      </div>
      <span
        style={{
          position: "absolute",
          top: 6,
          left: 7,
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          background: "rgba(0,0,0,.55)",
          borderRadius: 5,
          padding: "2px 6px",
        }}
      >
        {index + 1}
      </span>
    </button>
  );
}

export default function SlidesPage() {
  const [presenting, setPresenting] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const [exporting, setExporting] = useState(null);

  const openAt = (i) => {
    // Must be requested synchronously inside the click handler — browsers
    // reject Fullscreen API calls that aren't a direct result of a user
    // gesture, which is what broke fullscreen when it was requested from
    // the Presentation component's mount effect instead.
    document.documentElement.requestFullscreen?.().catch(() => {});
    setStartAt(i);
    setPresenting(true);
  };

  const download = async () => {
    setExporting({ done: 0, total: SLIDES.length });
    try {
      await exportSlidesToPdf((done, total) => setExporting({ done, total }));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200 }}>
      <style>{SLIDE_CSS}</style>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <div style={{ marginBottom: 10 }}>
            <span className="p p-g" style={{ fontSize: 12 }}>
              ● {SLIDES.length} Slides Ready
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.5px", marginBottom: 7 }}>Presentation Slides</h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 560, lineHeight: 1.7 }}>
            UML diagrams, architecture &amp; tech-stack walkthrough for the SE mini-project —
            ready to present fullscreen or export as a PDF.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button
            onClick={download}
            disabled={!!exporting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "11px 18px",
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--ink2)",
              cursor: exporting ? "not-allowed" : "pointer",
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? `Exporting ${exporting.done}/${exporting.total}…` : "⬇ Download PDF"}
          </button>
          <button
            onClick={() => openAt(0)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--green)",
              border: "none",
              borderRadius: 10,
              padding: "11px 20px",
              fontSize: 13.5,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ▶ Start Presentation
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, ${THUMB_W}px)`,
          gap: 16,
          background: "var(--s2)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 20,
        }}
      >
        {SLIDES.map((slide, i) => (
          <div key={slide.id}>
            <Thumb slide={slide} index={i} onOpen={openAt} />
            <div
              style={{
                fontSize: 11.5,
                color: "var(--muted)",
                marginTop: 6,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: THUMB_W,
              }}
            >
              {i + 1}. {slide.nav || slide.title?.replace(/<[^>]+>/g, "") || slide.id}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>
        Tip: once presenting, use <b>→</b> / <b>←</b> (or Space) to move between slides, and{" "}
        <b>Esc</b> to exit fullscreen.
      </p>

      {presenting && <Presentation startIndex={startAt} onExit={() => setPresenting(false)} />}
    </div>
  );
}
