/* ============================================================
   Siriraj Toy Library — Item detail · Borrow flow · My shelf
   ============================================================ */
const Dd = window.DATA;
const { daysBetween, fmtDate, addDays } = window.mDateHelpers;

/* ========================================================== */
/*  ITEM DETAIL  (modal)                                       */
/* ========================================================== */
function ItemDetail({ item, onClose }) {
  if (!item) return null;
  const cat = Dd.catLabel(item);
  const age = Dd.ageText(item);
  const info = Dd.availInfo(item);
  const avail = item.status === "ok";
  const inlib = item.status === "inlib";
  const isToy = item.kind === "toy";
  const copyWord = isToy ? "ชิ้น" : "เล่ม";

  const meta = isToy
    ? [["รหัสของเล่น", item.code], ["ด้านพัฒนาการ", cat.th], ["ช่วงอายุ", age], ["จำนวนชิ้น/ชุด", item.pieces || "1 ชุด"],
       [`จำนวนในห้อง`, `${info.total} ${copyWord}`], ["ว่างขณะนี้", `${info.avail} ${copyWord}`]]
    : [["ISBN", item.code], ["ผู้แต่ง", item.author || "–"], ["หมวดหมู่", cat.th], ["ภาษา", item.cat === "foreign" ? "อังกฤษ/สองภาษา" : "ไทย"],
       ["ปีที่พิมพ์", item.publishYear || "–"], ["ครั้งที่พิมพ์", item.edition || "–"],
       ["จำนวนในห้อง", `${info.total} เล่ม`], ["ว่างขณะนี้", `${info.avail} เล่ม`]];

  return (
    <div className="overlay" onClick={onClose} style={overlayStyle}>
      <div className="card rise" onClick={(e) => e.stopPropagation()} style={{
        width: "min(940px, 94vw)", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-lg)", borderRadius: 24,
      }}>
        <div className="row" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <span className="row" style={{ gap: 9, fontSize: 13.5, color: "var(--muted)", fontWeight: 500 }}>
            <Icon name={isToy ? "blocks" : "book"} size={17} /> {isToy ? "รายละเอียดของเล่น" : "รายละเอียดหนังสือ"}
          </span>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 0, overflow: "auto" }}>
          <div style={{ padding: 26, background: "var(--bg)" }}>
            <ItemImage item={item} ratio="1 / 1" big />
            <div className="row" style={{ gap: 10, marginTop: 16 }}>
              <div className="card" style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
                <span className="muted" style={{ fontSize: 11.5 }}>ยืมออกสะสม</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{item.loans} ครั้ง</span>
              </div>
              <div className="card" style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
                <span className="muted" style={{ fontSize: 11.5 }}>สถานะตอนนี้</span>
                <StatusPill status={item.status} count={info} />
              </div>
            </div>
          </div>
          <div className="stack" style={{ padding: 28, gap: 16 }}>
            <div>
              <div className="row" style={{ gap: 7, marginBottom: 10, flexWrap: "wrap" }}>
                <span className="tag" style={{ background: `color-mix(in srgb, ${isToy ? cat.c : "var(--brand)"} 13%, #fff)`, color: isToy ? cat.c : "var(--brand-ink)" }}>{cat.th}</span>
                {age && <span className="tag"><Icon name="baby" size={13} /> {age}</span>}
              </div>
              <h2 style={{ fontSize: 26, lineHeight: 1.2 }}>{item.th}</h2>
              <p className="en" style={{ fontSize: 14, marginTop: 4 }}>{item.en}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", padding: "16px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
              {meta.map(([k, v]) => (
                <div key={k} className="stack" style={{ gap: 2 }}><span className="muted" style={{ fontSize: 12 }}>{k}</span><span style={{ fontSize: 14.5, fontWeight: 500 }}>{v}</span></div>
              ))}
            </div>
            {avail ? (
              <div className="row" style={{ gap: 10, padding: "11px 14px", background: "var(--brand-soft)", borderRadius: 12, color: "var(--brand-ink)", fontSize: 13.5 }}>
                <Icon name="check" size={18} /> พร้อมให้ยืม{info.total > 1 ? ` ${info.avail} จาก ${info.total} ${copyWord}` : ""} — ติดต่อบรรณารักษ์ที่เคาน์เตอร์เพื่อดำเนินการยืม
              </div>
            ) : inlib ? (
              <div className="row" style={{ gap: 10, padding: "11px 14px", background: "var(--bg-2)", borderRadius: 12, color: "var(--ink-2)", fontSize: 13.5 }}>
                <Icon name="pin" size={18} /> รายการนี้ใช้บริการได้เฉพาะภายในห้องสมุด — ไม่สามารถยืมกลับบ้านได้
              </div>
            ) : (
              <div className="row" style={{ gap: 10, padding: "11px 14px", background: "var(--warn-soft)", borderRadius: 12, color: "#a9661a", fontSize: 13.5 }}>
                <Icon name="clock" size={18} /> ขณะนี้ถูกยืมอยู่{item.due && ` · คาดว่าคืน ${fmtDate(item.due)}`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================== */
/*  MY SHELF (history)                                         */
/* ========================================================== */
function MemberHistory({ openItem }) {
  const me = Dd.currentMember;
  const active = Dd.loans.filter((l) => l.member === me.id);
  const history = Dd.myHistory;

  return (
    <div className="rise" style={{ maxWidth: 1080, margin: "0 auto", padding: "30px 28px 56px" }}>
      <div className="row" style={{ gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center" }}><Icon name="user" size={26} /></div>
        <div className="stack"><h1 style={{ fontSize: 27 }}>{me.name}</h1><span className="muted">{me.code} · ผู้ปกครองของ {me.child} · ยืมสะสม {me.history} ครั้ง</span></div>
        <div className="row" style={{ gap: 12, marginLeft: "auto" }}>
          <MiniStat label="กำลังยืม" value={active.length} tone="brand" />
          <MiniStat label="เกินกำหนด" value={active.filter((l) => l.status === "overdue").length} tone="over" />
          <MiniStat label="ใกล้ครบ" value={active.filter((l) => l.status === "due-soon").length} tone="sun" />
        </div>
      </div>

      <h3 className="row" style={{ fontSize: 18, gap: 8, marginBottom: 14 }}><Icon name="inbox" size={19} /> รายการที่กำลังยืม</h3>
      <div className="stack" style={{ gap: 12, marginBottom: 34 }}>
        {active.length === 0 ? <Empty icon="inbox" title="ยังไม่มีรายการที่ยืมอยู่" sub="ลองเลือกของเล่นหรือหนังสือสนุกๆ ไปเล่นกับน้องที่บ้านดูสิ" /> :
          active.map((l) => {
            const it = Dd.itemById(l.itemId);
            const left = daysBetween(Dd.today, l.due);
            const over = left < 0;
            const soon = left >= 0 && left <= 2;
            return (
              <div key={l.id} className="card" style={{ padding: 14, display: "flex", gap: 16, alignItems: "center", borderLeft: `4px solid ${over ? "var(--over)" : soon ? "var(--sun)" : "var(--brand)"}` }}>
                <div style={{ width: 70, flex: "none" }}><ItemImage item={it} ratio="1 / 1" radius="11px" /></div>
                <div className="stack" style={{ gap: 4, flex: 1 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="tag" style={{ fontSize: 11.5 }}>{it.kind === "toy" ? "ของเล่น" : "หนังสือ"}</span>
                    <span className="muted" style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>{it.code}</span>
                  </div>
                  <h4 style={{ fontSize: 16.5, fontWeight: 500 }}>{it.th}</h4>
                  <span className="row" style={{ gap: 6, fontSize: 13, color: "var(--ink-2)" }}><Icon name="cal" size={14} /> ยืม {fmtDate(l.borrowed)} · กำหนดคืน {fmtDate(l.due)}</span>
                </div>
                <div className="stack" style={{ alignItems: "flex-end", gap: 9 }}>
                  {over ? <span className="pill over"><Icon name="flag" size={13} /> เกิน {Math.abs(left)} วัน · ปรับ {Math.abs(left) * Dd.rules.finePerDay} บ.</span>
                    : soon ? <span className="pill warn"><Icon name="clock" size={13} /> เหลือ {left} วัน</span>
                      : <span className="pill ok"><Icon name="check" size={13} /> เหลือ {left} วัน</span>}
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn-soft btn-sm" onClick={() => openItem(it)}>ดูรายละเอียด</button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <h3 className="row" style={{ fontSize: 18, gap: 8, marginBottom: 14 }}><Icon name="clock" size={19} /> ประวัติการยืม-คืน</h3>
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr style={{ background: "var(--bg-2)", textAlign: "left" }}>
            {["รายการ", "ยืมเมื่อ", "คืนเมื่อ", "สถานะ"].map((h) => <th key={h} style={{ padding: "12px 18px", fontWeight: 500, color: "var(--ink-2)", fontSize: 13 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {history.map((h, i) => {
              const it = Dd.itemById(h.itemId);
              return (
                <tr key={h.id} style={{ borderTop: "1px solid var(--line)", cursor: "pointer" }} onClick={() => openItem(it)} className="histrow">
                  <td style={{ padding: "13px 18px" }}><div className="row" style={{ gap: 11 }}>
                    <div style={{ width: 38, flex: "none" }}><ItemImage item={it} ratio="1 / 1" radius="9px" /></div>
                    <div className="stack"><span style={{ fontWeight: 500 }}>{it.th}</span><span className="muted" style={{ fontSize: 12 }}>{it.kind === "toy" ? "ของเล่น" : "หนังสือ"}</span></div>
                  </div></td>
                  <td style={{ padding: "13px 18px", color: "var(--ink-2)" }}>{fmtDate(h.borrowed)}</td>
                  <td style={{ padding: "13px 18px", color: "var(--ink-2)" }}>{fmtDate(h.returned)}</td>
                  <td style={{ padding: "13px 18px" }}>{h.late ? <span className="pill warn">คืนล่าช้า</span> : <span className="pill ok">ตรงเวลา</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const c = { brand: "var(--brand)", over: "var(--over)", sun: "var(--sun)" }[tone];
  return (
    <div className="card" style={{ padding: "10px 18px", textAlign: "center", minWidth: 86 }}>
      <div style={{ fontFamily: "var(--font-head)", fontSize: 24, color: c, lineHeight: 1 }}>{value}</div>
      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const overlayStyle = { position: "fixed", inset: 0, zIndex: 60, background: "rgba(34,28,22,.42)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 };

Object.assign(window, { ItemDetail, MemberHistory, overlayStyle });
