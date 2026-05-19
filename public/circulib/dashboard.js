// Dashboard guard + books widget. Set window.CIRCULIB_ROLE before loading.
import { requireRole, signOut, currentRole, listBooks, addBook, deleteBook, requestBorrow, myBorrows, allBorrows, setBorrowStatus, toast } from "/circulib/supabase-client.js";

const ROLE = window.CIRCULIB_ROLE;

(async () => {
  const ctx = await requireRole(ROLE);
  if (!ctx) return;
  const { profile, user } = ctx;
  const name = profile?.full_name || user.email;
  // Replace any default name placeholder
  document.querySelectorAll(".profile__name, .user-name, [data-user-name]").forEach((el) => (el.textContent = name));
  document.querySelectorAll(".profile__avatar").forEach((el) => {
    el.textContent = name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  });

  // Inject toolbar: Books + Logout
  const bar = document.createElement("div");
  bar.style.cssText = "position:fixed;top:14px;right:14px;display:flex;gap:8px;z-index:9999;font-family:Inter,sans-serif";
  bar.innerHTML = `
    <button id="__cl_books" style="padding:10px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(20,20,30,.85);color:#fff;cursor:pointer;font-weight:600">📚 Books</button>
    <button id="__cl_logout" style="padding:10px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:#e85a02;color:#fff;cursor:pointer;font-weight:600">Logout</button>`;
  document.body.appendChild(bar);
  document.getElementById("__cl_logout").onclick = signOut;
  document.getElementById("__cl_books").onclick = openBooksModal;

  async function openBooksModal() {
    let m = document.getElementById("__cl_modal");
    if (m) { m.remove(); }
    m = document.createElement("div");
    m.id = "__cl_modal";
    m.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,sans-serif";
    m.innerHTML = `<div style="background:#0f0f17;color:#fff;border-radius:18px;max-width:900px;width:100%;max-height:85vh;overflow:auto;padding:24px;border:1px solid rgba(255,255,255,.1)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <h2 style="margin:0;font-size:22px">Library Books</h2>
        <button id="__cl_close" style="background:transparent;border:0;color:#fff;font-size:24px;cursor:pointer">×</button>
      </div>
      <div id="__cl_addform"></div>
      <div id="__cl_booklist">Loading…</div>
      <h3 style="margin-top:24px;font-size:16px;color:#aaa">${ROLE === "librarian" ? "All Borrow Records" : "My Borrows"}</h3>
      <div id="__cl_borrows">Loading…</div>
    </div>`;
    document.body.appendChild(m);
    document.getElementById("__cl_close").onclick = () => m.remove();

    if (ROLE === "librarian" || ROLE === "publisher") {
      document.getElementById("__cl_addform").innerHTML = `
        <form id="__cl_addbook" style="display:grid;grid-template-columns:1fr 1fr 1fr 80px auto;gap:8px;margin-bottom:18px">
          <input required name="title" placeholder="Title" style="padding:8px;border-radius:8px;border:1px solid #333;background:#1a1a26;color:#fff">
          <input required name="author" placeholder="Author" style="padding:8px;border-radius:8px;border:1px solid #333;background:#1a1a26;color:#fff">
          <input name="category" placeholder="Category" style="padding:8px;border-radius:8px;border:1px solid #333;background:#1a1a26;color:#fff">
          <input name="total_copies" type="number" min="1" value="1" style="padding:8px;border-radius:8px;border:1px solid #333;background:#1a1a26;color:#fff">
          <button style="padding:8px 16px;border-radius:8px;border:0;background:#e85a02;color:#fff;cursor:pointer">Add</button>
        </form>`;
      document.getElementById("__cl_addbook").onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const copies = parseInt(fd.get("total_copies")) || 1;
        try {
          await addBook({
            title: fd.get("title"), author: fd.get("author"),
            category: fd.get("category") || null, total_copies: copies, available_copies: copies,
          });
          toast("Book added"); e.target.reset(); refreshBooks();
        } catch (err) { toast(err.message, true); }
      };
    }
    await refreshBooks(); await refreshBorrows();
  }

  async function refreshBooks() {
    try {
      const books = await listBooks();
      const el = document.getElementById("__cl_booklist");
      if (!books.length) { el.innerHTML = `<p style="color:#888">No books yet.</p>`; return; }
      el.innerHTML = books.map((b) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #222;border-radius:10px;margin-bottom:8px">
          <div><strong>${escape(b.title)}</strong> <span style="color:#888">by ${escape(b.author)}</span><br><small style="color:#666">${escape(b.category || "")} · ${b.available_copies}/${b.total_copies} available</small></div>
          <div style="display:flex;gap:6px">
            ${(ROLE === "student" || ROLE === "faculty") ? `<button data-borrow="${b.id}" style="padding:6px 12px;border-radius:8px;border:0;background:#e85a02;color:#fff;cursor:pointer">Borrow</button>` : ""}
            ${(ROLE === "librarian" || ROLE === "publisher") ? `<button data-del="${b.id}" style="padding:6px 12px;border-radius:8px;border:1px solid #444;background:transparent;color:#fff;cursor:pointer">Delete</button>` : ""}
          </div>
        </div>`).join("");
      el.querySelectorAll("[data-borrow]").forEach((btn) => btn.onclick = async () => {
        try { await requestBorrow(btn.dataset.borrow); toast("Borrow requested"); refreshBorrows(); }
        catch (e) { toast(e.message, true); }
      });
      el.querySelectorAll("[data-del]").forEach((btn) => btn.onclick = async () => {
        try { await deleteBook(btn.dataset.del); toast("Deleted"); refreshBooks(); }
        catch (e) { toast(e.message, true); }
      });
    } catch (e) { toast(e.message, true); }
  }

  async function refreshBorrows() {
    try {
      const rows = ROLE === "librarian" ? await allBorrows() : await myBorrows();
      const el = document.getElementById("__cl_borrows");
      if (!rows.length) { el.innerHTML = `<p style="color:#888">No records.</p>`; return; }
      el.innerHTML = rows.map((r) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid #222;border-radius:10px;margin-bottom:6px">
          <div><strong>${escape(r.books?.title || "")}</strong> — <span style="color:#888">${escape(r.status)}</span>${r.profiles ? ` · <small>${escape(r.profiles.full_name || r.profiles.email || "")}</small>` : ""}</div>
          ${ROLE === "librarian" ? `
            <div style="display:flex;gap:4px">
              <button data-issue="${r.id}" style="padding:4px 10px;border-radius:6px;border:0;background:#2a8;color:#fff;cursor:pointer">Issue</button>
              <button data-ret="${r.id}" style="padding:4px 10px;border-radius:6px;border:0;background:#48a;color:#fff;cursor:pointer">Return</button>
            </div>` : ""}
        </div>`).join("");
      el.querySelectorAll("[data-issue]").forEach((b) => b.onclick = async () => { await setBorrowStatus(b.dataset.issue, "issued"); toast("Issued"); refreshBorrows(); });
      el.querySelectorAll("[data-ret]").forEach((b) => b.onclick = async () => { await setBorrowStatus(b.dataset.ret, "returned"); toast("Returned"); refreshBorrows(); });
    } catch (e) { toast(e.message, true); }
  }

  function escape(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
})();
