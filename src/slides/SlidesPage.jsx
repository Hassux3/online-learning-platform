import { useEffect, useState } from "react";
import SlideFrame, { SW, SH } from "./SlideFrame";
import { SLIDES } from "./slidesData";
import { SLIDE_CSS } from "./theme";
import Presentation from "./Presentation";
import { exportSlidesToPdf } from "./pdfExport";

// Thumbnail width steps down at a few breakpoints instead of a fixed 272px,
// so the grid stays usable from a 360px phone up to a wide desktop without
// per-thumbnail resize observers.
function useThumbWidth() {
  const pick = () => {
    const vw = window.innerWidth;
    if (vw < 420) return 132;
    if (vw < 640) return 160;
    if (vw < 900) return 200;
    return 272;
  };
  const [w, setW] = useState(pick);
  useEffect(() => {
    const onResize = () => setW(pick());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

function useIsNarrow(breakpoint = 560) {
  const [narrow, setNarrow] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return narrow;
}

function Thumb({ slide, index, onOpen, thumbW, thumbH }) {
  const scale = thumbW / SW;
  return (
    <button
      onClick={() => onOpen(index)}
      style={{
        width: thumbW,
        height: thumbH,
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
      <div
        style={{
          width: SW,
          height: SH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
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
  const thumbW = useThumbWidth();
  const thumbH = SH * (thumbW / SW);
  const narrow = useIsNarrow();

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
    <div style={{ padding: narrow ? "18px 16px" : "28px 32px", maxWidth: 1200 }}>
      <style>{SLIDE_CSS}</style>

      <div
        style={{
          display: "flex",
          flexDirection: narrow ? "column" : "row",
          alignItems: narrow ? "stretch" : "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ marginBottom: 10 }}>
            <span className="p p-g" style={{ fontSize: 12 }}>
              ● {SLIDES.length} Slides we have prepared for you
            </span>
          </div>
          <h1
            style={{
              fontSize: narrow ? 21 : 26,
              fontWeight: 800,
              letterSpacing: "-.5px",
              marginBottom: 7,
            }}
          >
            Presentation Slides
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0, flexDirection: narrow ? "column" : "row" }}>
          <button
            onClick={download}
            disabled={!!exporting}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              justifyContent: "center",
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
          gridTemplateColumns: `repeat(auto-fill, ${thumbW}px)`,
          gap: narrow ? 10 : 16,
          justifyContent: narrow ? "center" : "start",
          background: "var(--s2)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: narrow ? 12 : 20,
        }}
      >
        {SLIDES.map((slide, i) => (
          <div key={slide.id}>
            <Thumb slide={slide} index={i} onOpen={openAt} thumbW={thumbW} thumbH={thumbH} />
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                marginTop: 6,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: thumbW,
              }}
            >
              {i + 1}. {slide.nav || slide.title?.replace(/<[^>]+>/g, "") || slide.id}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>
        {narrow
          ? "On a phone, the presentation opens in landscape — rotate when prompted."
          : (
            <>
              Tip: once presenting, use <b>→</b> / <b>←</b> (or Space) to move between slides, and <b>Esc</b> to exit fullscreen.
            </>
          )}
      </p>

      {presenting && <Presentation startIndex={startAt} onExit={() => setPresenting(false)} />}
    </div>
  );
}
