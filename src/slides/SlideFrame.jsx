import { SW, SH } from "./theme";

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE FRAME
// Every slide renders into a fixed 1280×720 canvas so the live presentation,
// the grid thumbnails, and the PDF export all produce pixel-identical output.
// ══════════════════════════════════════════════════════════════════════════════
export default function SlideFrame({ slide, index, total }) {
  const { kicker, title, sub, Body, bare } = slide;
  return (
    <div className="slide-frame" data-slide-index={index}>
      <div className="slide-grain" />
      {bare ? (
        <Body />
      ) : (
        <div className="slide-inner">
          {kicker && (
            <div className="slide-kicker">
              <span className="dot" />
              {kicker}
            </div>
          )}
          {title && (
            <h1 className="slide-title" dangerouslySetInnerHTML={{ __html: title }} />
          )}
          {sub && <p className="slide-sub">{sub}</p>}
          <div className="slide-body">{Body ? <Body /> : null}</div>
        </div>
      )}
      <div className="slide-foot">
        <span className="brand">
          <span className="sq" />
          LearnPlatform — Software Engineering Mini Project
        </span>
        <span className="slide-pg">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

export { SW, SH };
