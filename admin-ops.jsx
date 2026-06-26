/* ============================================================
   Siriraj Toy Library — Circulation (ยืม–คืน) · Reports
   ============================================================ */
const Do = window.DATA;
const of = window.mDateHelpers;

/* ========================================================== */
/*  CIRCULATION                                                */
/* ========================================================== */
const OPS_LOANS_KEY = "stl_loans_v1";
const OPS_ITEMS_KEY = "stl_items_v1";

const _MONTH_LABELS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function monthInfo(dateStr) {
  const d = new Date(dateStr);
  return { label: _MONTH_LABELS[d.getMonth()], year: d.getFullYear() };
}

function opsLoad() {
  if (window.DB) return; // data already populated by DB.loadAll()
  try {
    const sl = localStorage.getItem(OPS_LOANS_KEY);
    if (sl) { Do.loans.length = 0; JSON.parse(sl).forEach(l => Do.loans.push(l)); }
    const si = localStorage.getItem(OPS_ITEMS_KEY);
    if (si) { const upd = JSON.parse(si); Do.items.forEach(it => { if (upd[it.id]) Object.assign(it, upd[it.id]); }); }
    const sm = localStorage.getItem("stl_members_v1");
    if (sm) { Do.members.length = 0; JSON.parse(sm).forEach(m => Do.members.push(m)); }
  } catch {}
}

function opsSave() {
  if (window.DB) return; // Supabase writes are handled per-operation
  localStorage.setItem(OPS_LOANS_KEY, JSON.stringify(Do.loans));
  const itemUpd = {};
  Do.items.forEach(it => { itemUpd[it.id] = { status: it.status, due: it.due }; });
  localStorage.setItem(OPS_ITEMS_KEY, JSON.stringify(itemUpd));
  localStorage.setItem("stl_members_v1", JSON.stringify(Do.members));
}

