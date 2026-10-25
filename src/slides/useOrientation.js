import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 860; // below this, treat the shorter axis as "phone/tablet-ish"

function readState() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const touch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  return {
    vw,
    vh,
    isPortrait: vh > vw,
    isSmall: Math.min(vw, vh) < MOBILE_BREAKPOINT,
    isTouch: touch,
  };
}

// Tracks viewport orientation/size so the presenter can be told to rotate
// their device instead of being handed an unreadable, letterboxed deck.
export default function useOrientation() {
  const [state, setState] = useState(readState);

  useEffect(() => {
    const update = () => setState(readState());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener ? mq.addEventListener("change", update) : mq.addListener(update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      mq.removeEventListener ? mq.removeEventListener("change", update) : mq.removeListener(update);
    };
  }, []);

  return state;
}
