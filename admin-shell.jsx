/* ============================================================
   Siriraj Toy Library — Admin shell · Dashboard · Manage
   ============================================================ */
const Da = window.DATA;
const af = window.mDateHelpers;

/* ---------- Import helpers ---------- */
const IMPORT_COL_MAP = {
  'ประเภท': 'kind', 'type': 'kind', 'kind': 'kind',
  'ชื่อไทย': 'th', 'ชื่อ (ไทย)': 'th', 'ชื่อ(ไทย)': 'th', 'th': 'th',
  'ชื่ออังกฤษ': 'en', 'ชื่อ (อังกฤษ)': 'en', 'ชื่อ(อังกฤษ)': 'en', 'en': 'en',
  'รหัส': 'code', 'isbn': 'code', 'code': 'code',
  'หมวดหมู่': 'cat', 'ด้านพัฒนาการ': 'cat', 'หมวด': 'cat', 'cat': 'cat',
  'ผู้แต่ง': 'author', 'author': 'author',
  'อายุต่ำสุด': 'ageLo', 'อายุต่ำ': 'ageLo', 'agelo': 'ageLo',
  'อายุสูงสุด': 'ageHi', 'อายุสูง': 'ageHi', 'agehi': 'ageHi',
  'สถานะ': 'status', 'status': 'status',
  'ครั้งที่พิมพ์': 'edition', 'edition': 'edition',
  'เลขหมู่': 'callNumber', 'callnumber': 'callNumber',
  'เลขผู้แต่ง': 'cutterNumber', 'cutternumber': 'cutterNumber',
};

function loadSheetJS() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    s.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error("XLSX ไม่พร้อมใช้งาน"));
    s.onerror = () => reject(new Error("ไม่สามารถโหลด SheetJS — กรุณาตรวจสอบอินเทอร์เน็ต"));
    document.head.appendChild(s);
  });
}

function parseCSVText(text) {
  const t = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  const lines = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const result = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const fields = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (inQ && line[i + 1] === '"') { field += '"'; i++; } else { inQ = !inQ; } }
      else if (c === ',' && !inQ) { fields.push(field.trim()); field = ''; }
      else { field += c; }
    }
    fields.push(field.trim());
    result.push(fields);
  }
  return result;
}

function sheetRowsToItems(rows, existingCodes) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => String(h).trim());
  const colIdx = {};
  headers.forEach((h, i) => {
    const field = IMPORT_COL_MAP[h] || IMPORT_COL_MAP[h.toLowerCase()];
    if (field) colIdx[field] = i;
  });
  const STATUS_NORM = { 'ว่าง': 'ok', 'available': 'ok', 'ok': 'ok', 'ถูกยืม': 'busy', 'busy': 'busy', 'ซ่อม': 'fix', 'fix': 'fix', 'maintenance': 'fix', 'ซ่อมบำรุง': 'fix' };
  const items = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.every(c => !String(c).trim())) continue;
    const item = { status: 'ok', loans: 0, ageLo: 0, ageHi: 999 };
    Object.entries(colIdx).forEach(([field, i]) => {
      const v = String(row[i] || '').trim();
      if (!v) return;
      if (field === 'ageLo' || field === 'ageHi') item[field] = parseInt(v) || 0;
      else item[field] = v;
    });
    if (!item.kind) item.kind = 'toy';
    else { const k = item.kind.toLowerCase(); item.kind = (k.includes('book') || k.includes('หนังสือ')) ? 'book' : 'toy'; }
    if (item.status) item.status = STATUS_NORM[item.status.toLowerCase()] || STATUS_NORM[item.status] || 'ok';
    if (!item.th) continue;
    item.id = 'it' + Date.now() + Math.random().toString(36).slice(2, 6);
    item._dup = !!(item.code && existingCodes.has(item.code));
    items.push(item);
  }
  return items;
}

/* ========================================================== */
/*  ADMIN SHELL                                                */
/* ========================================================== */
function AdminApp({ openItem, onLogout, adminUser }) {
  const [page, setPage] = React.useState("dash");
  const nav = [
    { id: "dash", th: "ภาพรวม", en: "Dashboard", icon: "home" },
    { id: "ops", th: "ยืม–คืน", en: "Circulation", icon: "refresh" },
    { id: "manage", th: "จัดการทรัพยากร", en: "Catalog", icon: "box" },
    { id: "members", th: "สมาชิก", en: "Members", icon: "user" },
    { id: "reports", th: "รายงาน & สถิติ", en: "Reports", icon: "chart" },
  ];
  const pages = {
    dash: <AdminDash setPage={setPage} openItem={openItem} adminUser={adminUser} />,
    ops: <AdminOps />,
    manage: <AdminManage openItem={openItem} />,
    members: <AdminMembers />,
    reports: <AdminReports />,
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "242px 1fr", minHeight: "100vh" }}>
      {/* sidebar */}
      <aside style={{ background: "var(--surface)", borderRight: "1px solid var(--line)", padding: "22px 16px", position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ padding: "0 8px 18px" }}><Logo size={34} /></div>
        <span className="label" style={{ padding: "0 10px", marginBottom: 2 }}>เมนูบรรณารักษ์</span>
        {nav.map((n) => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 12, border: "none",
            background: page === n.id ? "var(--brand-soft)" : "transparent", color: page === n.id ? "var(--brand-ink)" : "var(--ink-2)",
            fontSize: 14.5, fontWeight: 500, textAlign: "left", transition: "all .14s",
          }}>
            <Icon name={n.icon} size={19} /><div className="stack" style={{ lineHeight: 1.15 }}><span>{n.th}</span></div>
          </button>
        ))}
        <div className="card" style={{ marginTop: "auto", padding: 14, background: "var(--bg)", border: "1px solid var(--line)" }}>
          <div className="row" style={{ gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 999, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", flex: "none" }}><Icon name="user" size={19} /></div>
            <div className="stack" style={{ lineHeight: 1.2 }}><span style={{ fontSize: 13.5, fontWeight: 600 }}>{(adminUser?.title || "บรรณารักษ์") + " " + (adminUser?.displayName || "")}</span><span className="muted" style={{ fontSize: 11.5 }}>{adminUser?.staffId || "STAFF"}</span></div>
          </div>
          <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 12 }} onClick={onLogout}><Icon name="logout" size={15} /> ออกจากระบบ</button>
        </div>
      </aside>
      <main style={{ background: "var(--bg)", overflow: "auto" }}>{pages[page]}</main>
    </div>
  );
}

