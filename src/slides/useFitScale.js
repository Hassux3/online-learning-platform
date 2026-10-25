import { useEffect, useState } from "react";
import { SW, SH } from "./theme";

// Computes the scale + pixel offsets needed to fit a fixed SWxSH slide
// canvas inside the real browser viewport, centered, letterboxed if the
// aspect ratio doesn't match. Driven directly by window.innerWidth/Height
// (not a ResizeObserver on a nested flex child) so it stays correct across
// the async viewport resize that happens when entering/exiting Fullscreen.
export default function useFitScale() {
  const [box, setBox] = useState(() => computeBox());

  useEffect(() => {
    const onResize = () => setBox(computeBox());
    window.addEventListener("resize", onResize);
    document.addEventListener("fullscreenchange", onResize);
    // Fullscreen transitions (and some browser chrome animations) can land
    // a frame or two after the resize/fullscreenchange event fires.
    const t1 = setTimeout(onResize, 60);
    const t2 = setTimeout(onResize, 260);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return box;
}

function computeBox() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / SW, vh / SH);
  const w = SW * scale;
  const h = SH * scale;
  return { scale, w, h, left: (vw - w) / 2, top: (vh - h) / 2 };
}
