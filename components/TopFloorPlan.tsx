// NOTE (Nov 2026): owners said this drawing is wrong — not shown on the site until corrected from their input.
/**
 * Top floor — as built (Nov 2026), drawn over the 2024 survey sheet (/plans/third.png).
 * Units are survey-image pixels: 1 m ≈ 130 px (1:50 sheet rendered at 165 dpi).
 * Room outlines follow the survey; furniture is indicative and to scale.
 */
const M = 130; // px per metre

type Box = { x: number; y: number; w: number; h: number; label?: string; fill?: string; rx?: number };

const ZONES = [
  { n: 3, name: "Lounge & dining", fill: "#C9A27E", pts: "295,412 845,420 845,780 118,780 118,612" },
  { n: 3, name: "", fill: "#C9A27E", pts: "335,292 720,296 720,410 300,410" },
  { n: 6, name: "Front terrace", fill: "#B8653F", pts: "65,795 860,795 860,965 40,965" },
  { n: 2, name: "Kitchen", fill: "#7E9A84", pts: "855,550 1255,550 1255,680 1245,680 1245,925 900,925 900,690 855,680" },
  { n: 0, name: "", fill: "#A7B5C2", pts: "1262,545 1450,545 1450,698 1262,698" },
  { n: 1, name: "Bathroom", fill: "#D9A8A0", pts: "1262,706 1450,706 1450,905 1262,905" },
  { n: 5, name: "Back terrace", fill: "#B8653F", pts: "900,135 1425,135 1425,525 900,525" },
];

const LABELS = [
  { n: 3, t: "Lounge & dining", x: 470, y: 715 },
  { n: 6, t: "Front terrace", x: 460, y: 885 },
  { n: 2, t: "Kitchen", x: 1060, y: 840 },
  { n: 1, t: "Bathroom", x: 1356, y: 985 },
  { n: 5, t: "Back terrace", x: 1160, y: 250 },
  { n: 4, t: "Attic open above", x: 300, y: 520 },
];

// Furniture, to scale (sizes in metres × M)
const F: Box[] = [
  { x: 640, y: 470, w: 0.95 * M, h: 2.1 * M, label: "Sofa 2.1 m", fill: "#8C8C8C", rx: 10 },
  { x: 833, y: 545, w: 12, h: 1.1 * M, label: "", fill: "#222" }, // TV on east wall
  { x: 560, y: 520, w: 0.6 * M, h: 1.0 * M, label: "", fill: "#C47A55", rx: 6 }, // coffee table
  { x: 195, y: 560, w: 1.2 * M, h: 0.8 * M, label: "Table ×4", fill: "#5A3B2A", rx: 4 },
  { x: 250, y: 742, w: 1.2 * M, h: 0.38 * M, label: "Dresser", fill: "#4A3426" },
  { x: 470, y: 330, w: 1.4 * M, h: 0.45 * M, label: "Bar", fill: "#5A3B2A" },
  // appliance bay — washer + fridge side by side against east wall (bay 116 cm)
  { x: 1385, y: 548, w: 0.6 * M, h: 0.6 * M, label: "W/M", fill: "#FFFFFF" },
  { x: 1385, y: 628, w: 0.6 * M, h: 0.55 * M, label: "Fridge", fill: "#E7A9A0" },
  // bathroom — indicative
  { x: 1300, y: 720, w: 1.15 * M, h: 0.8 * M, label: "Shower", fill: "#3B3B3B" },
  { x: 1272, y: 850, w: 0.5 * M, h: 0.4 * M, label: "WC", fill: "#FFFFFF", rx: 20 },
  { x: 1385, y: 855, w: 0.4 * M, h: 0.35 * M, label: "Basin", fill: "#FFFFFF" },
  // kitchen — approx.
  { x: 1185, y: 690, w: 0.6 * M, h: 1.8 * M, label: "Sink", fill: "#5F7564" },
  { x: 950, y: 690, w: 1.8 * M, h: 0.6 * M, label: "Peninsula + hob", fill: "#5F7564" },
  // back terrace
  { x: 920, y: 160, w: 0.6 * M, h: 2.6 * M, label: "", fill: "#2F3A4A", rx: 6 },
  { x: 1000, y: 260, w: 1.4 * M, h: 0.8 * M, label: "Table", fill: "#A08060", rx: 4 },
  { x: 1340, y: 440, w: 0.6 * M, h: 0.6 * M, label: "BBQ", fill: "#333" },
  // front terrace bistro set at the mountain end
  { x: 120, y: 840, w: 0.6 * M, h: 0.6 * M, label: "Bistro", fill: "#2B2B2B", rx: 40 },
];

