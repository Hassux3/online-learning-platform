// Small reusable layout primitives shared by every slide's Body component.
// Kept separate from slidesData.jsx to keep that file pure content.

export function Bullets({ items }) {
  return (
    <div className="sg-list">
      {items.map((it, i) => (
        <div className="bul" key={i}>
          <span className="n">{String(i + 1).padStart(2, "0")}</span>
          <span dangerouslySetInnerHTML={{ __html: it }} />
        </div>
      ))}
    </div>
  );
}

export function TwoCol({ left, right }) {
  return (
    <div className="sg-2">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export function Card({ title, color = "#6ee7b7", children }) {
  return (
    <div className="s-card" style={{ borderColor: `${color}40` }}>
      <div className="s-pill" style={{ marginBottom: 10 }}>
        <span className="d" style={{ background: color }} />
        {title}
      </div>
      <div style={{ fontSize: 14, color: "var(--stext2)", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

export function TechChip({ icon, name, why, color = "#6ee7b7" }) {
  return (
    <div className="tech-chip">
      <span className="ic" style={{ background: `${color}22`, color }}>
        {icon}
      </span>
      <div>
        <div className="nm">{name}</div>
        <div className="wy">{why}</div>
      </div>
    </div>
  );
}

export function DiagramStage({ children, h = 440 }) {
  return (
    <div className="dg-box" style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {children}
    </div>
  );
}

export function StatRow({ stats }) {
  return (
    <div style={{ display: "flex", gap: 18 }}>
      {stats.map((s) => (
        <div key={s.l} className="s-card" style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: s.c || "#6ee7b7" }}>{s.v}</div>
          <div style={{ fontSize: 12.5, color: "var(--smuted)", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}