function AdminHead({ title, sub, children }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
      <div><h1 style={{ fontSize: 28 }}>{title}</h1><p className="muted" style={{ marginTop: 5 }}>{sub}</p></div>
      <div className="row" style={{ gap: 10 }}>{children}</div>
    </div>
  );
}

/* ========================================================== */
/*  DASHBOARD                                                  */
/* ========================================================== */
function AdminDash({ setPage, openItem, adminUser }) {
  const overdue = Da.loans.filter((l) => l.status === "overdue");
  const dueSoon = Da.loans.filter((l) => l.status === "due-soon");
  const available = Da.items.filter((i) => i.status === "ok").length;
  const popular = [...Da.items].sort((a, b) => b.loans - a.loans).slice(0, 5);
  const actIcon = { return: { i: "check", c: "var(--ok)" }, borrow: { i: "arrowR", c: "var(--brand)" }, reserve: { i: "clock", c: "var(--busy)" } };

  return (
    <div className="rise" style={{ padding: "26px 32px 50px", maxWidth: 1320, margin: "0 auto" }}>
      <AdminHead title={`สวัสดี, ${adminUser?.displayName || "บรรณารักษ์"} 👋`} sub={`วันนี้ ${af.fmtDate(Da.today)} · มีรายการต้องดูแล ${overdue.length + dueSoon.length} รายการ`}>
        <button className="btn btn-ghost"><Icon name="cal" size={17} /> วันนี้</button>
        <button className="btn btn-primary" onClick={() => setPage("ops")}><Icon name="qr" size={17} /> สแกนยืม–คืน</button>
      </AdminHead>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <Stat label="ยืมออกวันนี้" value={Da.loans.filter(l => l.borrowed === Da.today).length} icon="arrowR" tone="brand" sub={Da.loans.filter(l => l.borrowed === Da.today).length === 0 ? "ยังไม่มีการยืมวันนี้" : "รายการที่ยืมออกวันนี้"} />
        <Stat label="พร้อมให้ยืม" value={available} icon="box" tone="ok" sub={`จากทั้งหมด ${Da.items.length} รายการ`} />
        <Stat label="ใกล้ครบกำหนด" value={dueSoon.length} icon="clock" tone="sun" sub="ภายใน 2 วัน" />
        <Stat label="เกินกำหนด" value={overdue.length} icon="flag" tone="over" sub="ต้องติดตามทวงคืน" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        {/* alerts */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="row" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
            <h3 className="row" style={{ fontSize: 17, gap: 8 }}><Icon name="bell" size={18} /> ต้องติดตาม</h3>
            <button className="btn btn-soft btn-sm" onClick={() => setPage("ops")}>ไปหน้ายืม–คืน</button>
          </div>
          <div className="stack">
            {[...overdue, ...dueSoon].length === 0 ? (
              <div className="row" style={{ gap: 9, padding: "26px 20px", color: "var(--muted)", fontSize: 14 }}>
                <Icon name="check" size={17} /> ไม่มีรายการที่ต้องติดตาม
              </div>
            ) : [...overdue, ...dueSoon].map((l, i, arr) => {
              const it = Da.itemById(l.itemId); const m = Da.members.find((x) => x.id === l.member);
              const left = af.daysBetween(Da.today, l.due); const over = left < 0;
              return (
                <div key={l.id} className="row arow" style={{ gap: 14, padding: "13px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none", cursor: "pointer" }} onClick={() => openItem(it)}>
                  <div style={{ width: 44, flex: "none" }}><ItemImage item={it} ratio="1 / 1" radius="10px" /></div>
                  <div className="stack" style={{ flex: 1, gap: 2 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 500 }}>{it.th}</span>
                    <span className="muted" style={{ fontSize: 12.5 }}>{m.name} · {m.phone}</span>
                  </div>
                  {over ? <span className="pill over">เกิน {Math.abs(left)} วัน</span> : <span className="pill warn">เหลือ {left} วัน</span>}
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); }}><Icon name="bell" size={14} /> เตือน</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* recent activity */}
        <div className="card" style={{ padding: 0, overflow: "hidden", height: "fit-content" }}>
          <div className="row" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
            <h3 className="row" style={{ fontSize: 17, gap: 8 }}><Icon name="clock" size={18} /> กิจกรรมล่าสุด</h3>
          </div>
          <div className="stack" style={{ padding: "6px 0" }}>
            {Da.activity.length === 0 ? (
              <div style={{ padding: "26px 20px", color: "var(--muted)", fontSize: 13.5, textAlign: "center" }}>
                ยังไม่มีกิจกรรมในวันนี้
              </div>
            ) : Da.activity.slice(0, 12).map((a, i) => {
              const ic = actIcon[a.type];
              return (
                <div key={i} className="row" style={{ gap: 12, padding: "10px 20px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flex: "none", display: "grid", placeItems: "center", background: `color-mix(in srgb, ${ic.c} 13%, #fff)`, color: ic.c }}><Icon name={ic.i} size={16} /></div>
                  <div className="stack" style={{ flex: 1, lineHeight: 1.3 }}>
                    <span style={{ fontSize: 13.5 }}><strong style={{ fontWeight: 600 }}>{a.type === "return" ? "คืน" : a.type === "borrow" ? "ยืม" : "จอง"}</strong> · {a.item}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{a.who}</span>
                  </div>
                  <span className="muted" style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>{a.t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* popular mini */}
      <div className="card" style={{ marginTop: 20, padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <h3 className="row" style={{ fontSize: 17, gap: 8 }}><Icon name="spark" size={18} fill /> ยอดนิยมเดือนนี้</h3>
          <button className="btn btn-soft btn-sm" onClick={() => setPage("reports")}>ดูรายงานเต็ม</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)" }}>
          {popular.map((it, i) => (
            <button key={it.id} onClick={() => openItem(it)} style={{ border: "none", background: "none", textAlign: "left", padding: 16, borderRight: i < 4 ? "1px solid var(--line)" : "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }} className="poptile">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-head)", fontSize: 18, color: "var(--line-2)" }}>#{i + 1}</span>
                <span className="tag" style={{ fontSize: 11 }}>{it.kind === "toy" ? "ของเล่น" : "หนังสือ"}</span>
              </div>
              <ItemImage item={it} ratio="4 / 3" radius="10px" />
              <div className="stack" style={{ gap: 3 }}><span style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.3 }}>{it.th}</span><span className="muted" style={{ fontSize: 12 }}>ยืม {it.loans} ครั้ง</span></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================================================== */
/*  MANAGE CATALOG                                             */
/* ========================================================== */
const ITEMS_LS_KEY = "stl_items_full_v1";

function AdminManage({ openItem }) {
  const [items, setItems] = React.useState(() => {
    if (!window.DB) {
      try {
        const s = localStorage.getItem(ITEMS_LS_KEY);
        if (s) { const p = JSON.parse(s); Da.items.length = 0; p.forEach(i => Da.items.push(i)); return p; }
      } catch {}
    }
    return [...Da.items];
  });
  const [filter, setFilter] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState(null);
  const [pg, setPg] = React.useState(1);
  const [importing, setImporting] = React.useState(false);
  const [delConfirm, setDelConfirm] = React.useState(null);
  const PAGE_SIZE = 20;

  const saveItems = (updated) => {
    setItems(updated);
    Da.items.length = 0;
    updated.forEach(i => Da.items.push(i));
    if (window.DB) window.DB.saveItems(updated).catch(console.error);
    else localStorage.setItem(ITEMS_LS_KEY, JSON.stringify(updated));
  };

  const handleSave = (data) => {
    const isNew = !data.id;
    const saved = isNew ? { ...data, id: "it" + Date.now(), loans: 0 } : { ...data };
    const updated = isNew
      ? [...items, saved]
      : items.map(it => it.id === data.id ? { ...it, ...data } : it);
    setItems(updated);
    Da.items.length = 0; updated.forEach(i => Da.items.push(i));
    Da.toys.length  = 0; updated.filter(i => i.kind === "toy").forEach(i => Da.toys.push(i));
    Da.books.length = 0; updated.filter(i => i.kind === "book").forEach(i => Da.books.push(i));
    if (window.DB) {
      (isNew ? window.DB.insertItem(saved) : window.DB.editItem(saved))
        .catch(e => { console.error(e); alert("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง\n" + (e.message || e)); });
    } else {
      localStorage.setItem(ITEMS_LS_KEY, JSON.stringify(updated));
    }
    setEditing(null);
  };

  const handleImport = (newItems) => {
    saveItems([...items, ...newItems]);
  };

  const handleDelete = (id) => {
    const updated = items.filter(it => it.id !== id);
    setItems(updated);
    Da.items.length = 0;
    updated.forEach(i => Da.items.push(i));
    if (window.DB) window.DB.deleteItem(id).catch(console.error);
    else localStorage.setItem(ITEMS_LS_KEY, JSON.stringify(updated));
    setDelConfirm(null);
  };

  const exportExcel = async () => {
    try {
      const XLSX = await loadSheetJS();
      const headers = ["ประเภท", "ชื่อไทย", "ชื่ออังกฤษ", "รหัส", "หมวดหมู่", "ผู้แต่ง", "อายุต่ำสุด", "อายุสูงสุด", "ครั้งที่พิมพ์", "เลขหมู่", "เลขผู้แต่ง", "สถานะ", "ยืมแล้ว"];
      const rowData = items.map(it => [
        it.kind === "book" ? "book" : "toy",
        it.th || "", it.en || "", it.code || "", it.cat || "", it.author || "",
        it.ageLo != null ? it.ageLo : "", it.ageHi != null ? it.ageHi : "",
        it.edition || "", it.callNumber || "", it.cutterNumber || "",
        it.status || "ok", it.loans || 0,
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rowData]);
      ws["!cols"] = [
        { wch: 8 }, { wch: 30 }, { wch: 25 }, { wch: 14 }, { wch: 16 }, { wch: 20 },
        { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 8 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ทรัพยากร");
      XLSX.writeFile(wb, `sitoylib_items_${Da.today}.xlsx`);
    } catch (ex) {
      alert("ส่งออกไม่ได้: " + ex.message);
    }
  };

  const rows = items.filter((it) => (filter === "all" || it.kind === filter) &&
    (!q.trim() || (it.th + it.en + it.code + (it.author || "") + (it.barcode || "")).toLowerCase().includes(q.trim().toLowerCase())));

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE);

  React.useEffect(() => { setPg(1); }, [filter, q]);

  return (
    <div className="rise" style={{ padding: "26px 32px 50px", maxWidth: 1320, margin: "0 auto" }}>
      <AdminHead title="จัดการทรัพยากร" sub={`ของเล่น ${items.filter(i=>i.kind==="toy").length} · หนังสือ ${items.filter(i=>i.kind==="book").length} · รวม ${items.length} รายการ`}>
        <button className="btn btn-ghost" onClick={exportExcel}><Icon name="download" size={17} /> นำออก Excel</button>
        <button className="btn btn-soft" onClick={() => setImporting(true)}><Icon name="download" size={17} /> นำเข้า Excel</button>
        <button className="btn btn-primary" onClick={() => setEditing("new")}><Icon name="plus" size={17} /> เพิ่มรายการ</button>
      </AdminHead>

      <div className="row" style={{ gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div className="row" style={{ gap: 10, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 12, padding: "4px 4px 4px 13px", flex: "1 1 320px" }}>
          <Icon name="search" size={18} style={{ color: "var(--muted)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาตามชื่อ, รหัส, ผู้แต่ง…" style={{ flex: 1, border: "none", outline: "none", fontSize: 14.5, background: "transparent", color: "var(--ink)", padding: "8px 0" }} />
        </div>
        <div className="seg">
          {[["all", "ทั้งหมด"], ["toy", "ของเล่น"], ["book", "หนังสือ"]].map(([v, t]) => <button key={v} className={filter === v ? "active" : ""} onClick={() => setFilter(v)}>{t}</button>)}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr style={{ background: "var(--bg-2)", textAlign: "left" }}>
            {["รายการ", "รหัส / ISBN", "ประเภท", "หมวด / อายุ", "ยืมแล้ว", "สถานะ", ""].map((h) => <th key={h} style={{ padding: "12px 16px", fontWeight: 500, color: "var(--ink-2)", fontSize: 12.5 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {pageRows.map((it) => {
              const cat = Da.catLabel(it);
              return (
                <tr key={it.id} className="histrow" style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "11px 16px" }}><div className="row" style={{ gap: 11 }}>
                    <div style={{ width: 40, flex: "none" }}><ItemImage item={it} ratio="1 / 1" radius="9px" /></div>
                    <div className="stack"><span style={{ fontWeight: 500 }}>{it.th}</span><span className="en">{it.en}</span></div>
                  </div></td>
                  <td style={{ padding: "11px 16px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5, color: "var(--ink-2)" }}>{it.code}</td>
                  <td style={{ padding: "11px 16px" }}><span className="tag" style={{ fontSize: 11.5 }}>{it.kind === "toy" ? "ของเล่น" : "หนังสือ"}</span></td>
                  <td style={{ padding: "11px 16px", color: "var(--ink-2)" }}>{cat.th}{it.kind === "toy" && <div className="muted" style={{ fontSize: 12 }}>{Da.ageText(it)}</div>}</td>
                  <td style={{ padding: "11px 16px", color: "var(--ink-2)" }}>{it.loans}</td>
                  <td style={{ padding: "11px 16px" }}><StatusPill status={it.status} /></td>
                  <td style={{ padding: "11px 16px", textAlign: "right" }}>
                    <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                      {delConfirm === it.id ? (
                        <>
                          <span style={{ fontSize: 13, color: "var(--ink-2)", whiteSpace: "nowrap" }}>ลบจริงหรือ?</span>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDelConfirm(null)}>ยกเลิก</button>
                          <button className="btn btn-sm" style={{ background: "var(--over)", color: "#fff", border: "none" }} onClick={() => handleDelete(it.id)}>ลบ</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(it)}><Icon name="settings" size={14} /> แก้ไข</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--over)" }} onClick={() => setDelConfirm(it.id)}><Icon name="x" size={14} /> ลบ</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* pagination footer */}
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderTop: "1px solid var(--line)", background: "var(--bg-2)" }}>
          <span className="muted" style={{ fontSize: 13 }}>
            แสดง {rows.length === 0 ? 0 : (pg - 1) * PAGE_SIZE + 1}–{Math.min(pg * PAGE_SIZE, rows.length)} จาก {rows.length} รายการ
          </span>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPg(pg - 1)} disabled={pg === 1}>
              <Icon name="chevL" size={15} /> ก่อนหน้า
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPg(n)} style={{
                width: 34, height: 34, borderRadius: 8, border: "1px solid", fontSize: 13.5, fontWeight: 500,
                borderColor: n === pg ? "var(--brand)" : "var(--line-2)",
                background: n === pg ? "var(--brand)" : "var(--surface)",
                color: n === pg ? "#fff" : "var(--ink-2)",
              }}>{n}</button>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={() => setPg(pg + 1)} disabled={pg === totalPages}>
              ถัดไป <Icon name="chevR" size={15} />
            </button>
          </div>
        </div>
      </div>

      {editing && <EditModal item={editing === "new" ? null : editing} onSave={handleSave} onClose={() => setEditing(null)} />}
      {importing && <ImportModal onImport={handleImport} onClose={() => setImporting(false)} existingItems={items} />}
    </div>
  );
}

function EditModal({ item, onSave, onClose }) {
  const isNew = !item;
  const [form, setForm] = React.useState({
    kind: item?.kind || "toy",
    th: item?.th || "",
    en: item?.en || "",
    code: item?.code || "",
    cat: item?.cat || ((item?.kind === "book") ? Da.BOOK_CATS[0].id : Da.TOY_CATS[0].id),
    ageLo: item?.ageLo ?? 12,
    ageHi: item?.ageHi ?? 48,
    pieces: item?.pieces || "",
    author: item?.author || "",
    edition: item?.edition || "",
    publishYear: item?.publishYear || "",
    callNumber: item?.callNumber || "",
    cutterNumber: item?.cutterNumber || "",
    barcode: item?.barcode || "",
    status: item?.status || "ok",
    image: item?.image || "",
  });
  const [err, setErr] = React.useState("");
  const fileRef = React.useRef();

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErr(""); };
  const setKind = (v) => setForm(p => ({ ...p, kind: v, cat: v === "book" ? Da.BOOK_CATS[0].id : Da.TOY_CATS[0].id }));

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 480;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        setForm(p => ({ ...p, image: canvas.toDataURL("image/jpeg", 0.82) }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const save = () => {
    if (!form.th.trim()) { setErr("กรุณากรอกชื่อรายการ (ไทย)"); return; }
    if (!form.code.trim()) { setErr("กรุณากรอกรหัส/ISBN"); return; }
    onSave({ ...(item || {}), ...form, ageLo: Number(form.ageLo), ageHi: Number(form.ageHi), pieces: form.pieces || null });
  };

  return ReactDOM.createPortal(
    <div className="overlay" onClick={onClose} style={overlayStyle}>
      <div className="card rise" onClick={(e) => e.stopPropagation()} style={{ width: "min(640px,94vw)", maxHeight: "92vh", overflow: "auto", borderRadius: 22, boxShadow: "var(--shadow-lg)" }}>
        <div className="row" style={{ justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
          <h3 className="row" style={{ fontSize: 18, gap: 9 }}><Icon name={isNew ? "plus" : "settings"} size={19} /> {isNew ? "เพิ่มรายการใหม่" : "แก้ไขรายการ"}</h3>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: 24, display: "grid", gridTemplateColumns: "180px 1fr", gap: 22 }}>
          <div className="stack" style={{ gap: 10 }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
            <div onClick={() => fileRef.current?.click()} style={{ aspectRatio: "1", borderRadius: 14, overflow: "hidden", cursor: "pointer", border: "2px dashed var(--line-2)" }}>
              {form.image
                ? <img src={form.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <div className="ph" style={{ height: "100%", "--ph-c": "var(--brand)", border: "none", borderRadius: 0 }}><span className="ph-label">คลิกเพื่อเลือกรูป</span></div>}
            </div>
            <button className="btn btn-ghost btn-sm btn-block" onClick={() => fileRef.current?.click()}><Icon name="download" size={14} /> อัปโหลดรูป</button>
            {form.image && <button className="btn btn-ghost btn-sm btn-block" style={{ color: "var(--over)" }} onClick={() => setForm(p => ({ ...p, image: "" }))}>ลบรูป</button>}
          </div>
          <div className="stack" style={{ gap: 14 }}>
            <div><span className="label">ประเภท</span><div className="seg">{[["toy", "ของเล่น"], ["book", "หนังสือ"]].map(([v, t]) => <button key={v} className={form.kind === v ? "active" : ""} onClick={() => setKind(v)}>{t}</button>)}</div></div>
            <div><span className="label">ชื่อรายการ (ไทย)</span><input className="field" value={form.th} onChange={set("th")} placeholder="เช่น บล็อกไม้เรียงรูปทรง" autoFocus /></div>
            <div><span className="label">ชื่อรายการ (อังกฤษ)</span><input className="field" value={form.en} onChange={set("en")} placeholder="e.g. Wooden Shape Sorter" /></div>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}><span className="label">{form.kind === "toy" ? "รหัสของเล่น" : "ISBN"}</span><input className="field" value={form.code} onChange={set("code")} /></div>
              <div style={{ flex: 1 }}><span className="label">{form.kind === "toy" ? "ด้านพัฒนาการ" : "หมวดหมู่"}</span>
                <select className="field" value={form.cat} onChange={set("cat")}>{(form.kind === "toy" ? Da.TOY_CATS : Da.BOOK_CATS).map((c) => <option key={c.id} value={c.id}>{c.th}</option>)}</select>
              </div>
            </div>
            {form.kind === "toy" && <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}><span className="label">อายุต่ำสุด (เดือน)</span><input className="field" type="number" value={form.ageLo} onChange={set("ageLo")} /></div>
              <div style={{ flex: 1 }}><span className="label">อายุสูงสุด (เดือน)</span><input className="field" type="number" value={form.ageHi} onChange={set("ageHi")} /></div>
            </div>}
            {form.kind === "toy" && <div><span className="label">จำนวนชิ้น/ชุด</span><input className="field" value={form.pieces} onChange={set("pieces")} placeholder="เช่น 1 ชุด, 3 ชิ้น, 1 กล่อง" /></div>}
            {form.kind === "book" && <div><span className="label">ผู้แต่ง</span><input className="field" value={form.author} onChange={set("author")} /></div>}
            {form.kind === "book" && <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}><span className="label">ปีที่พิมพ์</span><input className="field" value={form.publishYear} onChange={set("publishYear")} placeholder="เช่น 2566" /></div>
              <div style={{ flex: 1 }}><span className="label">ครั้งที่พิมพ์</span><input className="field" value={form.edition} onChange={set("edition")} placeholder="เช่น พิมพ์ครั้งที่ 3" /></div>
            </div>}
            {form.kind === "book" && <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}><span className="label">เลขหมู่</span><input className="field" value={form.callNumber} onChange={set("callNumber")} placeholder="เช่น 895.913" /></div>
              <div style={{ flex: 1 }}><span className="label">เลขผู้แต่ง</span><input className="field" value={form.cutterNumber} onChange={set("cutterNumber")} placeholder="เช่น ส732ห" /></div>
            </div>}
            {form.kind === "book" && <div><span className="label">Barcode ห้องสมุด</span><input className="field" value={form.barcode} onChange={set("barcode")} placeholder="สแกนหรือพิมพ์ barcode" /></div>}
            <div><span className="label">สถานะ</span>
              <select className="field" value={form.status} onChange={set("status")}>
                {Object.entries(STATUS_MAP).filter(([k]) => k !== "reserved").map(([k, v]) => <option key={k} value={k}>{v.th}</option>)}
              </select>
            </div>
            {err && <div className="row" style={{ gap: 8, padding: "10px 13px", background: "var(--over-soft)", borderRadius: 10, color: "var(--over)", fontSize: 13.5 }}><Icon name="flag" size={16} /> {err}</div>}
          </div>
        </div>
        <div className="row" style={{ justifyContent: "flex-end", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--line)" }}>
          <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={save}><Icon name="check" size={17} /> บันทึก</button>
        </div>
      </div>
    </div>
  , document.body);
}

/* ========================================================== */
/*  MEMBERS                                                    */
/* ========================================================== */
const MEMBERS_LS_KEY = "stl_members_v1";

function AdminMembers() {
  const [members, setMembers] = React.useState(() => {
    if (!window.DB) {
      try {
        const s = localStorage.getItem(MEMBERS_LS_KEY);
        if (s) return JSON.parse(s);
      } catch {}
    }
    return [...Da.members];
  });
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState(null);

  const persist = (updated) => {
    setMembers(updated);
    Da.members.length = 0;
    updated.forEach((m) => Da.members.push(m));
    if (window.DB) window.DB.saveMembers(updated).catch(console.error);
    else localStorage.setItem(MEMBERS_LS_KEY, JSON.stringify(updated));
  };

  const handleSave = (data) => {
    const updated = data.id
      ? members.map((m) => m.id === data.id ? { ...m, ...data } : m)
      : [...members, { ...data, id: "M" + Date.now(), history: 0 }];
    persist(updated);
    setEditing(null);
  };

  const handleDelete = (m) => {
    const active = Da.loans.filter((l) => l.member === m.id).length;
    if (active > 0) { alert(`ไม่สามารถลบได้ — ${m.name} ยังมีของที่ยืมอยู่ ${active} รายการ`); return; }
    if (!window.confirm(`ลบสมาชิก "${m.name}" ออกจากระบบ?\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) return;
    const updated = members.filter((x) => x.id !== m.id);
    persist(updated);
    if (window.DB) window.DB.deleteMember(m.id).catch((e) => alert("ลบไม่สำเร็จ: " + (e.message || e)));
  };

  const rows = members.filter((m) =>
    !q.trim() || (m.name + m.code + (m.phone || "") + (m.child || "")).toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="rise" style={{ padding: "26px 32px 50px", maxWidth: 1320, margin: "0 auto" }}>
      <AdminHead title="ทะเบียนสมาชิก" sub={`สมาชิกทั้งหมด ${members.length} ราย`}>
        <button className="btn btn-primary" onClick={() => setEditing("new")}><Icon name="plus" size={17} /> ลงทะเบียนสมาชิก</button>
      </AdminHead>

      <div className="row" style={{ gap: 14, marginBottom: 18 }}>
        <div className="row" style={{ gap: 10, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 12, padding: "4px 4px 4px 13px", flex: "1 1 320px" }}>
          <Icon name="search" size={18} style={{ color: "var(--muted)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาตามชื่อ, รหัสสมาชิก, เบอร์โทร…" style={{ flex: 1, border: "none", outline: "none", fontSize: 14.5, background: "transparent", color: "var(--ink)", padding: "8px 0" }} />
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr style={{ background: "var(--bg-2)", textAlign: "left" }}>
            {["สมาชิก", "รหัส", "เบอร์โทร", "ชื่อเด็ก", "ยืมสะสม", "กำลังยืม", ""].map((h) => (
              <th key={h} style={{ padding: "12px 16px", fontWeight: 500, color: "var(--ink-2)", fontSize: 12.5 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map((m) => {
              const active = Da.loans.filter((l) => l.member === m.id).length;
              return (
                <tr key={m.id} className="histrow" style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "13px 16px" }}>
                    <div className="row" style={{ gap: 11 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--brand)", color: "#fff", display: "grid", placeItems: "center", flex: "none" }}>
                        <Icon name="user" size={17} />
                      </div>
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5, color: "var(--ink-2)" }}>{m.code}</td>
                  <td style={{ padding: "13px 16px", color: "var(--ink-2)" }}>{m.phone || "–"}</td>
                  <td style={{ padding: "13px 16px", color: "var(--ink-2)" }}>{m.child || "–"}</td>
                  <td style={{ padding: "13px 16px", color: "var(--ink-2)" }}>{m.history}</td>
                  <td style={{ padding: "13px 16px" }}>
                    {active > 0
                      ? <span className="pill ok"><span className="dot"></span>{active} รายการ</span>
                      : <span className="muted" style={{ fontSize: 13 }}>ไม่มี</span>}
                  </td>
                  <td style={{ padding: "13px 16px", textAlign: "right" }}>
                    <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(m)}><Icon name="settings" size={14} /> แก้ไข</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: "var(--over)" }} onClick={() => handleDelete(m)}><Icon name="x" size={14} /> ลบ</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={7}><Empty icon="user" title="ไม่พบสมาชิก" sub="ลองเปลี่ยนคำค้นหา" /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <MemberModal
          member={editing === "new" ? null : editing}
          members={members}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function MemberModal({ member, members, onSave, onClose }) {
  const isNew = !member;
  const nextCode = (() => {
    const nums = members.map((m) => parseInt(m.code.replace(/\D/g, "")) || 0);
    return "MEM-" + String(Math.max(...nums, 0) + 1).padStart(4, "0");
  })();

  const [form, setForm] = React.useState({
    name: member?.name || "",
    code: member?.code || nextCode,
    phone: member?.phone || "",
    child: member?.child || "",
    ageMo: member?.ageMo != null ? String(member.ageMo) : "",
    note: member?.note || "",
  });
  const [err, setErr] = React.useState("");

  const set = (k) => (e) => { setForm((prev) => ({ ...prev, [k]: e.target.value })); setErr(""); };

  const save = () => {
    if (!form.name.trim()) { setErr("กรุณากรอกชื่อ-นามสกุล"); return; }
    if (!form.code.trim()) { setErr("กรุณากรอกรหัสสมาชิก"); return; }
    onSave({ ...(member || {}), ...form, ageMo: form.ageMo ? parseInt(form.ageMo) : undefined });
  };

  return ReactDOM.createPortal(
    <div className="overlay" onClick={onClose} style={overlayStyle}>
      <div className="card rise" onClick={(e) => e.stopPropagation()} style={{ width: "min(520px,94vw)", maxHeight: "92vh", overflow: "auto", borderRadius: 22, boxShadow: "var(--shadow-lg)" }}>
        <div className="row" style={{ justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
          <h3 className="row" style={{ fontSize: 18, gap: 9 }}>
            <Icon name={isNew ? "plus" : "settings"} size={19} /> {isNew ? "ลงทะเบียนสมาชิกใหม่" : "แก้ไขข้อมูลสมาชิก"}
          </h3>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={18} /></button>
        </div>
        <div className="stack" style={{ padding: 24, gap: 14 }}>
          <div>
            <span className="label">ชื่อ-นามสกุล (ผู้ปกครอง)</span>
            <input className="field" value={form.name} onChange={set("name")} placeholder="เช่น คุณสมศรี ใจดี" autoFocus />
          </div>
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <span className="label">รหัสสมาชิก</span>
              <input className="field" value={form.code} onChange={set("code")} style={{ fontFamily: "'IBM Plex Mono',monospace" }} />
            </div>
            <div style={{ flex: 1 }}>
              <span className="label">เบอร์โทรศัพท์</span>
              <input className="field" value={form.phone} onChange={set("phone")} placeholder="0x-xxxx-xxxx" />
            </div>
          </div>
          <div>
            <span className="label">ชื่อเด็ก / บุตรหลาน</span>
            <input className="field" value={form.child} onChange={set("child")} placeholder="เช่น น้องมีน" />
          </div>
          <div>
            <span className="label">อายุเด็ก (เดือน)</span>
            <input className="field" type="number" min={0} value={form.ageMo} onChange={set("ageMo")} placeholder="เช่น 24" />
          </div>
          <div>
            <span className="label">หมายเหตุ</span>
            <input className="field" value={form.note} onChange={set("note")} placeholder="(ถ้ามี)" />
          </div>
          {err && (
            <div className="row" style={{ gap: 8, padding: "10px 13px", background: "var(--over-soft)", borderRadius: 10, color: "var(--over)", fontSize: 13.5 }}>
              <Icon name="flag" size={16} /> {err}
            </div>
          )}
        </div>
        <div className="row" style={{ justifyContent: "flex-end", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--line)" }}>
          <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={save}><Icon name="check" size={17} /> {isNew ? "ลงทะเบียน" : "บันทึก"}</button>
        </div>
      </div>
    </div>
  , document.body);
}

/* ========================================================== */
/*  IMPORT MODAL                                               */
/* ========================================================== */
function ImportModal({ onImport, onClose, existingItems }) {
  const [step, setStep] = React.useState("pick");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [parsed, setParsed] = React.useState(null);
  const [skipDups, setSkipDups] = React.useState(true);
  const fileRef = React.useRef();
  const existingCodes = React.useMemo(
    () => new Set(existingItems.map(i => i.code).filter(Boolean)),
    [existingItems]
  );

  const processRows = (rows) => {
    const items = sheetRowsToItems(rows, existingCodes);
    if (!items.length) { setErr("ไม่พบข้อมูล หรือไม่มีคอลัมน์ 'ชื่อไทย' ในไฟล์"); setLoading(false); return; }
    setParsed(items);
    setStep("preview");
    setLoading(false);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setErr("");
    setLoading(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'csv') {
        processRows(parseCSVText(await file.text()));
      } else {
        const XLSX = await loadSheetJS();
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        processRows(XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }).map(r => r.map(String)));
      }
    } catch (ex) {
      setErr("ไม่สามารถอ่านไฟล์: " + ex.message);
      setLoading(false);
    }
  };

  const doImport = () => {
    const toAdd = (skipDups ? parsed.filter(i => !i._dup) : parsed).map(({ _dup, ...i }) => i);
    onImport(toAdd);
    setStep("done");
  };

  const downloadTemplate = () => {
    const rows = [
      ["ประเภท", "ชื่อไทย", "ชื่ออังกฤษ", "รหัส", "หมวดหมู่", "ผู้แต่ง", "อายุต่ำสุด", "อายุสูงสุด", "ครั้งที่พิมพ์", "เลขหมู่", "เลขผู้แต่ง", "สถานะ"],
      ["toy", "บล็อกไม้เรียงรูปทรง", "Wooden Shape Sorter", "TOY-001", "motor", "", "12", "48", "", "", "", "ok"],
      ["book", "หนังสือนิทานกระต่าย", "Bunny Tales", "978-0000000001", "fiction", "Jane Doe", "", "", "พิมพ์ครั้งที่ 1", "895.91", "ด456ห", "ok"],
    ];
    const csv = "﻿" + rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "template_items.csv";
    a.click();
  };

  const toImportCount = parsed ? (skipDups ? parsed.filter(i => !i._dup).length : parsed.length) : 0;
  const dupCount = parsed ? parsed.filter(i => i._dup).length : 0;

  return ReactDOM.createPortal(
    <div className="overlay" onClick={onClose} style={overlayStyle}>
      <div className="card rise" onClick={e => e.stopPropagation()} style={{ width: "min(720px,96vw)", maxHeight: "92vh", overflow: "auto", borderRadius: 22, boxShadow: "var(--shadow-lg)" }}>
        <div className="row" style={{ justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
          <h3 className="row" style={{ fontSize: 18, gap: 9 }}><Icon name="download" size={19} /> นำเข้าจาก Excel / CSV</h3>
          <button onClick={onClose} style={iconBtnStyle}><Icon name="x" size={18} /></button>
        </div>

        {step === "pick" && (
          <div className="stack" style={{ padding: 28, gap: 20 }}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.ods" style={{ display: "none" }} onChange={handleFile} />
            <div onClick={() => !loading && fileRef.current?.click()} style={{ border: "2px dashed var(--line-2)", borderRadius: 16, padding: "42px 28px", textAlign: "center", cursor: loading ? "default" : "pointer" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--brand-soft)", display: "grid", placeItems: "center", margin: "0 auto 14px", color: "var(--brand)" }}>
                {loading
                  ? <span style={{ width: 26, height: 26, borderRadius: 999, border: "3px solid var(--brand-soft-2)", borderTopColor: "var(--brand)", animation: "spin .7s linear infinite", display: "block" }}></span>
                  : <Icon name="download" size={26} />}
              </div>
              <h4 style={{ fontSize: 16, marginBottom: 6 }}>{loading ? "กำลังวิเคราะห์ไฟล์…" : "คลิกเพื่อเลือกไฟล์"}</h4>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>รองรับ .xlsx · .xls · .csv<br/>สำหรับ Google Sheets: ไฟล์ → ดาวน์โหลด → ค่าที่คั่นด้วยจุลภาค (.csv)</p>
            </div>
            {err && <div className="row" style={{ gap: 8, padding: "11px 14px", background: "var(--over-soft)", borderRadius: 10, color: "var(--over)", fontSize: 13.5 }}><Icon name="flag" size={16} />{err}</div>}
            <div className="card" style={{ padding: 15, background: "var(--bg-2)", border: "none" }}>
              <h4 className="row" style={{ fontSize: 13.5, gap: 7, marginBottom: 8, color: "var(--ink-2)" }}><Icon name="list" size={14} /> หัวตารางที่รองรับ (แถวแรกของไฟล์)</h4>
              <div className="row" style={{ flexWrap: "wrap", gap: 5 }}>
                {["ประเภท", "ชื่อไทย", "ชื่ออังกฤษ", "รหัส", "หมวดหมู่", "ผู้แต่ง", "อายุต่ำสุด", "อายุสูงสุด", "ครั้งที่พิมพ์", "เลขหมู่", "เลขผู้แต่ง", "สถานะ"].map(h =>
                  <code key={h} style={{ background: "var(--surface)", padding: "2px 7px", borderRadius: 5, fontSize: 12, border: "1px solid var(--line)" }}>{h}</code>
                )}
              </div>
              <p className="muted" style={{ margin: "10px 0 0", fontSize: 12.5 }}>ค่า <strong>ประเภท</strong>: <code style={{ fontSize: 12 }}>toy</code> หรือ <code style={{ fontSize: 12 }}>book</code> · <strong>สถานะ</strong>: <code style={{ fontSize: 12 }}>ok</code> / <code style={{ fontSize: 12 }}>busy</code> / <code style={{ fontSize: 12 }}>fix</code></p>
            </div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={downloadTemplate}><Icon name="download" size={14} /> ดาวน์โหลด Template CSV</button>
            </div>
          </div>
        )}

        {step === "preview" && parsed && (
          <div className="stack" style={{ gap: 0 }}>
            <div className="row" style={{ gap: 14, padding: "14px 22px", background: "var(--bg-2)", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
              <span className="row" style={{ gap: 7, color: "var(--ok)", fontWeight: 500, fontSize: 14 }}><Icon name="check" size={17} /> พบ {parsed.length} รายการ</span>
              {dupCount > 0 && <span className="row" style={{ gap: 7, color: "var(--sun)", fontSize: 13.5 }}><Icon name="flag" size={15} /> รหัสซ้ำ {dupCount} รายการ</span>}
              <label className="row" style={{ marginLeft: "auto", gap: 7, fontSize: 13.5, cursor: "pointer" }}>
                <input type="checkbox" checked={skipDups} onChange={e => setSkipDups(e.target.checked)} style={{ accentColor: "var(--brand)" }} />
                ข้ามรายการที่รหัสซ้ำ
              </label>
            </div>
            <div style={{ overflow: "auto", maxHeight: 360 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg-2)" }}>
                    {["", "ประเภท", "ชื่อไทย", "รหัส", "หมวด / ด้านพัฒนาการ", "ผู้แต่ง", "สถานะ"].map(h =>
                      <th key={h} style={{ padding: "9px 12px", fontWeight: 500, color: "var(--ink-2)", textAlign: "left", borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((it, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--line)", opacity: skipDups && it._dup ? 0.4 : 1, background: it._dup ? "color-mix(in srgb, var(--sun) 7%, transparent)" : "transparent" }}>
                      <td style={{ padding: "8px 12px" }}>
                        {it._dup
                          ? <span className="pill warn" style={{ fontSize: 11 }}>ซ้ำ</span>
                          : <span style={{ color: "var(--ok)", display: "flex", justifyContent: "center" }}><Icon name="check" size={15} /></span>}
                      </td>
                      <td style={{ padding: "8px 12px" }}><span className="tag" style={{ fontSize: 11 }}>{it.kind === "book" ? "หนังสือ" : "ของเล่น"}</span></td>
                      <td style={{ padding: "8px 12px" }}><span style={{ fontWeight: 500 }}>{it.th}</span>{it.en && <div className="muted" style={{ fontSize: 11 }}>{it.en}</div>}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, color: "var(--ink-2)" }}>{it.code || "–"}</td>
                      <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{it.cat || "–"}</td>
                      <td style={{ padding: "8px 12px", color: "var(--ink-2)" }}>{it.author || "–"}</td>
                      <td style={{ padding: "8px 12px" }}><StatusPill status={it.status || "ok"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row" style={{ justifyContent: "space-between", padding: "16px 22px", borderTop: "1px solid var(--line)" }}>
              <button className="btn btn-ghost" onClick={() => { setParsed(null); setStep("pick"); setErr(""); }}>
                <Icon name="chevL" size={15} /> เลือกไฟล์ใหม่
              </button>
              <button className="btn btn-primary" onClick={doImport} disabled={toImportCount === 0}>
                <Icon name="check" size={17} /> นำเข้า {toImportCount} รายการ
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="stack" style={{ padding: "52px 28px", alignItems: "center", gap: 16, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "color-mix(in srgb, var(--ok) 15%, #fff)", display: "grid", placeItems: "center", color: "var(--ok)" }}>
              <Icon name="check" size={32} />
            </div>
            <h3 style={{ fontSize: 20 }}>นำเข้าสำเร็จ!</h3>
            <p className="muted" style={{ margin: 0 }}>เพิ่มรายการเข้าสู่ระบบเรียบร้อยแล้ว</p>
            <button className="btn btn-primary" onClick={onClose}>ปิด</button>
          </div>
        )}
      </div>
    </div>
  , document.body);
}

Object.assign(window, { AdminApp, AdminDash, AdminManage, AdminHead });
