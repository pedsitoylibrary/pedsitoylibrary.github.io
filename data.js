/* ============================================================
   Siriraj Toy Library — initial data (window.DATA)
   ============================================================ */
(function () {
  // ---- taxonomy ----
  const TOY_CATS = [
    { id: "fine",    th: "พัฒนากล้ามเนื้อมัดเล็ก", en: "Fine Motor",   c: "#1f9c8f" },
    { id: "gross",   th: "พัฒนากล้ามเนื้อมัดใหญ่", en: "Gross Motor",  c: "#f1795a" },
    { id: "sensory", th: "ฝึกประสาทสัมผัส",        en: "Sensory",      c: "#4a7fc0" },
    { id: "percept", th: "การรับรู้และบูรณาการ",    en: "Perception & Integration", c: "#caa23a" },
  ];
  const BOOK_CATS = [
    { id: "picture", th: "หนังสือภาพสำหรับเด็ก", en: "Picture Books" },
    { id: "general", th: "ความรู้ทั่วไป",        en: "General Knowledge" },
    { id: "cook",    th: "ตำราอาหาร",            en: "Cookbooks" },
    { id: "lit",     th: "วรรณกรรม",            en: "Literature" },
    { id: "art",     th: "ศิลปะ",               en: "Art" },
    { id: "sci",     th: "วิทยาศาสตร์",          en: "Science" },
    { id: "foreign", th: "ภาษาต่างประเทศ",       en: "Foreign Language" },
  ];
  const AGE_BANDS = [
    { id: "0-1",  th: "แรกเกิด–1 ปี",  en: "0–1 yr",  lo: 0,  hi: 12 },
    { id: "1-2",  th: "1–2 ปี",        en: "1–2 yr",  lo: 12, hi: 24 },
    { id: "2-3",  th: "2–3 ปี",        en: "2–3 yr",  lo: 24, hi: 36 },
    { id: "3-5",  th: "3–5 ปี",        en: "3–5 yr",  lo: 36, hi: 60 },
    { id: "5-8",  th: "5–8 ปี",        en: "5–8 yr",  lo: 60, hi: 96 },
  ];

  // status: ok (ว่าง) | busy (ถูกยืม) | reserved (จองแล้ว) | fix (ซ่อมบำรุง)
  const T = (id, code, th, en, cat, ageLo, ageHi) =>
    ({ kind: "toy", id, code, th, en, cat, ageLo, ageHi, status: "ok", loans: 0 });

  const toys = [
    T("t01","TOY-1042","บล็อกไม้เรียงรูปทรง","Wooden Shape Sorter","fine",12,36),
    T("t02","TOY-1043","ลูกปัดร้อยเชือก","Lacing Beads Set","fine",24,60),
    T("t03","TOY-1044","ชุดหมุดเสียบกระดาน","Pegboard Buttons","fine",24,48),
    T("t04","TOY-1051","รถลากผลักเดิน","Push & Pull Walker","gross",10,24),
    T("t05","TOY-1052","บันไดทรงตัวไม้","Wooden Balance Beam","gross",36,84),
    T("t06","TOY-1053","ห่วงโยนเป้าหมาย","Ring Toss Game","gross",36,96),
    T("t07","TOY-1061","กล่องสัมผัสพื้นผิว","Texture Touch Box","sensory",6,24),
    T("t08","TOY-1062","ขวดน้ำประกายแสง","Sensory Glitter Bottles","sensory",6,36),
    T("t09","TOY-1063","ลูกบอลนุ่มหลายผิวสัมผัส","Soft Sensory Balls","sensory",0,18),
    T("t10","TOY-1071","จิ๊กซอว์ไม้สัตว์โลก","Animal Wooden Puzzle","percept",24,60),
    T("t11","TOY-1072","ชุดจับคู่อารมณ์","Emotion Matching Cards","percept",36,84),
    T("t12","TOY-1073","เกมเรียงลำดับเหตุการณ์","Sequencing Story Tiles","percept",48,96),
    T("t13","TOY-1045","แป้นหมุนเฟืองสีสด","Colorful Gear Spinner","fine",18,48),
    T("t14","TOY-1054","อุโมงค์คลานผ้า","Crawl-Through Tunnel","gross",12,48),
    T("t15","TOY-1064","กลองมือจังหวะ","Hand Drum & Rhythm","sensory",12,60),
    T("t16","TOY-1074","นาฬิกาไม้เรียนรู้เวลา","Wooden Learning Clock","percept",48,96),
  ];

  const B = (id, isbn, th, en, author, cat) =>
    ({ kind: "book", id, code: isbn, th, en, author, cat, status: "ok", loans: 0 });

  const books = [
    B("b01","978-616-7-001","กระต่ายน้อยหลับฝันดี","Little Bunny's Goodnight","ปาริชาต ม.","picture"),
    B("b02","978-616-7-002","ผจญภัยในป่าใหญ่","Adventure in the Big Forest","สมชาย ก.","picture"),
    B("b03","978-616-7-010","ร่างกายของเรามหัศจรรย์","Our Amazing Body","ดร.วิภา ส.","sci"),
    B("b04","978-616-7-011","ทำไมท้องฟ้าเป็นสีฟ้า","Why Is the Sky Blue?","ดร.วิภา ส.","sci"),
    B("b05","978-616-7-020","เมนูอาหารเด็กเล็ก","Healthy Meals for Toddlers","เชฟแอน","cook"),
    B("b06","978-616-7-030","นิทานอีสปสองภาษา","Aesop's Fables (Bilingual)","แปล: ก.","foreign"),
    B("b07","978-616-7-040","โลกของสีและรูปทรง","World of Colors & Shapes","มานี ว.","art"),
    B("b08","978-616-7-050","สารพันความรู้รอบตัว","Everyday Knowledge for Kids","คณะผู้เขียน","general"),
    B("b09","978-616-7-060","เจ้าชายน้อย","The Little Prince","Saint-Exupéry","lit"),
    B("b10","978-616-7-061","บ้านเล็กในป่าใหญ่","Little House in the Big Woods","L.I. Wilder","lit"),
    B("b11","978-616-7-003","ช้างน้อยหัดนับเลข","Baby Elephant Counts","พิมพ์ใจ","picture"),
    B("b12","978-616-7-031","First English Words","First English Words","Oxford Kids","foreign"),
  ];

  // ---- physical copies (ฉบับ/เล่มจริง) — MARC21-style holdings ----
  // 1 ชื่อเรื่อง (bibliographic) มีได้หลายเล่มจริง (item/holding) — แยก barcode + สถานะรายเล่ม
  const COPY_COUNTS = { b01: 3, b03: 2, t01: 2 };  // demo: หนังสือ/ของเล่นที่มีหลายเล่ม
  [...toys, ...books].forEach((it) => {
    const n = COPY_COUNTS[it.id] || 1;
    const word = it.kind === "toy" ? "ชิ้น" : "เล่ม";
    it.copies = Array.from({ length: n }, (_, i) => ({
      id: `${it.id}-c${i + 1}`, itemId: it.id,
      barcode: "", label: `${word}ที่ ${i + 1}`,
      status: it.status || "ok", due: it.due || null, note: "", loans: 0,
    }));
  });

  // ---- members ----
  const members = [
    { id: "m01", code: "MEM-0231", name: "คุณนภัสสร ใจดี",   child: "น้องปริม", childAgeMo: 30, phone: "08x-xxx-1234", active: 0, history: 0 },
    { id: "m02", code: "MEM-0232", name: "คุณธีรพงษ์ ศรีสุข", child: "น้องโตโต้", childAgeMo: 48, phone: "08x-xxx-5678", active: 0, history: 0 },
    { id: "m03", code: "MEM-0233", name: "คุณกมลชนก พรหม",  child: "น้องเอย่า", childAgeMo: 14, phone: "08x-xxx-9012", active: 0, history: 0 },
    { id: "m04", code: "MEM-0234", name: "คุณวิชัย มั่นคง",   child: "น้องข้าวปั้น", childAgeMo: 66, phone: "08x-xxx-3456", active: 0, history: 0 },
    { id: "m05", code: "MEM-0235", name: "คุณอรุณี แสงทอง",  child: "น้องมินนี่", childAgeMo: 22, phone: "08x-xxx-7890", active: 0, history: 0 },
  ];

  // ---- active loans / transactions ----
  const loans = [];

  // recent activity (for admin dashboard)
  const activity = [];

  // member borrowing history (for member view)
  const myHistory = [];

  // ---- borrowing rules ----
  const rules = {
    maxToys: 3, maxBooks: 3, days: 14, renewals: 1, finePerDay: 5,
  };

  // ---- monthly stats ----
  const monthly = [
    { m: "ม.ค.", borrow: 0, ret: 0 },
    { m: "ก.พ.", borrow: 0, ret: 0 },
    { m: "มี.ค.", borrow: 0, ret: 0 },
    { m: "เม.ย.", borrow: 0, ret: 0 },
    { m: "พ.ค.", borrow: 0, ret: 0 },
    { m: "มิ.ย.", borrow: 0, ret: 0 },
  ];

  window.DATA = {
    TOY_CATS, BOOK_CATS, AGE_BANDS,
    toys, books, members, loans, activity, myHistory, rules, monthly,
    items: [...toys, ...books],
    currentMember: members[0],
    today: new Date().toISOString().slice(0, 10),
  };

  // helpers
  window.DATA.itemById = (id) => window.DATA.items.find((x) => x.id === id);
  window.DATA.catLabel = (item) => {
    const list = item.kind === "toy" ? TOY_CATS : BOOK_CATS;
    return list.find((c) => c.id === item.cat) || { th: "อื่นๆ", en: "Other", c: "#999" };
  };
  window.DATA.ageText = (item) => {
    if (item.kind !== "toy") return null;
    const f = (mo) => (mo % 12 === 0 ? `${mo / 12} ปี` : `${mo} ด.`);
    return `${f(item.ageLo)} – ${f(item.ageHi)}`;
  };

  /* ---- copies (ฉบับ/เล่มจริง) helpers ---- */
  // ทำให้ทุก item มี copies เสมอ (สำหรับข้อมูลเก่าที่ยังไม่มีเล่ม)
  window.DATA.ensureCopies = (it) => {
    if (!Array.isArray(it.copies) || it.copies.length === 0) {
      const word = it.kind === "toy" ? "ชิ้น" : "เล่ม";
      it.copies = [{
        id: it.id + "-c1", itemId: it.id,
        barcode: it.barcode || "", label: `${word}ที่ 1`,
        status: it.status || "ok", due: it.due || null, note: "",
        loans: it.loans || 0,
      }];
    } else {
      it.copies.forEach((c) => { if (!c.itemId) c.itemId = it.id; });
    }
    return it;
  };
  // สรุปสถานะรวมจาก copies → เขียนกลับลง it.status / it.due / it.loans ให้โค้ดเดิมอ่านได้
  window.DATA.recompute = (it) => {
    const cs = it.copies || [];
    const avail = cs.filter((c) => c.status === "ok").length;
    it._total = cs.length;
    it._avail = avail;
    if (avail > 0) it.status = "ok";
    else if (cs.some((c) => c.status === "busy")) it.status = "busy";
    else if (cs.some((c) => c.status === "inlib")) it.status = "inlib";
    else if (cs.some((c) => c.status === "fix")) it.status = "fix";
    else it.status = "busy";
    const dues = cs.filter((c) => c.status === "busy" && c.due).map((c) => c.due).sort();
    it.due = dues[0] || null;
    it.loans = cs.reduce((s, c) => s + (c.loans || 0), 0);
    return it;
  };
  window.DATA.availInfo = (it) => ({
    total: it._total != null ? it._total : (it.copies || []).length,
    avail: it._avail != null ? it._avail : (it.copies || []).filter((c) => c.status === "ok").length,
  });
  // หา copy + item แม่ จาก copyId (รองรับ loan เก่าที่ไม่มี copyId → คืนเล่มที่กำลังถูกยืมของ item)
  window.DATA.copyById = (cid, fallbackItemId) => {
    for (const it of window.DATA.items) {
      const c = (it.copies || []).find((x) => x.id === cid);
      if (c) return { copy: c, item: it };
    }
    if (fallbackItemId) {
      const it = window.DATA.itemById(fallbackItemId);
      if (it) { const c = (it.copies || []).find((x) => x.status === "busy") || (it.copies || [])[0]; if (c) return { copy: c, item: it }; }
    }
    return null;
  };

  // normalize: ให้ทุก item มี copies + สถานะรวมที่ถูกต้องตั้งแต่เริ่ม
  window.DATA.items.forEach((it) => { window.DATA.ensureCopies(it); window.DATA.recompute(it); });

  // One-time reset: clear any previously stored demo data from localStorage
  if (!localStorage.getItem("stl_fresh_v1")) {
    ["stl_loans_v1", "stl_items_v1", "stl_members_v1", "stl_items_full_v1"].forEach(function(k) {
      localStorage.removeItem(k);
    });
    localStorage.setItem("stl_fresh_v1", "1");
  }
})();
