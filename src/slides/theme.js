// ══════════════════════════════════════════════════════════════════════════════
// SLIDES — DARK PRESENTATION THEME
// Self-contained design tokens + injected stylesheet for the presentation
// module. Kept separate from the app's own light-theme `G` stylesheet in
// App.jsx so the deck can evolve independently.
// ══════════════════════════════════════════════════════════════════════════════

export const SW = 1280; // slide design width  (16:9)
export const SH = 720; // slide design height

export const T = {
  bg: "#0a0e14",
  bg2: "#10151d",
  panel: "#131a24",
  panel2: "#1a222e",
  line: "rgba(255,255,255,.09)",
  line2: "rgba(255,255,255,.16)",
  text: "#f3f6fa",
  text2: "#c7cedb",
  muted: "#7c8798",
  accent: "#6ee7b7",
  accent2: "#34d6a8",
  blue: "#5aa6ff",
  purple: "#b79bff",
  amber: "#ffc26e",
  pink: "#ff8fc2",
  red: "#ff7a7a",
  mono: "'JetBrains Mono',monospace",
  sans: "'Plus Jakarta Sans',sans-serif",
};

export const SLIDE_CSS = `
.deck-root{--sbg:${T.bg};--sbg2:${T.bg2};--spanel:${T.panel};--spanel2:${T.panel2};
  --sline:${T.line};--sline2:${T.line2};--stext:${T.text};--stext2:${T.text2};
  --smuted:${T.muted};--saccent:${T.accent};--saccent2:${T.accent2};--sblue:${T.blue};
  --spurple:${T.purple};--samber:${T.amber};--spink:${T.pink};--sred:${T.red};}

.slide-frame{
  width:${SW}px;height:${SH}px;flex-shrink:0;position:relative;overflow:hidden;
  background:radial-gradient(circle at 85% -10%, rgba(110,231,183,.10), transparent 45%),
             radial-gradient(circle at -5% 110%, rgba(90,166,255,.08), transparent 45%),
             linear-gradient(180deg, var(--sbg) 0%, var(--sbg2) 100%);
  color:var(--stext);font-family:${T.sans};
}
.slide-frame *{box-sizing:border-box}
.slide-grain{position:absolute;inset:0;opacity:.035;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
.slide-inner{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;padding:54px 68px 44px}
.slide-kicker{display:inline-flex;align-items:center;gap:8px;font-family:${T.mono};
  font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--saccent)}
.slide-kicker .dot{width:6px;height:6px;border-radius:50%;background:var(--saccent);box-shadow:0 0 10px var(--saccent)}
.slide-title{font-size:40px;font-weight:800;letter-spacing:-.02em;line-height:1.12;margin-top:10px;color:var(--stext)}
.slide-title b, .slide-title .hl{color:var(--saccent);font-weight:800}
.slide-sub{font-size:17px;color:var(--stext2);margin-top:12px;max-width:880px;line-height:1.55;font-weight:400}
.slide-body{flex:1;margin-top:28px;min-height:0;display:flex;flex-direction:column}
.slide-foot{position:absolute;left:68px;right:68px;bottom:26px;display:flex;align-items:center;
  justify-content:space-between;font-size:11.5px;color:var(--smuted);font-family:${T.mono};letter-spacing:.03em}
.slide-foot .brand{display:flex;align-items:center;gap:7px}
.slide-foot .brand .sq{width:14px;height:14px;border-radius:4px;background:var(--saccent);display:inline-flex}
.slide-pg{font-weight:600;color:var(--stext2)}

.sg-2{display:grid;grid-template-columns:1fr 1fr;gap:28px;flex:1;min-height:0}
.sg-list{display:flex;flex-direction:column;gap:14px}
.s-card{background:var(--spanel);border:1px solid var(--sline);border-radius:14px;padding:18px 20px}
.s-pill{display:inline-flex;align-items:center;gap:7px;background:var(--spanel2);border:1px solid var(--sline);
  border-radius:100px;padding:5px 13px;font-size:12.5px;font-weight:600;color:var(--stext2)}
.s-pill .d{width:7px;height:7px;border-radius:50%}
.bul{display:flex;gap:12px;align-items:flex-start;font-size:15.5px;color:var(--stext2);line-height:1.55}
.bul .n{flex-shrink:0;width:26px;height:26px;border-radius:8px;background:var(--spanel2);border:1px solid var(--sline);
  display:flex;align-items:center;justify-content:center;font-family:${T.mono};font-size:12px;font-weight:700;color:var(--saccent)}
.bul b{color:var(--stext);font-weight:700}
.chip-row{display:flex;flex-wrap:wrap;gap:10px}
.tech-chip{display:flex;align-items:center;gap:10px;background:var(--spanel);border:1px solid var(--sline);
  border-radius:12px;padding:12px 16px;min-width:200px}
.tech-chip .ic{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px}
.tech-chip .nm{font-size:14.5px;font-weight:700;color:var(--stext)}
.tech-chip .wy{font-size:12px;color:var(--smuted);margin-top:1px;line-height:1.4}

.dg-box{background:var(--spanel);border:1px solid var(--sline2);border-radius:10px;position:relative}
.dg-label{font-family:${T.mono};font-weight:600}

@keyframes deckFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
`;