function AdminOps() {
  const [mode, setMode] = React.useState("out");   // out | in
  const [member, setMember] = React.useState(null);
  const [cart, setCart] = React.useState([]);
  const [picker, setPicker] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [bag, setBag] = React.useState("");
  const [doneBags, setDoneBags] = React.useState([]);
  const [, tick] = React.useReducer(n => n + 1, 0);

  React.useEffect(() => { opsLoad(); tick(); }, []);

  const reset = () => { setMember(null); setCart([]); setDone(false); setBag(""); setDoneBags([]); };
  React.useEffect(reset, [mode]);

  const confirmBorrow = () => {
    const due = of.addDays(Do.today, Do.rules.days);
    const bagCode = bag.trim() || null;
    const newLoans = [];
    cart.forEach(it => {
      const loan = { id: "L" + Date.now() + Math.random().toString(36).slice(2), member: member.id, itemId: it.id, borrowed: Do.today, due, status: "active", bag: bagCode };
      Do.loans.push(loan);
      newLoans.push(loan);
      it.status = "busy";
      it.due = due;
      it.loans = (it.loans || 0) + 1;
    });
    setDoneBags(bagCode ? [bagCode] : []);
    const m = Do.members.find(x => x.id === member.id);
    if (m) { m.active = (m.active || 0) + cart.length; m.history = (m.history || 0) + cart.length; }
    opsSave();
    const { label, year } = monthInfo(Do.today);
    const ms = Do.monthly.find(x => x.m === label);
    if (ms) ms.borrow = (ms.borrow || 0) + 1;
    else Do.monthly.push({ m: label, borrow: 1, ret: 0 });
    const nowT = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    cart.forEach(it => Do.activity.unshift({ type: "borrow", item: it.th, who: member.name, t: nowT }));
    if (window.DB) {
      Promise.all([
        ...newLoans.map(l => window.DB.addLoan(l)),
        ...cart.map(it => window.DB.updateItem(it.id, { status: "busy", due: it.due, loans: it.loans })),
        m ? window.DB.updateMember(m.id, { active: m.active, history: m.history }) : Promise.resolve(),
        window.DB.incrementStat(label, year, true),
      ]).catch(console.error);
    }
    setDone(true);
  };

  const confirmReturn = () => {
    const returned = [];
    cart.forEach(it => {
      const li = Do.loans.findIndex(l => l.member === member.id && l.itemId === it.id);
      if (li >= 0) { returned.push(Do.loans[li]); Do.loans.splice(li, 1); }
      it.status = "ok";
      delete it.due;
    });
    setDoneBags([...new Set(returned.map(l => l.bag).filter(Boolean))]);
    const m = Do.members.find(x => x.id === member.id);
    if (m) m.active = Math.max(0, (m.active || 0) - cart.length);
    opsSave();
    const { label, year } = monthInfo(Do.today);
    const ms2 = Do.monthly.find(x => x.m === label);
    if (ms2) ms2.ret = (ms2.ret || 0) + 1;
    else Do.monthly.push({ m: label, borrow: 0, ret: 1 });
    const nowT2 = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    cart.forEach(it => Do.activity.unshift({ type: "return", item: it.th, who: member.name, t: nowT2 }));
    if (window.DB) {
      Promise.all([
        ...returned.map(l => window.DB.returnLoan(l.id, Do.today)),
        ...cart.map(it => window.DB.updateItem(it.id, { status: "ok", due: null })),
        m ? window.DB.updateMember(m.id, { active: m.active }) : Promise.resolve(),
        window.DB.incrementStat(label, year, false),
      ]).catch(console.error);
    }
    setDone(true);
  };

  const scanMember = (code) => {
    const found = Do.members.find(m => m.code.toLowerCase() === code.trim().toLowerCase() || m.id === code.trim());
    if (found) setMember(found);
  };

  const memberLoans = member ? Do.loans.filter((l) => l.member === member.id) : [];

  return (
    <div className="rise" style={{ padding: "26px 32px 50px", maxWidth: 1100, margin: "0 auto" }}>
      <AdminHead title="ยืม–คืนทรัพยากร" sub="บันทึกการยืมและรับคืน พร้อมตรวจสอบกฎและกำหนดส่ง">
        <div className="seg" style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}>
          <button className={mode === "out" ? "active" : ""} onClick={() => setMode("out")}
            style={{ padding: "9px 22px", ...(mode === "out" ? { background: "var(--brand)", color: "#fff", boxShadow: "0 2px 8px color-mix(in srgb, var(--brand) 30%, transparent)" } : {}) }}>
            บันทึกยืม
          </button>
          <button className={mode === "in" ? "active" : ""} onClick={() => setMode("in")}
            style={{ padding: "9px 22px", ...(mode === "in" ? { background: "var(--accent)", color: "#fff", boxShadow: "0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)" } : {}) }}>
            รับคืน
          </button>
        </div>
      </AdminHead>

      {done ? (
        <div className="card rise stack" style={{ alignItems: "center", textAlign: "center", gap: 16, padding: "54px 20px" }}>
          <div style={{ width: 66, height: 66, borderRadius: 999, background: "var(--ok-soft)", color: "var(--ok)", display: "grid", placeItems: "center" }}><Icon name="check" size={34} /></div>
          <div><h2 style={{ fontSize: 24 }}>{mode === "out" ? "บันทึกการยืมเรียบร้อย" : "รับคืนเรียบร้อย"}</h2>
            <p className="muted" style={{ marginTop: 6 }}>{mode === "out" ? `${cart.length} รายการ ให้กับ ${member?.name} · กำหนดคืน ${of.fmtDate(of.addDays(Do.today, Do.rules.days))}` : `รับคืนจาก ${member?.name} เรียบร้อย`}</p></div>
          {doneBags.length > 0 && (
            <div className="row" style={{ gap: 9, padding: "11px 16px", background: mode === "out" ? "var(--brand-soft)" : "var(--warn-soft)", borderRadius: 12, color: mode === "out" ? "var(--brand-ink)" : "#a9661a", fontSize: 13.5 }}>
              <Icon name="box" size={17} /> {mode === "out" ? `จ่ายถุงผ้า ${doneBags.join(", ")} — ต้องนำมาคืนพร้อมของเล่น` : `รับถุงผ้าคืนแล้ว: ${doneBags.join(", ")}`}
            </div>
          )}
          <button className="btn btn-primary" onClick={reset}><Icon name="plus" size={17} /> ทำรายการถัดไป</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
          {/* member panel */}
          <div className="stack" style={{ gap: 16 }}>
            <div className="card" style={{ padding: 18 }}>
              <span className="label">ขั้นที่ 1 — สมาชิก</span>
              {!member ? (
                <>
                  <div className="row" style={{ gap: 10, background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 11, padding: "9px 12px", marginTop: 8 }}>
                    <Icon name="qr" size={18} style={{ color: "var(--brand)" }} />
                    <input placeholder="สแกน/พิมพ์รหัสสมาชิก" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14 }} onKeyDown={(e) => { if (e.key === "Enter") scanMember(e.target.value); }} />
                  </div>
                  <p className="muted" style={{ fontSize: 12.5, margin: "10px 0 8px" }}>หรือเลือกจากรายชื่อ</p>
                  <div className="stack" style={{ gap: 6, maxHeight: 230, overflow: "auto" }}>
                    {Do.members.map((m) => (
                      <button key={m.id} onClick={() => setMember(m)} className="memrow" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", textAlign: "left", cursor: "pointer" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 999, background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="user" size={16} /></div>
                        <div className="stack" style={{ flex: 1, lineHeight: 1.2 }}><span style={{ fontSize: 13.5, fontWeight: 500 }}>{m.name}</span><span className="muted" style={{ fontSize: 11.5 }}>{m.code} · กำลังยืม {m.active}</span></div>
                        <Icon name="chevR" size={16} style={{ color: "var(--muted)" }} />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rise">
                  <div className="row" style={{ gap: 12, marginTop: 8 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 999, background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center", flex: "none" }}><Icon name="user" size={22} /></div>
                    <div className="stack" style={{ flex: 1, lineHeight: 1.25 }}><span style={{ fontSize: 15.5, fontWeight: 600 }}>{member.name}</span><span className="muted" style={{ fontSize: 12.5 }}>{member.code} · {member.phone}</span></div>
                    <button onClick={reset} style={iconBtnStyle}><Icon name="x" size={16} /></button>
                  </div>
                  <div className="row" style={{ gap: 8, marginTop: 14 }}>
                    <div className="card" style={{ flex: 1, padding: "9px 12px", textAlign: "center", background: "var(--bg)" }}><div style={{ fontFamily: "var(--font-head)", fontSize: 19, color: "var(--brand-ink)" }}>{member.active}</div><div className="muted" style={{ fontSize: 11 }}>กำลังยืม</div></div>
                    <div className="card" style={{ flex: 1, padding: "9px 12px", textAlign: "center", background: "var(--bg)" }}><div style={{ fontFamily: "var(--font-head)", fontSize: 19, color: "var(--ink)" }}>{member.history}</div><div className="muted" style={{ fontSize: 11 }}>ยืมสะสม</div></div>
                  </div>
                  <div className="row" style={{ gap: 8, marginTop: 10, padding: "10px 12px", background: "var(--brand-soft)", borderRadius: 10, color: "var(--brand-ink)", fontSize: 12.5 }}>
                    <Icon name="baby" size={15} /> ผู้ปกครองของ {member.child}
                  </div>
                </div>
              )}
            </div>
            {/* rules reminder */}
            <div className="card" style={{ padding: 16, background: "var(--bg)" }}>
              <span className="row" style={{ gap: 7, fontSize: 13, fontWeight: 600, color: "var(--ink-2)", marginBottom: 8 }}><Icon name="flag" size={15} /> กฎการยืม</span>
              {[["ของเล่น", `สูงสุด ${Do.rules.maxToys} ชิ้น`], ["หนังสือ", `สูงสุด ${Do.rules.maxBooks} เล่ม`], ["ระยะเวลา", `${Do.rules.days} วัน · ต่อ ${Do.rules.renewals} ครั้ง`], ["ค่าปรับ", `${Do.rules.finePerDay} บาท/วัน`]].map(([k, v]) => (
                <div key={k} className="row" style={{ justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}><span className="muted">{k}</span><span style={{ fontWeight: 500 }}>{v}</span></div>
              ))}
            </div>
          </div>

          {/* action panel */}
          <div className="card" style={{ padding: 0, overflow: "hidden", minHeight: 420, display: "flex", flexDirection: "column" }}>
            {!member ? (
              <Empty icon="user" title="เลือกสมาชิกก่อนเริ่มทำรายการ" sub="สแกนรหัสสมาชิกหรือเลือกจากรายชื่อด้านซ้าย เพื่อเริ่มบันทึกการยืมหรือรับคืน" />
            ) : mode === "out" ? (
              <>
                <div className="row" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
                  <span className="label" style={{ margin: 0 }}>ขั้นที่ 2 — เพิ่มรายการที่จะยืม</span>
                  <button className="btn btn-soft btn-sm" onClick={() => setPicker(true)}><Icon name="plus" size={15} /> สแกน/เพิ่มรายการ</button>
                </div>
                <div className="stack" style={{ flex: 1, padding: cart.length ? 16 : 0, gap: 10 }}>
                  {cart.length === 0 ? <Empty icon="box" title="ยังไม่มีรายการในตะกร้า" sub="กด “สแกน/เพิ่มรายการ” เพื่อเพิ่มของเล่นหรือหนังสือที่สมาชิกต้องการยืม" /> :
                    cart.map((it) => (
                      <div key={it.id} className="row" style={{ gap: 13, padding: 11, border: "1px solid var(--line)", borderRadius: 12 }}>
                        <div style={{ width: 46, flex: "none" }}><ItemImage item={it} ratio="1 / 1" radius="9px" /></div>
                        <div className="stack" style={{ flex: 1, gap: 3 }}><span style={{ fontWeight: 500, fontSize: 14.5 }}>{it.th}</span><span className="muted" style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>{it.code}</span></div>
                        <span className="tag" style={{ fontSize: 11.5 }}>{it.kind === "toy" ? "ของเล่น" : "หนังสือ"}</span>
                        <button onClick={() => setCart(cart.filter((x) => x.id !== it.id))} style={iconBtnStyle}><Icon name="x" size={15} /></button>
                      </div>
                    ))}
                </div>
                {cart.length > 0 && (
                  <div className="stack" style={{ gap: 12, padding: "15px 20px", borderTop: "1px solid var(--line)", background: "var(--bg)" }}>
                    <div className="row" style={{ gap: 10 }}>
                      <span className="row" style={{ gap: 7, fontSize: 13.5, color: "var(--ink-2)", whiteSpace: "nowrap" }}><Icon name="box" size={16} /> รหัสถุงผ้า</span>
                      <input value={bag} onChange={(e) => setBag(e.target.value)} placeholder="สแกน/พิมพ์รหัสถุงผ้า (ถ้ามี)" style={{ flex: 1, border: "1px solid var(--line-2)", borderRadius: 9, padding: "8px 11px", outline: "none", fontSize: 13.5, background: "var(--surface)" }} />
                    </div>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <span className="row" style={{ gap: 8, fontSize: 13.5, color: "var(--ink-2)" }}><Icon name="cal" size={16} /> กำหนดคืน <strong style={{ fontWeight: 600 }}>{of.fmtDate(of.addDays(Do.today, Do.rules.days))}</strong></span>
                      <button className="btn btn-primary" onClick={confirmBorrow}><Icon name="check" size={17} /> ยืนยันการยืม {cart.length} รายการ</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="row" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
                  <span className="label" style={{ margin: 0 }}>ขั้นที่ 2 — เลือกรายการที่รับคืน ({memberLoans.length})</span>
                </div>
                <div className="stack" style={{ flex: 1, padding: memberLoans.length ? 16 : 0, gap: 10 }}>
                  {memberLoans.length === 0 ? <Empty icon="check" title="สมาชิกนี้ไม่มีรายการค้างคืน" /> :
                    memberLoans.map((l) => {
                      const it = Do.itemById(l.itemId); const left = of.daysBetween(Do.today, l.due); const over = left < 0;
                      const sel = cart.includes(it);
                      return (
                        <button key={l.id} onClick={() => setCart(sel ? cart.filter((x) => x !== it) : [...cart, it])} style={{
                          display: "flex", alignItems: "center", gap: 13, padding: 11, borderRadius: 12, cursor: "pointer", textAlign: "left",
                          border: sel ? "2px solid var(--brand)" : "1px solid var(--line)", background: sel ? "var(--brand-soft)" : "var(--surface)",
                        }}>
                          <span style={{ width: 22, height: 22, borderRadius: 7, flex: "none", border: sel ? "none" : "1.5px solid var(--line-2)", background: sel ? "var(--brand)" : "transparent", color: "#fff", display: "grid", placeItems: "center" }}>{sel && <Icon name="check" size={14} />}</span>
                          <div style={{ width: 46, flex: "none" }}><ItemImage item={it} ratio="1 / 1" radius="9px" /></div>
                          <div className="stack" style={{ flex: 1, gap: 3 }}>
                            <span style={{ fontWeight: 500, fontSize: 14.5 }}>{it.th}</span>
                            <span className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                              <span className="muted" style={{ fontSize: 12 }}>กำหนดคืน {of.fmtDate(l.due)}</span>
                              {l.bag && <span className="tag" style={{ fontSize: 11 }}><Icon name="box" size={12} /> ถุงผ้า {l.bag}</span>}
                            </span>
                          </div>
                          {over ? <span className="pill over">เกิน {Math.abs(left)} วัน · {Math.abs(left) * Do.rules.finePerDay} บ.</span> : <span className="pill ok">ตรงเวลา</span>}
                        </button>
                      );
                    })}
                </div>
                {cart.length > 0 && (
                  <div className="row" style={{ justifyContent: "space-between", padding: "15px 20px", borderTop: "1px solid var(--line)", background: "var(--bg)" }}>
                    <span style={{ fontSize: 13.5, color: "var(--ink-2)" }}>เลือกรับคืน {cart.length} รายการ</span>
                    <button className="btn btn-primary" onClick={confirmReturn}><Icon name="check" size={17} /> ยืนยันรับคืน</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {picker && <ItemPicker onPick={(it) => { if (!cart.includes(it)) setCart([...cart, it]); setPicker(false); }} onClose={() => setPicker(false)} />}
    </div>
  );
}

function ItemPicker({ onPick, onClose }) {
  const [q, setQ] = React.useState("");
  const rows = Do.items.filter((it) => it.status === "ok" && (!q.trim() || (it.th + it.code).toLowerCase().includes(q.trim().toLowerCase()))).slice(0, 30);
  return ReactDOM.createPortal(
    <div className="overlay" onClick={onClose} style={overlayStyle}>
      <div className="card rise" onClick={(e) => e.stopPropagation()} style={{ width: "min(560px,94vw)", maxHeight: "82vh", display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
        <div className="row" style={{ gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
          <Icon name="search" size={19} style={{ color: "var(--muted)" }} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="สแกนหรือค้นหารายการที่ว่าง…" style={{ flex: 1, border: "none", outline: "none", fontSize: 15, background: "transparent" }} />
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={17} /></button>
        </div>
        <div className="stack" style={{ overflow: "auto", padding: 10, gap: 6 }}>
          {rows.map((it) => (
            <button key={it.id} onClick={() => onPick(it)} className="memrow" style={{ display: "flex", alignItems: "center", gap: 12, padding: 9, borderRadius: 11, border: "1px solid var(--line)", background: "var(--surface)", textAlign: "left", cursor: "pointer" }}>
              <div style={{ width: 42, flex: "none" }}><ItemImage item={it} ratio="1 / 1" radius="9px" /></div>
              <div className="stack" style={{ flex: 1 }}><span style={{ fontWeight: 500, fontSize: 14 }}>{it.th}</span><span className="muted" style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>{it.code}</span></div>
              <span className="tag" style={{ fontSize: 11 }}>{it.kind === "toy" ? "ของเล่น" : "หนังสือ"}</span>
              <Icon name="plus" size={17} style={{ color: "var(--brand)" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  , document.body);
}

/* ========================================================== */
/*  REPORTS                                                    */
/* ========================================================== */
function AdminReports() {
  const maxBar = Math.max(...Do.monthly.map((m) => m.borrow));
  const popular = [...Do.items].sort((a, b) => b.loans - a.loans).slice(0, 6);
  const maxLoans = popular[0].loans;
  const catStats = Do.TOY_CATS.map((c) => ({ ...c, n: Do.toys.filter((t) => t.cat === c.id).reduce((s, t) => s + t.loans, 0) }));
  const totalCat = catStats.reduce((s, c) => s + c.n, 0);
  const ageStats = Do.AGE_BANDS.map((b) => ({ ...b, n: Do.toys.filter((t) => t.ageLo < b.hi && t.ageHi > b.lo).length }));
  const maxAge = Math.max(...ageStats.map((a) => a.n));

  const exportReport = async () => {
    try {
      const XLSX = await (window.XLSX ? Promise.resolve(window.XLSX) : new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
        s.onload = () => window.XLSX ? res(window.XLSX) : rej(new Error("XLSX ไม่พร้อม"));
        s.onerror = () => rej(new Error("โหลด SheetJS ไม่ได้"));
        document.head.appendChild(s);
      }));

      const wb = XLSX.utils.book_new();

      // Sheet 1: ยืม-คืนรายเดือน
      const wsMonthly = XLSX.utils.aoa_to_sheet([
        ["เดือน", "ยืม", "คืน"],
        ...Do.monthly.map(m => [m.m, m.borrow, m.ret]),
      ]);
      wsMonthly["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsMonthly, "ยืม-คืนรายเดือน");

      // Sheet 2: รายการยอดนิยม
      const allPopular = [...Do.items].sort((a, b) => b.loans - a.loans);
      const wsPopular = XLSX.utils.aoa_to_sheet([
        ["อันดับ", "ชื่อรายการ", "ประเภท", "รหัส", "ยืมแล้ว (ครั้ง)", "สถานะ"],
        ...allPopular.map((it, i) => [i + 1, it.th, it.kind === "book" ? "หนังสือ" : "ของเล่น", it.code, it.loans, it.status === "ok" ? "ว่าง" : "ถูกยืม"]),
      ]);
      wsPopular["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsPopular, "รายการยอดนิยม");

      // Sheet 3: ด้านพัฒนาการ
      const wsCat = XLSX.utils.aoa_to_sheet([
        ["ด้านพัฒนาการ", "ยืมสะสม", "สัดส่วน (%)"],
        ...catStats.sort((a, b) => b.n - a.n).map(c => [c.th, c.n, totalCat ? +(c.n / totalCat * 100).toFixed(1) : 0]),
      ]);
      wsCat["!cols"] = [{ wch: 24 }, { wch: 12 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wsCat, "ด้านพัฒนาการ");

      // Sheet 4: สมาชิก
      const wsMembers = XLSX.utils.aoa_to_sheet([
        ["รหัสสมาชิก", "ชื่อ", "ชื่อเด็ก", "เบอร์โทร", "กำลังยืม", "ยืมสะสม"],
        ...Do.members.map(m => [m.code, m.name, m.child || "", m.phone || "", m.active || 0, m.history || 0]),
      ]);
      wsMembers["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsMembers, "สมาชิก");

      XLSX.writeFile(wb, `sitoylib_report_${Do.today}.xlsx`);
    } catch (ex) {
      alert("ส่งออกรายงานไม่ได้: " + ex.message);
    }
  };

  return (
    <div className="rise" style={{ padding: "26px 32px 50px", maxWidth: 1320, margin: "0 auto" }}>
      <AdminHead title="รายงาน & สถิติ" sub="ภาพรวมการใช้งานห้องสมุด · ปีงบประมาณ 2569">
        <button className="btn btn-ghost"><Icon name="cal" size={17} /> 6 เดือนล่าสุด</button>
        <button className="btn btn-primary" onClick={exportReport}><Icon name="download" size={17} /> ส่งออกรายงาน</button>
      </AdminHead>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 22 }}>
        <Stat label="ยอดยืมสะสม (ปีนี้)" value={Do.monthly.reduce((s, m) => s + (m.borrow || 0), 0)} icon="arrowR" tone="brand" sub="รายการยืมในปีนี้" />
        <Stat label="สมาชิกใช้งาน" value={Do.members.length} icon="user" tone="accent" sub="สมาชิกที่ลงทะเบียน" />
        <Stat label="อัตราคืนตรงเวลา" value="–" icon="check" tone="ok" sub="ยังไม่มีข้อมูล" />
        <Stat label="ค่าปรับสะสม" value="0฿" icon="flag" tone="sun" sub="นำเข้ากองทุนห้องสมุด" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* monthly chart */}
        <div className="card" style={{ padding: 22 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 22 }}>
            <h3 className="row" style={{ fontSize: 17, gap: 8 }}><Icon name="chart" size={18} /> ยืม–คืนรายเดือน</h3>
            <div className="row" style={{ gap: 14, fontSize: 12.5 }}>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: "var(--brand)" }}></span> ยืม</span>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: "var(--brand-soft-2)" }}></span> คืน</span>
            </div>
          </div>
          <div className="row" style={{ alignItems: "flex-end", gap: 18, height: 200, paddingBottom: 26, position: "relative" }}>
            {Do.monthly.map((m) => (
              <div key={m.m} className="stack" style={{ flex: 1, alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div className="row" style={{ gap: 5, alignItems: "flex-end", height: "100%", width: "100%", justifyContent: "center" }}>
                  <div title={`ยืม ${m.borrow}`} style={{ width: "38%", height: `${(m.borrow / maxBar) * 100}%`, background: "var(--brand)", borderRadius: "6px 6px 0 0", transition: "height .5s" }}></div>
                  <div title={`คืน ${m.ret}`} style={{ width: "38%", height: `${(m.ret / maxBar) * 100}%`, background: "var(--brand-soft-2)", borderRadius: "6px 6px 0 0", transition: "height .5s" }}></div>
                </div>
                <span className="muted" style={{ fontSize: 12.5, position: "absolute", bottom: 0 }}>{m.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* category donut-ish */}
        <div className="card" style={{ padding: 22 }}>
          <h3 className="row" style={{ fontSize: 17, gap: 8, marginBottom: 18 }}><Icon name="blocks" size={18} /> ยืมตามด้านพัฒนาการ</h3>
          <div className="stack" style={{ gap: 15 }}>
            {catStats.sort((a, b) => b.n - a.n).map((c) => (
              <div key={c.id} className="stack" style={{ gap: 6 }}>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 13.5 }}><span style={{ fontWeight: 500 }}>{c.th}</span><span className="muted">{Math.round((c.n / totalCat) * 100)}%</span></div>
                <div style={{ height: 9, borderRadius: 9, background: "var(--bg-2)", overflow: "hidden" }}><div style={{ height: "100%", width: `${(c.n / totalCat) * 100}%`, background: c.c, borderRadius: 9, transition: "width .5s" }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* popular ranking */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="row" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}><h3 className="row" style={{ fontSize: 17, gap: 8 }}><Icon name="spark" size={18} fill /> รายการยอดนิยม</h3></div>
          <div className="stack" style={{ padding: "8px 0" }}>
            {popular.map((it, i) => (
              <div key={it.id} className="row" style={{ gap: 13, padding: "9px 20px" }}>
                <span style={{ fontFamily: "var(--font-head)", fontSize: 17, color: i < 3 ? "var(--accent)" : "var(--line-2)", width: 26, flex: "none" }}>#{i + 1}</span>
                <div style={{ width: 38, flex: "none" }}><ItemImage item={it} ratio="1 / 1" radius="8px" /></div>
                <div className="stack" style={{ flex: 1, gap: 4 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}><span style={{ fontSize: 14, fontWeight: 500 }}>{it.th}</span><span className="muted" style={{ fontSize: 12.5 }}>{it.loans} ครั้ง</span></div>
                  <div style={{ height: 6, borderRadius: 6, background: "var(--bg-2)", overflow: "hidden" }}><div style={{ height: "100%", width: `${(it.loans / maxLoans) * 100}%`, background: it.kind === "toy" ? "var(--brand)" : "var(--accent)", borderRadius: 6 }}></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* age distribution */}
        <div className="card" style={{ padding: 22 }}>
          <h3 className="row" style={{ fontSize: 17, gap: 8, marginBottom: 18 }}><Icon name="baby" size={18} /> ของเล่นตามช่วงวัย</h3>
          <div className="row" style={{ alignItems: "flex-end", gap: 12, height: 150 }}>
            {ageStats.map((a) => (
              <div key={a.id} className="stack" style={{ flex: 1, alignItems: "center", gap: 8, justifyContent: "flex-end", height: "100%" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--brand-ink)" }}>{a.n}</span>
                <div style={{ width: "60%", height: `${(a.n / maxAge) * 80}%`, background: "linear-gradient(var(--brand), var(--brand-soft-2))", borderRadius: "6px 6px 0 0", minHeight: 8 }}></div>
                <span className="muted" style={{ fontSize: 11, textAlign: "center" }}>{a.en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminOps, AdminReports });
