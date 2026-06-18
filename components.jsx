/* ============================================================
   Siriraj Toy Library — shared components (window globals)
   ============================================================ */

/* ---------- Icon set (simple stroke icons) ---------- */
const ICONS = {
  search:  "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3",
  filter:  "M3 5h18M6 12h12M10 19h4",
  home:    "M4 11.5 12 4l8 7.5M6 10v9h12v-9",
  grid:    "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  clock:   "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2",
  user:    "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c.8-3.6 4-6 8-6s7.2 2.4 8 6",
  chart:   "M5 21V10M12 21V4M19 21v-7M3 21h18",
  plus:    "M12 5v14M5 12h14",
  check:   "M20 6 9 17l-5-5",
  x:       "M6 6l12 12M18 6 6 18",
  chevR:   "M9 6l6 6-6 6",
  chevD:   "M6 9l6 6 6-6",
  chevL:   "M15 6l-6 6 6 6",
  arrowR:  "M5 12h14M13 6l6 6-6 6",
  book:    "M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5zM20 5.5C20 4.7 19.3 4 18.5 4H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5z",
  blocks:  "M4 9h6V3H4zM14 13h6V3h-6zM4 21h6v-8H4zM14 21h6v-4h-6z",
  heart:   "M12 20s-7-4.6-9.3-9C1.2 8 2.6 4.8 6 4.8c2 0 3.2 1.4 4 2.6.8-1.2 2-2.6 4-2.6 3.4 0 4.8 3.2 3.3 6.2C19 15.4 12 20 12 20Z",
  bell:    "M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0",
  qr:      "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z",
  cal:     "M4 6.5C4 5.7 4.7 5 5.5 5h13c.8 0 1.5.7 1.5 1.5V19c0 .8-.7 1.5-1.5 1.5h-13C4.7 20.5 4 19.8 4 19zM4 9.5h16M8 3v4M16 3v4",
  star:    "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z",
  refresh: "M20 11A8 8 0 0 0 6.3 6.3L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 13.7 4.7L20 15.5M20 20v-4.5h-4.5",
  box:     "M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5zM3.5 7.5 12 12m0 9V12m8.5-4.5L12 12",
  spark:   "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z",
  baby:    "M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9 8h0M15 8h0M6 21c.5-3 3-5 6-5s5.5 2 6 5",
  settings:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13.5a7.8 7.8 0 0 0 0-3l1.8-1.4-1.8-3.1-2.2.9a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.8 2.4a7.6 7.6 0 0 0-2.6 1.5l-2.2-.9-1.8 3.1L4.6 10.5a7.8 7.8 0 0 0 0 3L2.8 14.9l1.8 3.1 2.2-.9a7.6 7.6 0 0 0 2.6 1.5L10 21h4l.8-2.4a7.6 7.6 0 0 0 2.6-1.5l2.2.9 1.8-3.1z",
  logout:  "M9 21H5.5C4.7 21 4 20.3 4 19.5v-15C4 3.7 4.7 3 5.5 3H9M16 16l4-4-4-4M20 12H9",
  menu:    "M4 7h16M4 12h16M4 17h16",
  list:    "M8 6h13M8 12h13M8 18h13M3.5 6h0M3.5 12h0M3.5 18h0",
  inbox:   "M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5",
  flag:    "M5 21V4M5 4h11l-1.5 4L16 12H5",
  download:"M12 3v12M7 10l5 5 5-5M5 21h14",
  pin:     "M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
};

function Icon({ name, size = 20, stroke = 1.9, fill = false, style, className }) {
  const d = ICONS[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={style} className={className} aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth={stroke}
        strokeLinecap="round" strokeLinejoin="round"
        fill={fill ? "currentColor" : "none"} />
    </svg>
  );
}

/* ---------- Logo ---------- */
function Logo({ size = 38, light = false }) {
  const h = size * 1.6;
  const w = h * (705 / 499);
  return (
    <img
      src="logo.png"
      alt="ห้องสมุดของเล่นศิริราช · Siriraj Toy Library"
      style={{
        height: h, width: w, objectFit: "contain", display: "block",
        filter: light ? "brightness(0) invert(1)" : "none",
      }}
    />
  );
}

/* ---------- Status pill ---------- */
const STATUS_MAP = {
  ok:       { cls: "ok",   th: "ว่าง",              en: "Available" },
  busy:     { cls: "warn", th: "ถูกยืม",            en: "Borrowed" },
  reserved: { cls: "warn", th: "ถูกยืม",            en: "Borrowed" },
  fix:      { cls: "idle", th: "ซ่อมบำรุง",         en: "Maintenance" },
  inlib:    { cls: "idle", th: "เฉพาะในห้องสมุด",   en: "Library Use Only" },
};
function StatusPill({ status, en = false }) {
  const s = STATUS_MAP[status] || STATUS_MAP.ok;
  return <span className={`pill ${s.cls}`}><span className="dot"></span>{s.th}{en && <span style={{ opacity: .65, fontWeight: 400 }}>· {s.en}</span>}</span>;
}

