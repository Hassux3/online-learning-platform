import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SlideFrame, { SW, SH } from "./SlideFrame";
import { SLIDES } from "./slidesData";
import useFitScale from "./useFitScale";
import useOrientation from "./useOrientation";
import RotatePrompt from "./RotatePrompt";

const N = SLIDES.length;

// ══════════════════════════════════════════════════════════════════════════════
// PRESENTATION — fullscreen player
// ArrowRight / ArrowLeft / Space step through slides, Escape exits (and drops
// out of the Fullscreen API if it's active). Mirrors the feel of hitting F11.
// On small portrait screens, a RotatePrompt blocks the deck until the device
// (or window) is turned landscape — a 16:9 canvas is unreadable otherwise.
// ══════════════════════════════════════════════════════════════════════════════
export default function Presentation({ startIndex = 0, onExit }) {
  const [i, setI] = useState(startIndex);
  const [dir, setDir] = useState(1);
  const [showChrome, setShowChrome] = useState(true);
  const rootRef = useRef(null);
  const { scale, w, h, left, top } = useFitScale();
  const { isPortrait, isSmall, isTouch } = useOrientation();
  const needsRotate = isPortrait && isSmall;
  const hideTimer = useRef(null);

  const go = useCallback(
    (delta) => {
      setDir(delta > 0 ? 1 : -1);
      setI((cur) => Math.min(Math.max(cur + delta, 0), N - 1));
    },
    []
  );

  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onExit?.(i);
  }, [onExit, i]);

  // Enter true browser fullscreen (same effect as the F11 key) on mount.
  // SlidesPage already requests it synchronously from the click handler
  // (Fullscreen API requires a direct user gesture) — this is a fallback
  // for whichever element ends up focused, and a no-op if already active.
  useEffect(() => {
    if (!document.fullscreenElement) {
      (rootRef.current || document.documentElement)?.requestFullscreen?.().catch(() => {});
    }
    const onFsChange = () => {
      if (!document.fullscreenElement) onExit?.(i);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Escape") {
        exit();
      } else if (e.key === "Home") {
        setI(0);
      } else if (e.key === "End") {
        setI(N - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, exit]);

  // Auto-hide the control chrome after idle mouse time, like a real deck.
  const bumpChrome = useCallback(() => {
    setShowChrome(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowChrome(false), 2600);
  }, []);
  useEffect(() => {
    bumpChrome();
    return () => clearTimeout(hideTimer.current);
  }, [bumpChrome, i]);

  const slide = SLIDES[i];

  return (
    <div
      ref={rootRef}
      className="deck-root deck-present"
      onMouseMove={bumpChrome}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#05070b",
        overflow: "hidden",
      }}
    >
      {needsRotate && (
        <>
          <RotatePrompt touch={isTouch} />
          <button
            onClick={exit}
            aria-label="Exit presentation"
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              zIndex: 1101,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.14)",
              color: "#c7cedb",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </>
      )}
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: w,
          height: h,
          boxShadow: "0 30px 90px rgba(0,0,0,.6)",
          borderRadius: 10 * scale,
          overflow: "hidden",
        }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          {/* Framer Motion owns `transform` on this element for the x/opacity
              transition — a static CSS `transform: scale()` here would get
              silently clobbered once the animation settles. The scale is
              applied on a separate, non-animated inner wrapper instead. */}
          <motion.div
            key={slide.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 60 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            <div style={{ width: SW, height: SH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <SlideFrame slide={slide} index={i} total={N} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 0 22px",
          display: "flex",
          justifyContent: "center",
          opacity: showChrome ? 1 : 0,
          transition: "opacity .35s",
          pointerEvents: showChrome ? "auto" : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "rgba(16,21,29,.92)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 100,
            padding: "9px 16px",
            backdropFilter: "blur(10px)",
          }}
        >
          <CtrlBtn onClick={() => go(-1)} disabled={i === 0} label="‹ Prev" />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: "#c7cedb", minWidth: 64, textAlign: "center" }}>
            {i + 1} / {N}
          </span>
          <CtrlBtn onClick={() => go(1)} disabled={i === N - 1} label="Next ›" />
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.14)" }} />
          <CtrlBtn onClick={exit} label="Esc · Exit" accent />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 3,
          background: "linear-gradient(90deg,#6ee7b7,#34d6a8)",
          width: `${((i + 1) / N) * 100}%`,
          transition: "width .3s",
        }}
      />
    </div>
  );
}

function CtrlBtn({ onClick, disabled, label, accent }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: accent ? "rgba(255,122,122,.14)" : "transparent",
        color: accent ? "#ff9b9b" : disabled ? "#4b5563" : "#f3f6fa",
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 12.5,
        fontWeight: 600,
        padding: "6px 12px",
        borderRadius: 100,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {label}
    </button>
  );
}
