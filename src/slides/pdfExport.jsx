import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SlideFrame from "./SlideFrame";
import { SLIDES } from "./slidesData";
import { SW, SH } from "./theme";

// ══════════════════════════════════════════════════════════════════════════════
// PDF EXPORT
// Renders every slide, off-screen, at full 1280×720 resolution, rasterizes
// each one with html2canvas, then stitches the images into a single
// landscape PDF — one slide per page, in the exact deck order.
// ══════════════════════════════════════════════════════════════════════════════
export async function exportSlidesToPdf(onProgress) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "-10000px";
  host.style.zIndex = "-1";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(
    <div className="deck-root" style={{ display: "flex", flexDirection: "column" }}>
      {SLIDES.map((slide, idx) => (
        <SlideFrame key={slide.id} slide={slide} index={idx} total={SLIDES.length} />
      ))}
    </div>
  );

  // Let fonts, layout and inline SVGs settle before rasterizing.
  await new Promise((r) => setTimeout(r, 60));
  if (document.fonts?.ready) await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [SW, SH] });
  const frames = host.querySelectorAll(".slide-frame");

  for (let i = 0; i < frames.length; i++) {
    onProgress?.(i + 1, frames.length);
    const canvas = await html2canvas(frames[i], {
      width: SW,
      height: SH,
      scale: 2,
      backgroundColor: "#0a0e14",
      useCORS: true,
    });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    if (i > 0) pdf.addPage([SW, SH], "landscape");
    pdf.addImage(img, "JPEG", 0, 0, SW, SH);
  }

  pdf.save("LearnPlatform-Presentation.pdf");

  root.unmount();
  host.remove();
}
