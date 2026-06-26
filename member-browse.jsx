/* ============================================================
   Siriraj Toy Library — Browse / Search / Recommend
   ============================================================ */
const Dx = window.DATA;

/* ========================================================== */
/*  BROWSE                                                      */
/* ========================================================== */
function MemberBrowse({ openItem, seed, clearSeed }) {
  const [q, setQ] = React.useState("");
  const [kind, setKind] = React.useState("all");     // all | toy | book
  const [cat, setCat] = React.useState("all");
  const [age, setAge] = React.useState("all");
  const [availOnly, setAvailOnly] = React.useState(false);
  const [sort, setSort] = React.useState("popular");

  // apply seed coming from home
  React.useEffect(() => {
    if (!seed) return;
    if (seed.startsWith("@cat:")) { setKind("toy"); setCat(seed.slice(5)); }
    else if (seed.startsWith("@age:")) { setKind("toy"); setAge(seed.slice(5)); }
    else setQ(seed);
    clearSeed();
  }, [seed]);

  const cats = kind === "book" ? Dx.BOOK_CATS : Dx.TOY_CATS;

  const results = React.useMemo(() => {
    let arr = Dx.items.filter((it) => {
      if (kind !== "all" && it.kind !== kind) return false;
      if (cat !== "all" && it.cat !== cat) return false;
      if (availOnly && it.status !== "ok") return false;
      if (age !== "all" && it.kind === "toy") {
        const band = Dx.AGE_BANDS.find((b) => b.id === age);
        if (band && !(it.ageLo < band.hi && it.ageHi > band.lo)) return false;
      } else if (age !== "all" && it.kind === "book") return false;
      if (q.trim()) {
        const s = (it.th + it.en + (it.author || "") + it.code + (it.barcode || "")).toLowerCase();
        if (!s.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
    const w = { popular: (a, b) => b.loans - a.loans,
      name: (a, b) => a.th.localeCompare(b.th, "th"), code: (a, b) => (a.code || "").localeCompare(b.code || "") };
    return arr.sort(w[sort] || w.popular);
  }, [q, kind, cat, age, availOnly, sort]);

  const reset = () => { setQ(""); setKind("all"); setCat("all"); setAge("all"); setAvailOnly(false); };
  const activeFilters = (kind !== "all") + (cat !== "all") + (age !== "all") + availOnly;

  return (
    <div className="rise" style={{ maxWidth: 1240, margin: "0 auto", padding: "26px 28px 56px", display: "grid", gridTemplateColumns: "248px 1fr", gap: 28 }}>
      {/* sidebar filters */}
      <aside className="stack" style={{ gap: 18, position: "sticky", top: 138, alignSelf: "start", maxHeight: "calc(100vh - 158px)", overflowY: "auto", paddingRight: 4 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="row" style={{ fontSize: 17, gap: 8 }}><Icon name="filter" size={18} /> ตัวกรอง</h3>
          {activeFilters > 0 && <button onClick={reset} className="row" style={{ background: "none", border: "none", color: "var(--accent-ink)", fontSize: 13, fontWeight: 500, gap: 4 }}><Icon name="refresh" size={14} /> ล้าง</button>}
        </div>

        <FilterGroup label="ประเภททรัพยากร">
          {[["all", "ทั้งหมด"], ["toy", "ของเล่น"], ["book", "หนังสือ"]].map(([v, t]) => (
            <button key={v} className={`fchip ${kind === v ? "on" : ""}`} onClick={() => { setKind(v); setCat("all"); }}>{t}</button>
          ))}
        </FilterGroup>

        {kind !== "book" && (
          <FilterGroup label="ช่วงอายุ (ของเล่น)">
            <button className={`fchip ${age === "all" ? "on" : ""}`} onClick={() => setAge("all")}>ทุกวัย</button>
            {Dx.AGE_BANDS.map((a) => <button key={a.id} className={`fchip ${age === a.id ? "on" : ""}`} onClick={() => setAge(a.id)}>{a.th}</button>)}
          </FilterGroup>
        )}

        <FilterGroup label={kind === "book" ? "หมวดหนังสือ" : "ด้านพัฒนาการ"}>
          <button className={`fchip ${cat === "all" ? "on" : ""}`} onClick={() => setCat("all")}>ทั้งหมด</button>
          {cats.map((c) => <button key={c.id} className={`fchip ${cat === c.id ? "on" : ""}`} onClick={() => setCat(c.id)}>{c.th}</button>)}
        </FilterGroup>

        <label className="card" style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 11, cursor: "pointer" }}>
          <span onClick={(e) => { e.preventDefault(); setAvailOnly(!availOnly); }} style={{ width: 40, height: 23, borderRadius: 999, background: availOnly ? "var(--brand)" : "var(--line-2)", position: "relative", transition: ".16s", flex: "none" }}>
            <span style={{ position: "absolute", top: 3, left: availOnly ? 20 : 3, width: 17, height: 17, borderRadius: 999, background: "#fff", transition: ".16s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }}></span>
          </span>
          <span className="stack" style={{ gap: 1 }}><span style={{ fontSize: 14, fontWeight: 500 }}>เฉพาะที่ว่าง</span><span className="muted" style={{ fontSize: 12 }}>ยืมได้ทันที</span></span>
        </label>
      </aside>

      {/* results */}
      <div className="stack" style={{ gap: 18 }}>
        <div className="row" style={{ gap: 12, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 14, padding: "5px 5px 5px 14px" }}>
          <Icon name="search" size={19} style={{ color: "var(--muted)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาตามชื่อ, ผู้แต่ง, รหัส…" style={{ flex: 1, border: "none", outline: "none", fontSize: 15, background: "transparent", color: "var(--ink)" }} />
          {q && <button onClick={() => setQ("")} style={iconBtnStyle}><Icon name="x" size={16} /></button>}
        </div>

        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="muted" style={{ fontSize: 14 }}>พบ <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{results.length}</strong> รายการ{availOnly && " ที่ว่าง"}</span>
          <div className="row" style={{ gap: 10 }}>
            <span className="muted" style={{ fontSize: 13 }}>เรียงตาม</span>
            <div className="seg">
              {[["popular", "ยอดนิยม"], ["code", "รหัส"], ["name", "ชื่อ"]].map(([v, t]) => (
                <button key={v} className={sort === v ? "active" : ""} onClick={() => setSort(v)}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <Empty title="ไม่พบรายการที่ตรงกับเงื่อนไข" sub="ลองปรับตัวกรองหรือคำค้นหาให้กว้างขึ้น แล้วลองอีกครั้ง" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {results.map((it) => <ItemCard key={it.id} item={it} onOpen={openItem} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="stack" style={{ gap: 9 }}>
      <span className="label" style={{ marginBottom: 0 }}>{label}</span>
      <div className="row" style={{ flexWrap: "wrap", gap: 7 }}>{children}</div>
    </div>
  );
}

/* ========================================================== */
/*  RECOMMEND BY AGE                                            */
/* ========================================================== */
function MemberRecommend({ openItem, seed, clearSeed }) {
  const childMo = Dx.currentMember.childAgeMo;
  const [months, setMonths] = React.useState(childMo);

  React.useEffect(() => {
    if (seed && seed.startsWith("@age:")) {
      const b = Dx.AGE_BANDS.find((x) => x.id === seed.slice(5));
      if (b) setMonths(Math.round((b.lo + b.hi) / 2));
      clearSeed();
    }
  }, [seed]);

  const band = Dx.AGE_BANDS.find((b) => months >= b.lo && months < b.hi) || Dx.AGE_BANDS[Dx.AGE_BANDS.length - 1];
  const ageText = months % 12 === 0 ? `${months / 12} ปี` : `${Math.floor(months / 12)} ปี ${months % 12} เดือน`;

  const recToys = Dx.toys.filter((t) => t.ageLo <= months && t.ageHi >= months).sort((a, b) => b.loans - a.loans);
  const recBooks = Dx.books.sort((a, b) => b.loans - a.loans).slice(0, 4);

  const byCat = Dx.TOY_CATS.map((c) => ({ ...c, items: recToys.filter((t) => t.cat === c.id) })).filter((g) => g.items.length);

  return (
    <div className="rise" style={{ maxWidth: 1240, margin: "0 auto", padding: "26px 28px 56px" }}>
      {/* control card */}
      <div className="card" style={{ padding: "30px 34px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 34, alignItems: "center", background: "linear-gradient(110deg, var(--brand-soft), var(--surface))", border: "1px solid var(--brand-soft-2)", marginBottom: 30 }}>
        <div>
          <div className="eyebrow"><Icon name="spark" size={14} fill /> ตัวช่วยแนะนำตามวัย</div>
          <h2 style={{ fontSize: 27 }}>ของเล่นที่เหมาะกับน้อง<br />อายุ {ageText}</h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: 440 }}>เลื่อนปรับอายุของลูกเพื่อดูของเล่นและหนังสือที่ตรงกับช่วงพัฒนาการ — คัดเลือกโดยทีมนักกิจกรรมบำบัด</p>
          <div className="row" style={{ gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <span className="tag" style={{ background: "var(--brand)", color: "#fff", fontSize: 13, padding: "6px 13px" }}><Icon name="baby" size={15} /> ช่วงวัย {band.th}</span>
            <span className="tag" style={{ fontSize: 13, padding: "6px 13px" }}>พบ {recToys.length} ของเล่นที่เหมาะ</span>
          </div>
        </div>
        <div className="card" style={{ padding: 22, background: "var(--surface)" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <span className="label" style={{ margin: 0 }}>อายุของลูก</span>
            <span style={{ fontFamily: "var(--font-head)", fontSize: 22, color: "var(--brand-ink)" }}>{ageText}</span>
          </div>
          <input type="range" min="0" max="96" step="1" value={months} onChange={(e) => setMonths(+e.target.value)}
            className="agerange" style={{ width: "100%", accentColor: "var(--brand)" }} />
          <div className="row" style={{ justifyContent: "space-between", marginTop: 4 }}>
            <span className="muted" style={{ fontSize: 11.5 }}>แรกเกิด</span><span className="muted" style={{ fontSize: 11.5 }}>8 ปี</span>
          </div>
          <button className="btn btn-soft btn-sm btn-block" style={{ marginTop: 14 }} onClick={() => setMonths(childMo)}>
            <Icon name="refresh" size={15} /> ใช้อายุของ {Dx.currentMember.child} ({Math.floor(childMo / 12)} ปี {childMo % 12} ด.)
          </button>
        </div>
      </div>

      {byCat.map((g) => (
        <section key={g.id} style={{ marginBottom: 30 }}>
          <div className="sec-head" style={{ marginBottom: 14 }}>
            <div className="row" style={{ gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `color-mix(in srgb, ${g.c} 14%, #fff)`, color: g.c, display: "grid", placeItems: "center" }}><Icon name="blocks" size={20} fill /></div>
              <div className="stack"><h3 style={{ fontSize: 19 }}>{g.th}</h3><span className="en">{g.en}</span></div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {g.items.slice(0, 4).map((it) => <ItemCard key={it.id} item={it} onOpen={openItem} />)}
          </div>
        </section>
      ))}

      <section>
        <div className="sec-head" style={{ marginBottom: 14 }}>
          <div className="row" style={{ gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center" }}><Icon name="book" size={20} fill /></div>
            <div className="stack"><h3 style={{ fontSize: 19 }}>หนังสือแนะนำ</h3><span className="en">Recommended Books</span></div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {recBooks.map((it) => <ItemCard key={it.id} item={it} onOpen={openItem} />)}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { MemberBrowse, MemberRecommend });