/* ---------- Item image placeholder ---------- */
function ItemImage({ item, ratio = "4 / 3", radius = "var(--radius)", big = false }) {
  const cat = window.DATA.catLabel(item);
  const isToy = item.kind === "toy";
  const [err, setErr] = React.useState(false);
  const src = !err ? (item.image || (item.code ? `/pics/${item.code}.jpg` : null)) : null;
  if (src) {
    return (
      <div style={{ aspectRatio: ratio, borderRadius: radius, overflow: "hidden", width: "100%", background: "var(--bg-2)" }}>
        <img src={src} alt={item.th} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={() => setErr(true)} />
      </div>
    );
  }
  return (
    <div className="ph" style={{
      aspectRatio: ratio, borderRadius: radius, "--ph-c": isToy ? cat.c : "var(--brand)",
      width: "100%",
    }}>
      <div className="stack" style={{ alignItems: "center", gap: 9 }}>
        <div style={{
          width: big ? 54 : 40, height: big ? 54 : 40, borderRadius: 12,
          background: "rgba(255,255,255,.7)", display: "grid", placeItems: "center",
          color: isToy ? cat.c : "var(--brand)",
        }}>
          <Icon name={isToy ? "blocks" : "book"} size={big ? 28 : 22} fill />
        </div>
        <span className="ph-label">{isToy ? "TOY PHOTO" : "BOOK COVER"} · {item.code}</span>
      </div>
    </div>
  );
}

/* ---------- Item card (catalog) ---------- */
function ItemCard({ item, onOpen }) {
  const cat = window.DATA.catLabel(item);
  const age = window.DATA.ageText(item);
  const avail = item.status === "ok";
  const inlib = item.status === "inlib";
  return (
    <button className="card rise itemcard" onClick={() => onOpen(item)} style={{
      textAlign: "left", padding: 0, overflow: "hidden", cursor: "pointer",
      display: "flex", flexDirection: "column", border: "1px solid var(--line)",
      transition: "transform .16s ease, box-shadow .16s ease, border-color .16s",
    }}>
      <div style={{ padding: 12, paddingBottom: 0, position: "relative" }}>
        <ItemImage item={item} ratio="5 / 4" radius="12px" />
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <StatusPill status={item.status} />
        </div>
      </div>
      <div className="stack" style={{ padding: "13px 15px 15px", gap: 8, flex: 1 }}>
        <div className="row" style={{ gap: 7, flexWrap: "wrap" }}>
          <span className="tag" style={{ background: "color-mix(in srgb,"+(item.kind==="toy"?cat.c:"var(--brand)")+" 13%, #fff)", color: item.kind==="toy"?cat.c:"var(--brand-ink)" }}>
            {item.kind === "toy" ? "ของเล่น" : "หนังสือ"}
          </span>
          {age && <span className="tag"><Icon name="baby" size={13} />{age}</span>}
        </div>
        <h4 style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.25, textWrap: "pretty" }}>{item.th}</h4>
        <span className="en" style={{ marginTop: -3 }}>{item.en}{item.author ? ` · ${item.author}` : ""}</span>
        <div className="row" style={{ justifyContent: "flex-end", marginTop: "auto", paddingTop: 6 }}>
          <span className="row" style={{ gap: 3, color: avail ? "var(--brand)" : "var(--muted)", fontSize: 13, fontWeight: 500 }}>
            {avail ? "ยืมได้" : inlib ? "ใช้ในห้องสมุด" : "ไม่ว่าง"} <Icon name="chevR" size={15} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------- Empty state ---------- */
function Empty({ icon = "search", title, sub }) {
  return (
    <div className="stack" style={{ alignItems: "center", justifyContent: "center", padding: "70px 20px", textAlign: "center", color: "var(--muted)", gap: 12 }}>
      <div style={{ width: 62, height: 62, borderRadius: 18, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
        <Icon name={icon} size={28} />
      </div>
      <h4 style={{ fontSize: 17, color: "var(--ink)" }}>{title}</h4>
      {sub && <p style={{ margin: 0, maxWidth: 320 }}>{sub}</p>}
    </div>
  );
}

/* ---------- Stat tile ---------- */
function Stat({ label, value, sub, icon, tone = "brand", trend }) {
  const toneC = { brand: "var(--brand)", accent: "var(--accent)", ok: "var(--ok)", over: "var(--over)", sun: "var(--sun)" }[tone];
  return (
    <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="muted" style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center",
          background: `color-mix(in srgb, ${toneC} 13%, #fff)`, color: toneC }}>
          <Icon name={icon} size={18} />
        </div>
      </div>
      <div className="row" style={{ gap: 9, alignItems: "baseline" }}>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: 30, color: "var(--ink)", lineHeight: 1 }}>{value}</span>
        {trend && <span style={{ fontSize: 12.5, fontWeight: 600, color: trend.up ? "var(--ok)" : "var(--over)" }}>{trend.up ? "▲" : "▼"} {trend.v}</span>}
      </div>
      {sub && <span className="muted" style={{ fontSize: 12.5 }}>{sub}</span>}
    </div>
  );
}

Object.assign(window, { Icon, ICONS, Logo, StatusPill, STATUS_MAP, ItemImage, ItemCard, Empty, Stat });
