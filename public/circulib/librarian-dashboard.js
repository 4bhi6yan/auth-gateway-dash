/* ===== CircuLib · Librarian Dashboard ===== */
(() => {
  /* ---------- Data ---------- */
  const BOOKS = [
    { id: 1, title: 'Cosmos', author: 'Carl Sagan', cat: 'Science', stock: 4, popular: true, img: 'assets/book-1.png' },
    { id: 2, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', cat: 'CS', stock: 2, popular: true, img: 'assets/book-2.png' },
    { id: 3, title: 'Atomic Habits', author: 'James Clear', cat: 'Self-help', stock: 6, popular: true, img: 'assets/book-3.png' },
    { id: 4, title: 'Sapiens', author: 'Yuval N. Harari', cat: 'History', stock: 1, low: true, img: 'assets/book-4.png' },
    { id: 5, title: 'Clean Architecture', author: 'Robert C. Martin', cat: 'CS', stock: 3, img: 'assets/book-5.png' },
    { id: 6, title: 'Designing Data-Intensive Apps', author: 'Martin Kleppmann', cat: 'CS', stock: 0, low: true, popular: true, img: 'assets/book-6.png' },
    { id: 7, title: 'Deep Work', author: 'Cal Newport', cat: 'Self-help', stock: 5, new: true, img: 'assets/book-1.png' },
    { id: 8, title: 'The Design of Everyday Things', author: 'Don Norman', cat: 'Design', stock: 4, new: true, img: 'assets/book-2.png' },
  ];

  const REQUESTS = [
    { id: 1, type: 'student', user: 'Anika R.', meta: 'STU-2103', detail: 'Reserve · Cosmos' },
    { id: 2, type: 'student', user: 'Rohan M.', meta: 'STU-2207', detail: 'Extend · Clean Architecture (+7d)' },
    { id: 3, type: 'student', user: 'Maya P.', meta: 'STU-2312', detail: 'Reserve · Atomic Habits' },
    { id: 4, type: 'faculty', user: 'Prof. Iyer', meta: 'Physics', detail: 'Bulk loan · 4 titles for course' },
    { id: 5, type: 'faculty', user: 'Prof. Khan', meta: 'CS', detail: 'New acquisition · DDIA (5 copies)' },
    { id: 6, type: 'publisher', user: 'Penguin RH', meta: 'Publisher', detail: 'Catalog sync · 24 titles' },
    { id: 7, type: 'publisher', user: "O'Reilly", meta: 'Publisher', detail: 'Restock · 12 titles' },
  ];

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    setDate();
    renderRequests('all');
    renderPopular();
    renderActivityChart();
    renderTrendChart();
    renderInventory('all');
    renderPickGrid();
    renderReturnTable();
    renderQrPreview();
    renderReqSubpanels();
    wireNav();
    wireTopbar();
    wireRequests();
    wireFilters();
    wireOkio();
    wireParallax();
    wireSearch();
    wireDbSearch();
    wireAccordion();
  });

  function setDate() {
    const el = document.getElementById('todayDate');
    if (el) el.textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /* ---------- Navigation ---------- */
  function wireNav() {
    document.querySelectorAll('[data-section]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const name = el.dataset.section;
        document.querySelectorAll('.nav__item').forEach((n) => n.classList.toggle('is-active', n.dataset.section === name));
        document.querySelectorAll('.view').forEach((v) => v.classList.toggle('is-active', v.dataset.view === name));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* ---------- Topbar ---------- */
  function wireTopbar() {
    const notifBtn = document.getElementById('notifBtn');
    const notifPanel = document.getElementById('notifPanel');
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.hidden = !notifPanel.hidden;
    });
    document.addEventListener('click', (e) => {
      if (!notifPanel.contains(e.target) && e.target !== notifBtn) notifPanel.hidden = true;
    });
    document.getElementById('markAllRead').addEventListener('click', () => {
      document.querySelector('.notif-dot').style.display = 'none';
      toast('All notifications marked as read');
    });
    document.getElementById('quickIssueBtn').addEventListener('click', () => switchTo('issue'));
    document.getElementById('quickQrBtn').addEventListener('click', () => switchTo('qr'));
  }

  function switchTo(name) {
    const el = document.querySelector(`.nav__item[data-section="${name}"]`);
    if (el) el.click();
  }

  /* ---------- Search ---------- */
  function wireSearch() {
    const input = document.getElementById('globalSearch');
    const dd = document.getElementById('searchDropdown');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { dd.hidden = true; return; }
      const matches = BOOKS.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)).slice(0, 6);
      dd.innerHTML = matches.length
        ? matches.map((b) => `<div class="res"><div>${b.title}<br><span>${b.author}</span></div><span>${b.cat}</span></div>`).join('')
        : `<div class="res"><div>No results for "${q}"</div></div>`;
      dd.hidden = false;
    });
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (!dd.contains(e.target) && e.target !== input) dd.hidden = true;
    });
  }

  /* ---------- Requests ---------- */
  function wireRequests() {
    document.querySelectorAll('#reqTabs .tab').forEach((t) => {
      t.addEventListener('click', () => {
        document.querySelectorAll('#reqTabs .tab').forEach((x) => x.classList.remove('is-active'));
        t.classList.add('is-active');
        renderRequests(t.dataset.tab);
      });
    });
  }

  function renderRequests(filter) {
    const list = document.getElementById('reqList');
    if (!list) return;
    const items = filter === 'all' ? REQUESTS : REQUESTS.filter((r) => r.type === filter);
    list.innerHTML = items.map((r) => `
      <li data-id="${r.id}">
        <div class="req-main">
          <strong>${r.user}</strong>
          <span>${r.meta} · ${r.detail}</span>
          <span class="req-tag">${r.type}</span>
        </div>
        <div class="req-actions">
          <button class="btn btn--ghost btn--sm" data-action="reject">Reject</button>
          <button class="btn btn--primary btn--sm" data-action="accept">Accept</button>
        </div>
      </li>`).join('');
    list.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        const action = btn.dataset.action;
        li.style.transition = 'all .25s ease';
        li.style.opacity = '0';
        li.style.transform = 'translateX(20px)';
        setTimeout(() => li.remove(), 250);
        toast(action === 'accept' ? 'Request accepted ✓' : 'Request rejected');
      });
    });
  }

  function renderReqSubpanels() {
    document.querySelectorAll('.req-list[data-source]').forEach((list) => {
      const type = list.dataset.source;
      const items = REQUESTS.filter((r) => r.type === type);
      list.innerHTML = items.map((r) => `
        <li><div class="req-main"><strong>${r.user}</strong><span>${r.meta} · ${r.detail}</span></div>
        <div class="req-actions"><button class="btn btn--ghost btn--sm">Reject</button><button class="btn btn--primary btn--sm">Accept</button></div></li>`).join('');
    });
  }

  /* ---------- Charts (CSS bars) ---------- */
  function renderActivityChart() {
    const el = document.getElementById('activityChart');
    if (!el) return;
    const hours = ['9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p'];
    el.innerHTML = hours.map((h) => {
      const a = 30 + Math.random() * 110;
      const b = 20 + Math.random() * 90;
      return `<div class="bar-col"><div class="bar-col__bars"><i style="height:${a}px"></i><i style="height:${b}px"></i></div><span>${h}</span></div>`;
    }).join('');
  }

  function renderTrendChart() {
    const el = document.getElementById('trendChart');
    if (!el) return;
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    el.innerHTML = days.map((d) => {
      const a = 40 + Math.random() * 120;
      return `<div class="bar-col"><div class="bar-col__bars"><i style="height:${a}px"></i></div><span>${d}</span></div>`;
    }).join('');
  }

  /* ---------- Popular books ---------- */
  function renderPopular() {
    const el = document.getElementById('popularBooks');
    if (!el) return;
    el.innerHTML = BOOKS.filter((b) => b.popular).slice(0, 4).map((b, i) => `
      <div class="pop">
        <img src="${b.img}" alt="${b.title}" />
        <div><strong>${b.title}</strong><span>${b.author}</span></div>
        <em>${42 - i * 6}</em>
      </div>`).join('');
  }

  /* ---------- Inventory ---------- */
  function renderInventory(filter) {
    const el = document.getElementById('invGrid');
    if (!el) return;
    let items = BOOKS;
    if (filter === 'low') items = items.filter((b) => b.low || b.stock <= 1);
    else if (filter === 'popular') items = items.filter((b) => b.popular);
    else if (filter === 'new') items = items.filter((b) => b.new);
    el.innerHTML = items.map((b) => `
      <div class="inv-card glass">
        <img src="${b.img}" alt="${b.title}" />
        <strong>${b.title}</strong>
        <span>${b.author}</span>
        <div class="inv-meta">
          <span>${b.cat}</span>
          <em>${b.stock === 0 ? 'Out' : b.stock + ' in stock'}</em>
        </div>
      </div>`).join('');
  }

  function wireFilters() {
    document.querySelectorAll('.filters .chip').forEach((c) => {
      c.addEventListener('click', () => {
        document.querySelectorAll('.filters .chip').forEach((x) => x.classList.remove('is-active'));
        c.classList.add('is-active');
        renderInventory(c.dataset.filter);
      });
    });
  }

  /* ---------- Issue pick grid ---------- */
  function renderPickGrid() {
    const el = document.getElementById('pickGrid');
    if (!el) return;
    el.innerHTML = BOOKS.slice(0, 6).map((b, i) => `<div class="pick ${i === 0 ? 'is-selected' : ''}" data-title="${b.title} · ${b.author}"><img src="${b.img}" alt="${b.title}"/></div>`).join('');
    el.querySelectorAll('.pick').forEach((p) => {
      p.addEventListener('click', () => {
        el.querySelectorAll('.pick').forEach((x) => x.classList.remove('is-selected'));
        p.classList.add('is-selected');
        document.getElementById('confirmBook').textContent = p.dataset.title;
      });
    });
    document.getElementById('issueConfirm').addEventListener('click', () => toast('Book issued ✓ Receipt sent to student'));
  }

  /* ---------- Return table ---------- */
  function renderReturnTable() {
    const el = document.getElementById('returnTable');
    if (!el) return;
    const rows = [
      { s: 'Anika R.', b: 'Designing Data-Intensive Apps', d: 'May 3', status: 'overdue', fine: '₹140' },
      { s: 'Rohan M.', b: 'Clean Architecture', d: 'May 11', status: 'overdue', fine: '₹60' },
      { s: 'Maya P.', b: 'The Design of Everyday Things', d: 'May 14', status: 'due', fine: '₹30' },
      { s: 'Vihaan S.', b: 'Atomic Habits', d: 'May 22', status: 'ontime', fine: '—' },
      { s: 'Aanya G.', b: 'Cosmos', d: 'May 24', status: 'ontime', fine: '—' },
    ];
    const chip = { overdue: 'chip--danger', due: 'chip--warn', ontime: 'chip--ok' };
    const label = { overdue: 'Overdue', due: 'Due Soon', ontime: 'On Time' };
    el.innerHTML = rows.map((r) => `
      <tr>
        <td>${r.s}</td><td>${r.b}</td><td>${r.d}</td>
        <td><span class="chip ${chip[r.status]}">${label[r.status]}</span></td>
        <td>${r.fine}</td>
        <td><button class="btn btn--primary btn--sm" data-return>Return</button></td>
      </tr>`).join('');
    el.querySelectorAll('[data-return]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tr = e.target.closest('tr');
        tr.style.transition = 'opacity .3s';
        tr.style.opacity = '.3';
        toast('Book returned ✓');
      });
    });
  }

  /* ---------- QR placeholder ---------- */
  function renderQrPreview() {
    const el = document.getElementById('qrPreview');
    if (!el) return;
    // Simple decorative QR-like SVG
    let cells = '';
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
      if (Math.random() > 0.5) cells += `<rect x="${x * 8}" y="${y * 8}" width="8" height="8" fill="#ed9e6f"/>`;
    }
    el.innerHTML = `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" rx="8" fill="rgba(255,255,255,.04)"/>
      ${cells}
      <rect x="4" y="4" width="20" height="20" fill="none" stroke="#ed9e6f" stroke-width="3"/>
      <rect x="72" y="4" width="20" height="20" fill="none" stroke="#ed9e6f" stroke-width="3"/>
      <rect x="4" y="72" width="20" height="20" fill="none" stroke="#ed9e6f" stroke-width="3"/>
    </svg>`;
  }

  /* ---------- DB search ---------- */
  function wireDbSearch() {
    const input = document.getElementById('dbSearch');
    const res = document.getElementById('dbResults');
    if (!input) return;
    const all = [
      ...BOOKS.map((b) => ({ type: 'Book', title: b.title, sub: b.author })),
      { type: 'Student', title: 'Anika R.', sub: 'STU-2103 · CS' },
      { type: 'Student', title: 'Rohan M.', sub: 'STU-2207 · EC' },
      { type: 'Faculty', title: 'Prof. Iyer', sub: 'Physics Dept' },
      { type: 'Publisher', title: 'Penguin Random House', sub: '24 titles' },
    ];
    const render = (q) => {
      const items = q ? all.filter((i) => i.title.toLowerCase().includes(q.toLowerCase())) : all;
      res.innerHTML = items.map((i) => `<div class="res"><span>${i.type}</span><div><strong>${i.title}</strong><br><span style="color:var(--muted);font-size:11.5px;letter-spacing:0;text-transform:none">${i.sub}</span></div><span>→</span></div>`).join('') || '<div class="res">No matches</div>';
    };
    render('');
    input.addEventListener('input', () => render(input.value));
  }

  /* ---------- Accordion ---------- */
  function wireAccordion() {
    // native <details> handles toggling; nothing extra needed
  }

  /* ---------- OKIO ---------- */
  function wireOkio() {
    const btn = document.getElementById('okioBtn');
    const panel = document.getElementById('okioPanel');
    const close = document.getElementById('okioClose');
    const form = document.getElementById('okioForm');
    const input = document.getElementById('okioInput');
    const body = document.getElementById('okioBody');

    btn.addEventListener('click', () => { panel.hidden = false; input.focus(); });
    close.addEventListener('click', () => { panel.hidden = true; });

    document.querySelectorAll('#okioSuggest button').forEach((b) => {
      b.addEventListener('click', () => { sendMsg(b.textContent); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (!v) return;
      sendMsg(v);
      input.value = '';
    });

    function sendMsg(text) {
      addMsg(text, 'user');
      setTimeout(() => addMsg(reply(text), 'bot'), 600);
    }
    function addMsg(text, kind) {
      const d = document.createElement('div');
      d.className = `okio-msg okio-msg--${kind}`;
      d.textContent = text;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    }
    function reply(q) {
      const s = q.toLowerCase();
      if (s.includes('overdue')) return '12 books are overdue. 4 students passed the 7-day threshold — I can draft personalized reminders if you like.';
      if (s.includes('remind') || s.includes('draft')) return 'Drafted: "Hi {student}, our records show {book} is {days} days overdue. Please return or renew via the CircuLib portal." Ready to send?';
      if (s.includes('top') || s.includes('popular')) return 'Top 5 this week: 1) DDIA · 2) Atomic Habits · 3) Cosmos · 4) Clean Architecture · 5) Sapiens.';
      if (s.includes('fine')) return '₹230 in active unpaid fines across 3 students. Largest: Anika R. ₹140.';
      if (s.includes('hello') || s.includes('hi')) return 'Hi! I can summarize queues, draft messages, or surface analytics. What do you need?';
      return 'I can help with overdue lists, reminders, fines, top-borrowed books, and request triage. Try one of the suggestions above.';
    }
  }

  /* ---------- Parallax aurora ---------- */
  function wireParallax() {
    const blobs = document.querySelectorAll('.aurora__blob');
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      blobs.forEach((b, i) => {
        const f = (i + 1) * 0.4;
        b.style.transform = `translate(${x * f}px, ${y * f}px)`;
      });
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2400);
  }
})();
