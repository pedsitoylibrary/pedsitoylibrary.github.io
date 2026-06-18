/* ============================================================
   Siriraj Toy Library — Root app (role switch · theme · tweaks)
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "warm",
  "font": "mitr",
  "rounded": true
} /*EDITMODE-END*/;

const LS = {
  get(k, d) {try {const v = localStorage.getItem(k);return v == null ? d : JSON.parse(v);} catch {return d;}},
  set(k, v) {try {localStorage.setItem(k, JSON.stringify(v));} catch {}}
};

const STAFF_USERS = [
  { username: "sitoylib",    password: "10042915", displayName: "จีรวัฒน์", title: "บรรณารักษ์",     staffId: "STAFF-007" },
  { username: "sawalee.sas", password: "@Noon1930", displayName: "สวลี",    title: "นักของเล่นบำบัด", staffId: "STAFF-008" },
];

function AdminLogin({ onLogin }) {
  const [user, setUser] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [err, setErr] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const submit = () => {
    const found = STAFF_USERS.find(u => u.username === user.trim() && u.password === pass.trim());
    if (!found) { setErr(true); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(found); }, 700);
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <div className="rise card" style={{ width: "min(440px, 92vw)", padding: "44px 40px", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="stack" style={{ alignItems: "center", gap: 14 }}>
          <img src="logo.png" alt="Siriraj Toy Library" style={{ height: 72, objectFit: "contain" }} />
          <div className="stack" style={{ alignItems: "center", gap: 4 }}>
            <h2 style={{ fontSize: 22 }}>เข้าสู่ระบบบรรณารักษ์</h2>
            <span className="muted" style={{ fontSize: 14 }}>Librarian Login</span>
          </div>
        </div>
        <div className="stack" style={{ gap: 14 }}>
          <div>
            <label className="label">ชื่อผู้ใช้</label>
            <input className="field" value={user} onChange={e => { setUser(e.target.value); setErr(false); }}
              placeholder="username" onKeyDown={e => e.key === "Enter" && submit()} autoFocus />
          </div>
          <div>
            <label className="label">รหัสผ่าน</label>
            <input className="field" type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(false); }}
              placeholder="password" onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          {err && (
            <div className="row" style={{ gap: 8, padding: "10px 13px", background: "var(--over-soft)", borderRadius: 10, color: "var(--over)", fontSize: 13.5 }}>
              <Icon name="flag" size={16} /> กรุณากรอกชื่อผู้ใช้และรหัสผ่าน
            </div>
          )}
          <button className="btn btn-primary btn-lg btn-block" onClick={submit} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? (
              <span className="row" style={{ gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: 999, border: "2.5px solid rgba(255,255,255,.35)", borderTopColor: "#fff", animation: "spin .7s linear infinite", display: "block" }}></span>
                กำลังเข้าสู่ระบบ…
              </span>
            ) : (
              <><Icon name="arrowR" size={18} /> เข้าสู่ระบบ</>
            )}
          </button>
        </div>
        <p className="muted" style={{ fontSize: 12.5, textAlign: "center", margin: 0 }}>สำหรับเจ้าหน้าที่ห้องสมุดเท่านั้น · ผู้ปกครอง/สมาชิกไม่ต้องล็อกอิน</p>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [role, setRole] = React.useState(() => LS.get("stl_role", "member"));
  const [mpage, setMpage] = React.useState(() => LS.get("stl_mpage", "home"));
  const [seed, setSeed] = React.useState(null);
  const [detail, setDetail] = React.useState(null);
  const [adminAuth, setAdminAuth] = React.useState(() => {
    const stored = LS.get("stl_admin_auth", null);
    if (!stored) return null;
    if (stored === true) return STAFF_USERS[0];
    if (stored && stored.username) return stored;
    return null;
  });
  const [dbReady, setDbReady] = React.useState(() => !window.DB);

  React.useEffect(() => LS.set("stl_role", role), [role]);
  React.useEffect(() => LS.set("stl_mpage", mpage), [mpage]);
  React.useEffect(() => LS.set("stl_admin_auth", adminAuth), [adminAuth]);

  // load data from Supabase before first render
  React.useEffect(() => {
    if (!window.DB) return;
    window.DB.loadAll().then(() => setDbReady(true)).catch(() => setDbReady(true));
  }, []);

  // apply theme + font + radius to <html>
  React.useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-theme", t.theme);
    el.setAttribute("data-font", t.font);
    el.style.setProperty("--radius", t.rounded ? "16px" : "8px");
    el.style.setProperty("--radius-sm", t.rounded ? "10px" : "6px");
    el.style.setProperty("--radius-lg", t.rounded ? "24px" : "12px");
  }, [t.theme, t.font, t.rounded]);

  if (!dbReady) return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg, #f7f7f5)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e0e0e0", borderTopColor: "#1f9c8f", animation: "spin .8s linear infinite", display: "block" }}></span>
        <span style={{ color: "#888", fontSize: 15 }}>กำลังโหลดข้อมูล…</span>
      </div>
    </div>
  );

  const openItem = (it) => setDetail(it);

  const memberPages = {
    home: <MemberHome setPage={setMpage} openItem={openItem} setBrowseSeed={setSeed} />,
    browse: <MemberBrowse openItem={openItem} seed={seed} clearSeed={() => setSeed(null)} />,
    recommend: <MemberRecommend openItem={openItem} seed={seed} clearSeed={() => setSeed(null)} />,
    history: <MemberHistory openItem={openItem} />
  };

  return (
    <div>
      {/* ---- app body ---- */}
      {role === "member" ?
      <div>
          <MemberNav page={mpage} setPage={setMpage} />
          {memberPages[mpage]}
          <footer style={{ borderTop: "1px solid var(--line)", background: "var(--surface)", padding: "30px 28px", marginTop: 10 }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <Logo />
              <span className="muted" style={{ fontSize: 13 }}>อาคารศรีสังวาลย์ ชั้น 3 หรือ โทร 0-2419-9849</span>
              <div className="row" style={{ gap: 20 }}>
                <span className="muted" style={{ fontSize: 12.5 }}>© 2569 คณะแพทยศาสตร์ศิริราชพยาบาล</span>
                <button onClick={() => setRole("admin")} style={{ background: "none", border: "none", padding: 0, fontSize: 12.5, color: "var(--muted)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  สำหรับบรรณารักษ์
                </button>
              </div>
            </div>
          </footer>
        </div>
      : adminAuth
        ? <AdminApp openItem={openItem} adminUser={adminAuth} onLogout={() => { setAdminAuth(null); setRole("member"); }} />
        : <AdminLogin onLogin={(u) => setAdminAuth(u)} />
      }

      {/* ---- shared detail modal ---- */}
      {detail && <ItemDetail item={detail} onClose={() => setDetail(null)} />}

      {/* ---- tweaks ---- */}
      <TweaksPanel>
        <TweakSection label="ธีมสี / Color theme" />
        <ThemeSwatches value={t.theme} onChange={(v) => setTweak("theme", v)} />
        <TweakSelect label="ชุดสี" value={t.theme}
        options={[{ value: "warm", label: "เทอร์ควอยซ์อุ่น" }, { value: "siriraj", label: "เขียวศิริราช" }, { value: "coral", label: "คอรัล" }, { value: "pastel", label: "พาสเทล" }]}
        onChange={(v) => setTweak("theme", v)} />
        <TweakSection label="ตัวอักษร / Typeface" />
        <TweakRadio label="คู่ฟอนต์" value={t.font}
        options={[{ value: "mitr", label: "Mitr" }, { value: "prompt", label: "Prompt" }, { value: "anuphan", label: "Anuphan" }]}
        onChange={(v) => setTweak("font", v)} />
        <TweakSection label="สไตล์ / Style" />
        <TweakToggle label="มุมโค้งมน" value={t.rounded} onChange={(v) => setTweak("rounded", v)} />
      </TweaksPanel>
    </div>);

}

/* visual swatch row under the theme radio */
function ThemeSwatches({ value, onChange }) {
  const themes = {
    warm: ["#1f9c8f", "#f1795a", "#f4b740"],
    siriraj: ["#1d7a4d", "#e08a2b", "#e8b13b"],
    coral: ["#ed6a52", "#2aa79b", "#f3b53f"],
    pastel: ["#6aa7c4", "#e89bb0", "#f0cf86"]
  };
  return (
    <div style={{ display: "flex", gap: 8, padding: "2px 2px 6px" }}>
      {Object.entries(themes).map(([k, cols]) =>
      <button key={k} onClick={() => onChange(k)} title={k} style={{
        flex: 1, display: "flex", gap: 0, borderRadius: 9, overflow: "hidden", height: 26, cursor: "pointer",
        border: value === k ? "2px solid var(--ink)" : "2px solid var(--line-2)", padding: 0
      }}>
          {cols.map((c, i) => <span key={i} style={{ flex: 1, background: c }}></span>)}
        </button>
      )}
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);