export default function TopFloorPlan() {
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox="0 0 1560 1035" style={{ width: "100%", height: "auto", background: "#fff", border: "1px solid var(--line)", borderRadius: 10 }} role="img" aria-label="Top floor as built, furnished plan">
        <image href="/plans/third.png" x="0" y="0" width="1560" height="1035" opacity="0.45" />
        {ZONES.map((z, i) => (
          <polygon key={i} points={z.pts} fill={z.fill} fillOpacity="0.28" stroke={z.fill} strokeWidth="3" />
        ))}
        {/* removed walls (red dashes) */}
        <g stroke="#C0392B" strokeWidth="9" strokeDasharray="22 14" fill="none">
          <line x1="320" y1="410" x2="720" y2="410" />
          <line x1="900" y1="684" x2="1245" y2="684" />
          <line x1="1258" y1="550" x2="1258" y2="698" />
        </g>
        {/* new wall: bay / bathroom */}
        <line x1="1262" y1="702" x2="1450" y2="702" stroke="#1d1a16" strokeWidth="9" />
        {/* new terrace doors (blue) */}
        <g stroke="#1F6FB2" strokeWidth="10" fill="none">
          <line x1="1000" y1="545" x2="1150" y2="545" />
          <path d="M1000 545 A 75 75 0 0 1 1075 470" strokeWidth="4" />
          <path d="M1150 545 A 75 75 0 0 0 1075 470" strokeWidth="4" />
        </g>
        {/* rug under sitting area */}
        <rect x="540" y="470" width={2.0 * M} height={2.3 * M} fill="#B8653F" fillOpacity="0.18" stroke="#B8653F" strokeDasharray="8 6" strokeWidth="2" rx="6" />
        {F.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.rx ?? 3} fill={b.fill} stroke="#1d1a16" strokeWidth="2" />
            {b.label && (
              <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 6} textAnchor="middle" fontSize="17" fontFamily="system-ui, sans-serif"
                fill={["#FFFFFF", "#E7A9A0", "#C47A55"].includes(b.fill ?? "") ? "#1d1a16" : "#fff"}>{b.label}</text>
            )}
          </g>
        ))}
        {LABELS.map((l) => (
          <g key={l.t}>
            <circle cx={l.x - 0} cy={l.y - 34} r="20" fill="#1d1a16" />
            <text x={l.x} y={l.y - 27} textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">{l.n}</text>
            <text x={l.x} y={l.y + 4} textAnchor="middle" fontSize="24" fontFamily="Georgia, serif" fill="#1d1a16">{l.t}</text>
          </g>
        ))}
        <text x="1356" y="590" textAnchor="middle" fontSize="16" fill="#1d1a16" fontFamily="system-ui, sans-serif">bay</text>
        <text x="1356" y="608" textAnchor="middle" fontSize="16" fill="#1d1a16" fontFamily="system-ui, sans-serif">116 cm</text>
        {/* scale bar */}
        <g transform="translate(760,990)" fontFamily="system-ui, sans-serif" fontSize="16">
          <rect x="0" y="0" width={M} height="10" fill="#1d1a16" />
          <rect x={M} y="0" width={M} height="10" fill="#fff" stroke="#1d1a16" />
          <text x="0" y="30">0</text><text x={M - 6} y="30">1</text><text x={2 * M - 14} y="30">2 m</text>
        </g>
        {/* legend */}
        <g transform="translate(40,1000)" fontFamily="system-ui, sans-serif" fontSize="17">
          <line x1="0" y1="0" x2="40" y2="0" stroke="#C0392B" strokeWidth="8" strokeDasharray="12 8" /><text x="50" y="6">wall removed</text>
          <line x1="190" y1="0" x2="230" y2="0" stroke="#1F6FB2" strokeWidth="8" /><text x="240" y="6">new doors</text>
          <line x1="360" y1="0" x2="400" y2="0" stroke="#1d1a16" strokeWidth="8" /><text x="410" y="6">new wall</text>
        </g>
      </svg>
      <figcaption className="muted small" style={{ marginTop: 6 }}>
        Top floor as built — drawn over the 2024 survey at true scale. Room outlines from the survey; furniture to scale but positions indicative until checked on site. Street (Largo Pietra Rossa) at the bottom.
      </figcaption>
    </figure>
  );
}
