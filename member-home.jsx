/* ============================================================
   Siriraj Toy Library — Member experience
   ============================================================ */
const { useState, useMemo, useEffect } = React;

/* ---------- date helpers ---------- */
const D = window.DATA;
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
function fmtDate(s) {
  const d = new Date(s);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}
function addDays(s, n) { const d = new Date(s); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

/* ========================================================== */
/*  TOP NAV                                                     */
/* ========================================================== */
function MemberNav({ page, setPage, onSearch }) {
  const links = [
    { id: "home", th: "หน้าแรก", en: "Home", icon: "home" },
    { id: "browse", th: "รายการทรัพยากร", en: "Browse", icon: "grid" },
    { id: "recommend", th: "แนะนำตามวัย", en: "By Age", icon: "spark" },
  ];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "color-mix(in srgb, var(--surface) 88%, transparent)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "13px 28px", display: "flex", alignItems: "center", gap: 26 }}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", padding: 0 }}><Logo /></button>
        <nav className="row" style={{ gap: 4, marginLeft: 8 }}>
          {links.map((l) => (
            <button key={l.id} onClick={() => setPage(l.id)} className="navlink" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 15px", borderRadius: 999,
              border: "none", background: page === l.id ? "var(--brand-soft)" : "transparent",
              color: page === l.id ? "var(--brand-ink)" : "var(--ink-2)", fontSize: 14.5, fontWeight: 500,
              transition: "all .14s",
            }}>
              <Icon name={l.icon} size={18} />{l.th}
            </button>
          ))}
        </nav>
        <div style={{ marginLeft: "auto" }}></div>
      </div>
    </header>
  );
}
const iconBtnStyle = { position: "relative", width: 40, height: 40, borderRadius: 12, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center" };

/* ========================================================== */
/*  HOME                                                        */
/* ========================================================== */
function MemberHome({ setPage, openItem, setBrowseSeed }) {
  const popular = [...D.items].sort((a, b) => b.loans - a.loans).slice(0, 4);
  return (
    <div className="rise">
      {/* hero */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 28px 8px" }}>
        <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", background: "linear-gradient(120deg, var(--brand) 0%, var(--brand-ink) 60%, var(--brand-deep) 100%)", padding: "52px 48px", color: "#fff" }}>
          <div style={{ position: "absolute", inset: 0, opacity: .16, background: "radial-gradient(circle at 82% 18%, var(--sun) 0, transparent 38%), radial-gradient(circle at 92% 80%, var(--accent) 0, transparent 36%)" }}></div>
          <div style={{ position: "relative", maxWidth: 620 }}>
            <span className="row" style={{ gap: 8, fontSize: 13, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", opacity: .9, marginBottom: 16, whiteSpace: "nowrap" }}>
              <Icon name="spark" size={16} fill /> เล่น เรียนรู้ เติบโตไปด้วยกัน
            </span>
            <h1 style={{ fontSize: 42, color: "#fff", lineHeight: 1.12, letterSpacing: "-0.02em" }}>ยืมของเล่นและหนังสือ<br />เสริมพัฒนาการลูกน้อย</h1>
            <div className="row" style={{ gap: 12, background: "#fff", borderRadius: 16, padding: 7, maxWidth: 520, boxShadow: "var(--shadow-lg)", marginTop: 32 }}>
              <span className="row" style={{ paddingLeft: 12, color: "var(--muted)" }}><Icon name="search" size={20} /></span>
              <input className="homesearch" placeholder="ค้นหาของเล่น, หนังสือ, ประเภท…"
                onKeyDown={(e) => { if (e.key === "Enter") { setBrowseSeed(e.target.value); setPage("browse"); } }}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 15.5, color: "var(--ink)", background: "transparent" }} />
              <button className="btn btn-primary" onClick={() => setPage("browse")}>ค้นหา</button>
            </div>
          </div>
        </div>
      </section>

      {/* category quick tiles */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 28px 6px" }}>
        <div className="sec-head"><div><div className="eyebrow">ของเล่นเสริมพัฒนาการ</div><h2>เลือกตามด้านที่อยากเสริม</h2></div>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage("browse")}>ดูทั้งหมด <Icon name="arrowR" size={16} /></button></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {D.TOY_CATS.map((c) => {
            const n = D.toys.filter((t) => t.cat === c.id).length;
            return (
              <button key={c.id} className="card cattile" onClick={() => { setBrowseSeed("@cat:" + c.id); setPage("browse"); }} style={{
                textAlign: "left", padding: 20, border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 14, cursor: "pointer",
                transition: "transform .16s, box-shadow .16s",
              }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${c.c} 14%, #fff)`, color: c.c }}>
                  <Icon name="blocks" size={24} fill />
                </div>
                <div className="stack" style={{ gap: 3 }}>
                  <h4 style={{ fontSize: 16.5, fontWeight: 500, lineHeight: 1.25 }}>{c.th}</h4>
                  <span className="en">{c.en}</span>
                </div>
                <span className="row" style={{ justifyContent: "space-between", color: "var(--muted)", fontSize: 13, marginTop: "auto" }}>
                  {n} รายการ <Icon name="chevR" size={16} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* by-age strip */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 28px 6px" }}>
        <div className="card" style={{ padding: 24, display: "flex", gap: 26, alignItems: "center", background: "var(--brand-soft)", border: "1px solid var(--brand-soft-2)", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 280px" }}>
            <div className="eyebrow">เครื่องมือช่วยเลือก</div>
            <h3 style={{ fontSize: 22 }}>ไม่รู้จะเริ่มจากอะไร? เลือกตามวัยของลูก</h3>
            <p className="muted" style={{ marginBottom: 0, marginTop: 8 }}>บอกอายุน้อง แล้วเราจะแนะนำของเล่นและหนังสือที่เหมาะกับช่วงพัฒนาการนั้นให้</p>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            {D.AGE_BANDS.map((a) => (
              <button key={a.id} className="chip" onClick={() => { setBrowseSeed("@age:" + a.id); setPage("recommend"); }}>{a.th}</button>
            ))}
            <button className="btn btn-primary" onClick={() => setPage("recommend")}><Icon name="spark" size={17} fill /> เปิดตัวช่วยแนะนำ</button>
          </div>
        </div>
      </section>

      {/* popular */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 28px 6px" }}>
        <div className="sec-head"><div><div className="eyebrow">ยอดนิยมประจำเดือน</div><h2>ที่ผู้ปกครองยืมมากที่สุด</h2></div>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage("browse")}>ดูทั้งหมด <Icon name="arrowR" size={16} /></button></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {popular.map((it) => <ItemCard key={it.id} item={it} onOpen={openItem} />)}
        </div>
      </section>


    </div>
  );
}

window.MemberHome = MemberHome;
window.MemberNav = MemberNav;
window.iconBtnStyle = iconBtnStyle;
window.mDateHelpers = { daysBetween, fmtDate, addDays };
