/* ============================================================
   Siriraj Toy Library — Supabase database layer (window.DB)
   ============================================================ */
(function () {
  if (!window.SUPABASE_URL || window.SUPABASE_URL.includes("YOUR_PROJECT")) {
    console.warn("[DB] Supabase ยังไม่ได้ตั้งค่า — ใช้ localStorage แทน");
    window.DB = null;
    return;
  }

  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  /* ---- column mapping: JS camelCase ↔ DB snake_case ---- */
  function rowToItem(r) {
    const item = {
      id: r.id, code: r.code, kind: r.kind, th: r.th, en: r.en,
      cat: r.cat, author: r.author, callNumber: r.call_number,
      cutterNumber: r.cutter_number, edition: r.edition,
      status: r.status, loans: r.loans,
      image: r.image || null,
      pieces: r.pieces || null,
      publishYear: r.publish_year || null,
      barcode: r.barcode || null,
    };
    if (r.age_lo != null) item.ageLo = r.age_lo;
    if (r.age_hi != null) item.ageHi = r.age_hi;
    if (r.due_date) item.due = r.due_date;
    item.copies = [];
    return item;
  }

  /* ---- copies (ฉบับ/เล่มจริง) ---- */
  function rowToCopy(r) {
    return {
      id: r.id, itemId: r.item_id, barcode: r.barcode || "",
      label: r.label || "", status: r.status || "ok",
      due: r.due_date || null, note: r.note || "", loans: r.loans || 0,
    };
  }
  function copyToRow(c) {
    return {
      id: c.id, item_id: c.itemId, barcode: c.barcode || null,
      label: c.label || null, status: c.status || "ok",
      due_date: c.due || null, note: c.note || null, loans: c.loans || 0,
    };
  }
  function itemToRow(it) {
    return {
      id: it.id, code: it.code || null, kind: it.kind,
      th: it.th, en: it.en || null, cat: it.cat || null,
      age_lo: it.ageLo != null ? it.ageLo : null,
      age_hi: it.ageHi != null ? it.ageHi : null,
      author: it.author || null, call_number: it.callNumber || null,
      cutter_number: it.cutterNumber || null, edition: it.edition || null,
      publish_year: it.publishYear || null,
      barcode: it.barcode || null,
      status: it.status || "ok",
      loans: it.loans || 0, due_date: it.due || null,
      image: it.image || null,
      pieces: it.pieces || null,
    };
  }

  function rowToMember(r) {
    return {
      id: r.id, code: r.code, name: r.name, child: r.child,
      childAgeMo: r.child_age_mo, phone: r.phone,
      active: r.active || 0, history: r.history || 0,
    };
  }
  function memberToRow(m) {
    return {
      id: m.id, code: m.code, name: m.name, child: m.child || null,
      child_age_mo: m.childAgeMo || null, phone: m.phone || null,
      active: m.active || 0, history: m.history || 0,
    };
  }

  function rowToLoan(r) {
    return {
      id: r.id, member: r.member_id, itemId: r.item_id, copyId: r.copy_id || null,
      borrowed: r.borrowed_at, due: r.due_at, status: r.status,
      bag: r.bag || null, renewals: r.renewals || 0,
    };
  }
  function loanToRow(l) {
    return {
      id: l.id, member_id: l.member, item_id: l.itemId, copy_id: l.copyId || null,
      borrowed_at: l.borrowed, due_at: l.due,
      returned_at: null, status: l.status || "active",
      bag: l.bag || null, renewals: l.renewals || 0,
    };
  }

  window.DB = {

    /* ---- initial load: populate window.DATA from Supabase ---- */
    async loadAll() {
      const Da = window.DATA;
      try {
        const [itemsRes, copiesRes, membersRes, loansRes, statsRes] = await Promise.all([
          client.from("items").select("*").order("kind").order("th"),
          client.from("copies").select("*"),
          client.from("members").select("*").order("code"),
          client.from("loans").select("*").is("returned_at", null),
          client.from("monthly_stats").select("*").order("year").order("id"),
        ]);

        if (itemsRes.data && itemsRes.data.length > 0) {
          const mapped = itemsRes.data.map(rowToItem);
          // attach copies grouped by item_id
          const byItem = {};
          (copiesRes.data || []).forEach(r => { const c = rowToCopy(r); (byItem[c.itemId] = byItem[c.itemId] || []).push(c); });
          mapped.forEach(it => {
            it.copies = (byItem[it.id] || []).sort((a, b) => (a.label || "").localeCompare(b.label || "", "th"));
            Da.ensureCopies(it);
            Da.recompute(it);
          });
          Da.items.length = 0; mapped.forEach(i => Da.items.push(i));
          Da.toys.length = 0; mapped.filter(i => i.kind === "toy").forEach(i => Da.toys.push(i));
          Da.books.length = 0; mapped.filter(i => i.kind === "book").forEach(i => Da.books.push(i));
        }
        if (membersRes.data && membersRes.data.length > 0) {
          const mapped = membersRes.data.map(rowToMember);
          Da.members.length = 0; mapped.forEach(m => Da.members.push(m));
        }
        if (loansRes.data) {
          const mapped = loansRes.data.map(rowToLoan);
          Da.loans.length = 0; mapped.forEach(l => Da.loans.push(l));
          const todayMs = new Date(Da.today).getTime();
          Da.loans.forEach(l => {
            if (!l.due) return;
            const days = Math.round((new Date(l.due).getTime() - todayMs) / 86400000);
            if (days < 0) l.status = "overdue";
            else if (days <= 2) l.status = "due-soon";
            else l.status = "active";
          });
        }
        if (statsRes.data && statsRes.data.length > 0) {
          Da.monthly.length = 0;
          statsRes.data.forEach(r => Da.monthly.push({
            m: r.month_label, borrow: r.borrow_count, ret: r.return_count,
          }));
        }
      } catch (e) {
        console.error("[DB] loadAll failed:", e);
      }
    },

    /* ---- items ---- */
    async saveItems(items) {
      const rows = items.map(itemToRow);
      for (let i = 0; i < rows.length; i += 100) {
        const { error } = await client.from("items").upsert(rows.slice(i, i + 100));
        if (error) console.error("[DB] saveItems:", error);
      }
    },

    async updateItem(id, patch) {
      const col = {};
      if (patch.status !== undefined)  col.status   = patch.status;
      if (patch.due    !== undefined)  col.due_date = patch.due || null;
      if (patch.loans  !== undefined)  col.loans    = patch.loans;
      const { error } = await client.from("items").update(col).eq("id", id);
      if (error) console.error("[DB] updateItem:", error);
    },

    async editItem(item) {
      const payload = {
        th: item.th || null, en: item.en || null,
        code: item.code || null, cat: item.cat || null,
        status: item.status || "ok",
        image: item.image || null,
      };
      if (item.ageLo  != null) payload.age_lo = item.ageLo;
      if (item.ageHi  != null) payload.age_hi = item.ageHi;
      if (item.pieces != null) payload.pieces = item.pieces;
      if (item.author != null) payload.author = item.author;
      if (item.callNumber   != null) payload.call_number   = item.callNumber;
      if (item.cutterNumber != null) payload.cutter_number = item.cutterNumber;
      if (item.edition    != null) payload.edition      = item.edition;
      if (item.publishYear != null) payload.publish_year = item.publishYear;
      if (item.barcode    != null) payload.barcode      = item.barcode;
      console.log("[DB] editItem payload:", payload, "id:", item.id);
      const { error } = await client.from("items").update(payload).eq("id", item.id);
      if (error) { console.error("[DB] editItem error:", error); throw new Error(error.message || JSON.stringify(error)); }
    },

    async insertItem(item) {
      const { error } = await client.from("items").insert(itemToRow(item));
      if (error) { console.error("[DB] insertItem error:", error); throw new Error(error.message || JSON.stringify(error)); }
    },

    async deleteItem(id) {
      const { error } = await client.from("items").delete().eq("id", id);
      if (error) console.error("[DB] deleteItem:", error);
    },

    /* ---- copies (ฉบับ/เล่มจริง) ---- */
    // upsert เล่มที่ส่งมา + ลบเล่มที่ถูกเอาออก (ใช้ตอนบันทึกจากฟอร์มแก้ไข)
    async syncItemCopies(copies, removedIds) {
      if (copies && copies.length) {
        const { error } = await client.from("copies").upsert(copies.map(copyToRow));
        if (error) { console.error("[DB] syncItemCopies upsert:", error); throw new Error(error.message || JSON.stringify(error)); }
      }
      if (removedIds && removedIds.length) {
        const { error } = await client.from("copies").delete().in("id", removedIds);
        if (error) { console.error("[DB] syncItemCopies delete:", error); throw new Error(error.message || JSON.stringify(error)); }
      }
    },

    // อัปเดตสถานะ/กำหนดคืน/ยอดยืม ของเล่นเดียว (ใช้ตอนยืม-คืน)
    async updateCopy(id, patch) {
      const col = {};
      if (patch.status !== undefined) col.status   = patch.status;
      if (patch.due    !== undefined) col.due_date = patch.due || null;
      if (patch.loans  !== undefined) col.loans    = patch.loans;
      const { error } = await client.from("copies").update(col).eq("id", id);
      if (error) console.error("[DB] updateCopy:", error);
    },

    // bulk upsert เล่มทั้งหมด (ใช้ตอนนำเข้า Excel)
    async saveCopies(copies) {
      const rows = copies.map(copyToRow);
      for (let i = 0; i < rows.length; i += 100) {
        const { error } = await client.from("copies").upsert(rows.slice(i, i + 100));
        if (error) console.error("[DB] saveCopies:", error);
      }
    },

    /* ---- members ---- */
    async saveMembers(members) {
      const { error } = await client.from("members").upsert(members.map(memberToRow));
      if (error) console.error("[DB] saveMembers:", error);
    },

    async updateMember(id, patch) {
      const { error } = await client.from("members").update(patch).eq("id", id);
      if (error) console.error("[DB] updateMember:", error);
    },

    async deleteMember(id) {
      const { error } = await client.from("members").delete().eq("id", id);
      if (error) { console.error("[DB] deleteMember:", error); throw new Error(error.message || JSON.stringify(error)); }
    },

    /* ---- loans ---- */
    async addLoan(loan) {
      const { error } = await client.from("loans").insert(loanToRow(loan));
      if (error) console.error("[DB] addLoan:", error);
    },

    async returnLoan(loanId, returnedAt) {
      const { error } = await client.from("loans")
        .update({ returned_at: returnedAt, status: "returned" })
        .eq("id", loanId);
      if (error) console.error("[DB] returnLoan:", error);
    },

    async renewLoan(loanId, newDue) {
      const { error } = await client.from("loans")
        .update({ due_at: newDue })
        .eq("id", loanId);
      if (error) console.error("[DB] renewLoan:", error);
    },

    /* ---- monthly stats ---- */
    async incrementStat(monthLabel, year, isBorrow) {
      const field = isBorrow ? "borrow_count" : "return_count";
      const { data: existing } = await client.from("monthly_stats")
        .select("id, borrow_count, return_count")
        .eq("month_label", monthLabel).eq("year", year).maybeSingle();
      if (existing) {
        await client.from("monthly_stats")
          .update({ [field]: existing[field] + 1 }).eq("id", existing.id);
      } else {
        await client.from("monthly_stats").insert({
          month_label: monthLabel, year,
          borrow_count: isBorrow ? 1 : 0, return_count: isBorrow ? 0 : 1,
        });
      }
    },
  };

  console.log("[DB] Supabase พร้อมใช้งาน →", window.SUPABASE_URL);
})();
