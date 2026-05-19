/* ===== CircuLib · Student Dashboard interactions =====
   Modular, vanilla JS. No framework, no page reloads.
============================================================ */
(function(){
  'use strict';

  /* ---------- Data ---------- */
  const BOOK_ASSETS = [
    'assets/book-1.png','assets/book-2.png','assets/book-3.png',
    'assets/book-4.png','assets/book-5.png','assets/book-6.png'
  ];
  const coverFor = i => BOOK_ASSETS[i % BOOK_ASSETS.length];

  const ISSUED = [
    { id:'i1', title:'The Pragmatic Programmer', author:'David Thomas · Andy Hunt', issued:'12 May', due:'26 May', daysLeft:5,  pct:65, status:'active', color:'var(--accent-peach)', cover:coverFor(0), desc:'A classic primer on craftsmanship, abstraction, and pragmatic decision-making for software engineers.' },
    { id:'i2', title:'Designing Data-Intensive Apps', author:'Martin Kleppmann', issued:'02 May', due:'30 May', daysLeft:9,  pct:40, status:'active', color:'var(--accent-pink)',  cover:coverFor(1), desc:'A deep tour through the architectures behind reliable, scalable, and maintainable data systems.' },
    { id:'i3', title:'Sapiens',                     author:'Yuval Noah Harari', issued:'08 May', due:'22 May', daysLeft:2,  pct:90, status:'due',    color:'#ff7a8a',             cover:coverFor(2), desc:'A sweeping narrative of the cognitive, agricultural, and scientific revolutions that shaped humankind.' },
    { id:'i4', title:'Clean Architecture',          author:'Robert C. Martin',  issued:'15 May', due:'05 Jun', daysLeft:15, pct:25, status:'active', color:'var(--accent-rose)',  cover:coverFor(3), desc:'Principles for structuring systems so they remain pliable as requirements evolve.' }
  ];

  const ALERTS = [
    { id:'a1', kind:'danger', icon:'!', title:'Sapiens',                 body:'Due in <b>2 days</b> · Avoid ₹10/day fine', more:'Renew once available, or return at the main desk by 6 PM Friday.' },
    { id:'a2', kind:'warn',   icon:'⏱', title:'The Pragmatic Programmer', body:'Due in <b>5 days</b> · Renew available',    more:'You can renew once more, since no reservation is active.' },
    { id:'a3', kind:'info',   icon:'₹', title:'Outstanding Fine',         body:'<b>₹40</b> pending · settle anytime',       more:'Pay at the kiosk or via the Fine Tracker section in this dashboard.' }
  ];

  const QUEUE = [
    { id:'q1', title:'Atomic Habits',       pos:'#03', wait:'4 days',   pct:72, color:'var(--accent-peach)', more:'2 copies in circulation · last returned May 14 · estimated next slot Friday.' },
    { id:'q2', title:'Deep Work',           pos:'#01', wait:'Tomorrow', pct:92, color:'#9be7a3',             more:'You\'re next in line. Pickup notification will be sent the moment it returns.' },
    { id:'q3', title:'The Almanack of Naval', pos:'#07', wait:'12 days', pct:32, color:'var(--accent-pink)',  more:'High demand title — consider exploring our digital copy in the meantime.' }
  ];

  const RECOS = [
    { id:'r1', title:'Algorithms to Live By',      sub:'Prof. Mehra · CS',       tag:'Must Read', tagAlt:false, cover:coverFor(4), desc:'How computer-science thinking applies to everyday human decisions.' },
    { id:'r2', title:'The Innovators',             sub:'Dr. Kapoor · History',   tag:'Trending',  tagAlt:true,  cover:coverFor(5), desc:'The story of the people behind the digital revolution.' },
    { id:'r3', title:'Thinking, Fast and Slow',    sub:'Prof. Shah · Psych',     tag:'Essential', tagAlt:false, cover:coverFor(0), desc:'Two systems of thought and how they shape judgement.' },
    { id:'r4', title:'The Design of Everyday Things', sub:'Dr. Iyer · Design',   tag:'New',       tagAlt:true,  cover:coverFor(1), desc:'A foundational text on user-centered design.' }
  ];

  const ARRIVALS = [
    { id:'n1', title:'Project Hail Mary',  author:'Andy Weir',         cover:coverFor(2), desc:'A lone astronaut on a desperate, last-chance mission.' },
    { id:'n2', title:'Tomorrow ×3',        author:'Gabrielle Zevin',   cover:coverFor(3), desc:'A decades-spanning friendship told through video games.' },
    { id:'n3', title:'Klara and the Sun',  author:'K. Ishiguro',       cover:coverFor(4), desc:'An artificial friend observes a world she barely understands.' },
    { id:'n4', title:'The Anomaly',        author:'Hervé Le Tellier',  cover:coverFor(5), desc:'A genre-bending thriller about a flight and its impossible double.' },
    { id:'n5', title:'Sea of Tranquility', author:'Emily St. John',    cover:coverFor(0), desc:'A time-spanning novel of pandemics, art, and the moon.' }
  ];

  const GUIDELINES = [
    { idx:'01', title:'Up to 6 books at a time, max 30 days.', body:'You may borrow up to six titles concurrently. Each loan runs for thirty days from the issue date.' },
    { idx:'02', title:'Renew twice if no active reservation.', body:'Two renewals per title are permitted, provided no other student has reserved the same book.' },
    { idx:'03', title:'Late fee ₹10/day per book.',            body:'Fines apply per book per calendar day, including weekends and public holidays.' },
    { idx:'04', title:'Handle with care — damage charged at cost.', body:'Damaged or lost books are charged at full replacement cost plus a small processing fee.' },
    { idx:'05', title:'Quiet zones must be respected.',        body:'The North wing is a designated silent study area. Group discussion belongs in the East wing.' }
  ];

  const ANNOUNCEMENTS = [
    { id:'an1', dot:'peach', title:'Extended Reading Hours · Finals Week', body:'Main hall open until 02:00 AM from May 27 to June 5.', more:'Extra study pods, free chai counter, and a 24-hour librarian on call. Pre-book a pod via the Reservations panel.', time:'2h ago' },
    { id:'an2', dot:'pink',  title:'New Sci-Fi Collection Arriving',       body:'120 titles join the catalog next Monday. Reserve early.', more:'Includes new releases from Andy Weir, Becky Chambers, and Ted Chiang. Watch the Recommendations panel for personalized picks.', time:'1d ago' },
    { id:'an3', dot:'rose',  title:'Maintenance Window',                   body:'Self-checkout kiosks offline Sun · 06:00–08:00 AM.',     more:'Manual checkout will be available at the help desk during the window. Apologies for the inconvenience.', time:'3d ago' }
  ];

  const NOTIFICATIONS = [
    { id:'nt1', title:'Sapiens is due in 2 days', body:'Renew or return to avoid a fine.', read:false },
    { id:'nt2', title:'Reservation moved to #1',  body:'Deep Work — available tomorrow.', read:false },
    { id:'nt3', title:'New Faculty Pick',         body:'Prof. Mehra recommended Algorithms to Live By.', read:false },
    { id:'nt4', title:'Library hours extended',   body:'Open till 2 AM during finals.', read:false }
  ];

  /* All searchable books (used by global search) */
  const SEARCH_INDEX = [
    ...ISSUED.map(b=>({ ...b, kind:'Issued' })),
    ...RECOS.map(b=>({ ...b, author:b.sub, kind:'Recommendation' })),
    ...ARRIVALS.map(b=>({ ...b, kind:'New Arrival' }))
  ];

  /* ---------- Tiny helpers ---------- */
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const el = (tag, attrs={}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)){
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null) n.setAttribute(k, v);
    }
    kids.flat().forEach(k => n.append(k?.nodeType ? k : document.createTextNode(k)));
    return n;
  };

  /* ---------- Toast ---------- */
  function toast(msg){
    const stack = $('#toastStack');
    const t = el('div', { class:'toast' }, msg);
    stack.append(t);
    setTimeout(()=>{ t.classList.add('is-out'); setTimeout(()=>t.remove(), 300); }, 2400);
  }

  /* ---------- Renderers ---------- */
  function renderBook(b){
    const chipCls = b.daysLeft <= 2 ? 'chip chip--danger' : b.daysLeft <= 5 ? 'chip chip--warn' : 'chip';
    const chipTxt = b.daysLeft <= 2 ? `Due in ${b.daysLeft}d` : `${b.daysLeft} days left`;
    const li = el('li', { class:'book', 'data-status':b.status, 'data-id':b.id });
    li.innerHTML = `
      <div class="book__cover" style="background-image:url('${b.cover}')"></div>
      <div class="book__info">
        <h3>${b.title}</h3>
        <span>${b.author}</span>
        <div class="book__meta"><span>Issued ${b.issued}</span><i></i><span>Due ${b.due}</span></div>
        <div class="bar"><div class="bar__fill" style="--p:${b.pct}%; --c:${b.color}"></div></div>
      </div>
      <span class="${chipCls}">${chipTxt}</span>`;
    li.addEventListener('click', () => openBookModal(b, 'Issued Book'));
    return li;
  }

  function renderAlert(a, withDismiss=false){
    const li = el('li', { class:`alert alert--${a.kind}`, 'data-id':a.id });
    li.innerHTML = `
      <div class="alert__icon">${a.icon}</div>
      <div>
        <h4>${a.title}</h4>
        <p>${a.body}</p>
      </div>
      ${withDismiss ? `<button class="alert__close" aria-label="Dismiss">×</button>` : '<span></span>'}
      <div class="alert__more">${a.more}</div>`;
    li.addEventListener('click', e => {
      if (e.target.closest('.alert__close')) return;
      li.classList.toggle('is-expanded');
      li.classList.add('is-read');
    });
    const closeBtn = li.querySelector('.alert__close');
    if (closeBtn) closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      li.classList.add('is-dismissing');
      setTimeout(() => li.remove(), 320);
      toast('Alert dismissed');
    });
    return li;
  }

  function renderQueue(q){
    const li = el('li', { 'data-id':q.id });
    li.innerHTML = `
      <div class="queue__top"><h4>${q.title}</h4><span class="pos">${q.pos}</span></div>
      <p>Est. available · <b>${q.wait}</b></p>
      <div class="bar"><div class="bar__fill" style="--p:${q.pct}%; --c:${q.color}"></div></div>
      <div class="queue__more">${q.more}</div>`;
    li.addEventListener('click', () => li.classList.toggle('is-expanded'));
    return li;
  }

  function renderReco(r){
    const card = el('article', { class:'reco' });
    card.innerHTML = `
      <div class="reco__cover" style="background-image:url('${r.cover}')"></div>
      <h4>${r.title}</h4>
      <span>${r.sub}</span>
      <em class="tag ${r.tagAlt?'tag--alt':''}">${r.tag}</em>`;
    card.addEventListener('click', () => openBookModal({ ...r, author:r.sub }, 'Faculty Pick'));
    return card;
  }

  function renderArrival(n){
    const card = el('div', { class:'arrival' });
    card.innerHTML = `
      <div class="arrival__cover" style="background-image:url('${n.cover}')"></div>
      <h5>${n.title}</h5>
      <span>${n.author}</span>`;
    card.addEventListener('click', () => openBookModal(n, 'New Arrival'));
    return card;
  }

  function renderAccItem(g){
    const item = el('li', { class:'acc-item' });
    item.innerHTML = `
      <button class="acc-head">
        <span class="idx">${g.idx}</span>
        <span class="title">${g.title}</span>
        <span class="chev">▾</span>
      </button>
      <div class="acc-body"><p>${g.body}</p></div>`;
    item.querySelector('.acc-head').addEventListener('click', () => item.classList.toggle('is-open'));
    return item;
  }

  function renderAnnounce(a){
    const li = el('li', { 'data-id':a.id });
    li.innerHTML = `
      <span class="dot dot--${a.dot}"></span>
      <div>
        <h4>${a.title}</h4>
        <p>${a.body}</p>
        <div class="ann-more">${a.more}</div>
      </div>
      <time>${a.time}</time>`;
    li.addEventListener('click', () => { li.classList.toggle('is-expanded'); li.classList.add('is-read'); });
    return li;
  }

  /* ---------- Mount sections ---------- */
  function mountAll(){
    // Issued (dashboard short list + full)
    $('#issuedList').replaceChildren(...ISSUED.map(renderBook));
    $('#issuedListFull').replaceChildren(...ISSUED.map(renderBook));

    // Alerts
    $('#alertsList').replaceChildren(...ALERTS.map(a => renderAlert(a, false)));
    $('#alertsListFull').replaceChildren(...ALERTS.map(a => renderAlert(a, true)));

    // Queue
    $('#queueList').replaceChildren(...QUEUE.map(renderQueue));
    $('#queueListFull').replaceChildren(...QUEUE.map(renderQueue));

    // Recos
    $('#recScroller').replaceChildren(...RECOS.map(renderReco));
    $('#recGridFull').replaceChildren(...RECOS.map(r => renderArrival({ ...r, author:r.sub })));

    // Arrivals
    $('#arrivalsGrid').replaceChildren(...ARRIVALS.map(renderArrival));
    $('#arrivalsGridFull').replaceChildren(...ARRIVALS.map(renderArrival));

    // Guidelines
    $('#guidelinesAcc').replaceChildren(...GUIDELINES.map(renderAccItem));
    $('#guidelinesAccFull').replaceChildren(...GUIDELINES.map(renderAccItem));

    // Announcements
    $('#announceList').replaceChildren(...ANNOUNCEMENTS.map(renderAnnounce));
    $('#announceListFull').replaceChildren(...ANNOUNCEMENTS.map(renderAnnounce));

    // Notifications
    renderNotifications();
  }

  /* ---------- Tabs / filtering ---------- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.tabs__btn');
    if (!btn) return;
    const group = btn.closest('.tabs');
    group.querySelectorAll('.tabs__btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const filter = btn.dataset.filter;
    const panel = btn.closest('.panel');
    const books = panel?.querySelectorAll('.book') || [];
    books.forEach(b => {
      const st = b.dataset.status;
      const show = filter === 'all' || (filter === 'due' && st === 'due') || (filter === 'active' && st === 'active');
      b.classList.toggle('is-hidden', !show);
    });
  });

  /* ---------- Scroller controls ---------- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.scroller-ctrls button');
    if (!btn) return;
    const scroller = $('#recScroller');
    scroller && scroller.scrollBy({ left: parseInt(btn.dataset.dir,10) * 240, behavior:'smooth' });
  });

  /* ---------- Section switching ---------- */
  function switchSection(name){
    $$('.view').forEach(v => v.classList.toggle('is-active', v.dataset.view === name));
    $$('.nav__item').forEach(i => i.classList.toggle('is-active', i.dataset.section === name));
    // Update greeting subtitle to reflect context
    const subs = {
      dashboard:'Your reading orbit looks bright tonight — 3 books in flight.',
      issued:'Every book currently in your hands.',
      reservations:'Live position tracking across the shelves.',
      due:'Stay ahead of every deadline.',
      fines:'Track outstanding and historical fines.',
      recommendations:'Personally curated by faculty you follow.',
      arrivals:'Just landed on the CircuLib shelves.',
      guidelines:'Quick policy reference for borrowers.',
      announcements:'The latest from the CircuLib desk.'
    };
    $('#greetSub').textContent = subs[name] || subs.dashboard;
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  document.addEventListener('click', e => {
    const nav = e.target.closest('.nav__item');
    if (nav){ e.preventDefault(); switchSection(nav.dataset.section); return; }
    const goto = e.target.closest('[data-goto]');
    if (goto){ e.preventDefault(); switchSection(goto.dataset.goto); }
  });

  /* ---------- Renew CTA ---------- */
  $('#renewBtn')?.addEventListener('click', () => toast('Renewal requested · awaiting confirmation'));
  $('#markAnnounceRead')?.addEventListener('click', () => {
    $$('#announceList li, #announceListFull li').forEach(li => li.classList.add('is-read'));
    toast('All announcements marked as read');
  });

  /* ---------- Search ---------- */
  const searchInput = $('#searchInput');
  const searchDropdown = $('#searchDropdown');
  const searchWrap = $('#searchWrap');

  function renderSearch(q){
    const query = q.trim().toLowerCase();
    if (!query){ searchDropdown.hidden = true; return; }
    const matches = SEARCH_INDEX.filter(b =>
      b.title.toLowerCase().includes(query) ||
      (b.author || '').toLowerCase().includes(query)
    ).slice(0, 6);

    if (!matches.length){
      searchDropdown.innerHTML = `<div class="sr-empty">No matches for "${q}"</div>`;
    } else {
      const highlight = (txt) => txt.replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'ig'), '<span class="sr-match">$1</span>');
      searchDropdown.innerHTML = matches.map(b => `
        <div class="sr-item" data-book-id="${b.id}">
          <div class="sr-cover" style="background-image:url('${b.cover}')"></div>
          <div class="sr-text">
            <h5>${highlight(b.title)}</h5>
            <span>${highlight(b.author || '')} · ${b.kind}</span>
          </div>
        </div>`).join('');
      searchDropdown.querySelectorAll('.sr-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.bookId;
          const book = SEARCH_INDEX.find(b => b.id === id);
          if (book) openBookModal(book, book.kind);
          searchDropdown.hidden = true;
          searchInput.value = '';
        });
      });
    }
    searchDropdown.hidden = false;
  }

  searchInput?.addEventListener('input', e => renderSearch(e.target.value));
  searchInput?.addEventListener('focus', e => { if (e.target.value) renderSearch(e.target.value); });
  document.addEventListener('click', e => {
    if (!searchWrap.contains(e.target)) searchDropdown.hidden = true;
  });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault(); searchInput?.focus();
    }
    if (e.key === 'Escape'){
      searchDropdown.hidden = true;
      closeOkio(); closeModal(); $('#notifPanel').hidden = true;
    }
  });

  /* ---------- Notifications ---------- */
  function renderNotifications(){
    const list = $('#notifList');
    list.replaceChildren(...NOTIFICATIONS.map(n => {
      const li = el('li', { class:`notif-item ${n.read?'is-read':''}`, 'data-id':n.id });
      li.innerHTML = `
        <span class="nv-dot"></span>
        <div>
          <h5>${n.title}</h5>
          <p>${n.body}</p>
        </div>
        <button aria-label="Dismiss">×</button>`;
      li.querySelector('button').addEventListener('click', e => {
        e.stopPropagation();
        NOTIFICATIONS.splice(NOTIFICATIONS.findIndex(x => x.id === n.id), 1);
        renderNotifications();
      });
      li.addEventListener('click', () => { n.read = true; renderNotifications(); });
      return li;
    }));
    const unread = NOTIFICATIONS.filter(n => !n.read).length;
    $('#notifCount').textContent = NOTIFICATIONS.length;
    $('#notifDot').classList.toggle('is-hidden', unread === 0);
  }

  const notifBtn = $('#notifBtn'), notifPanel = $('#notifPanel');
  notifBtn.addEventListener('click', e => { e.stopPropagation(); notifPanel.hidden = !notifPanel.hidden; });
  document.addEventListener('click', e => {
    if (!notifPanel.contains(e.target) && !notifBtn.contains(e.target)) notifPanel.hidden = true;
  });
  $('#markAllRead').addEventListener('click', () => { NOTIFICATIONS.forEach(n => n.read = true); renderNotifications(); });

  /* ---------- OKIO Chatbot ---------- */
  const okioBtn = $('#okioBtn'), okioPanel = $('#okioPanel'), okioBody = $('#okioBody'),
        okioForm = $('#okioForm'), okioInput = $('#okioInput'), okioClose = $('#okioClose');

  function addMsg(text, who='bot'){
    const m = el('div', { class:`msg msg--${who}` });
    m.innerHTML = text;
    okioBody.append(m);
    okioBody.scrollTop = okioBody.scrollHeight;
    return m;
  }
  function addTyping(){
    const m = el('div', { class:'msg msg--bot msg--typing' });
    m.innerHTML = '<span></span><span></span><span></span>';
    okioBody.append(m);
    okioBody.scrollTop = okioBody.scrollHeight;
    return m;
  }

  const OKIO_RESPONSES = [
    { match:/due|deadline|return/i, reply:`You have <b>1 book due in 2 days</b> — <em>Sapiens</em>. Two others are due within 9 days. I can renew the Pragmatic Programmer for you anytime.` },
    { match:/recommend|suggest|read/i, reply:`Based on your faculty picks, I\'d try <b>Algorithms to Live By</b> next — Prof. Mehra marked it as a must read. Want me to reserve a copy?` },
    { match:/reserv|queue/i, reply:`You\'re currently <b>#3</b> for Atomic Habits and <b>#1</b> for Deep Work. Deep Work should land in your hands tomorrow.` },
    { match:/fine|money|pay/i, reply:`Your active fine is <b>₹40</b>. Head to the Fine Tracker section to settle it — or pay at any kiosk.` },
    { match:/help|navigat|guide|how/i, reply:`I can switch sections for you, set reminders, or surface a book. Try the sidebar — Dashboard, Issued, Reservations, Fines and more all live there.` },
    { match:/hours|open|timing/i, reply:`Main hall is open until <b>02:00 AM</b> during finals week (May 27 – June 5). Self-checkout kiosks pause Sunday 6–8 AM.` },
    { match:/hi|hello|hey|yo/i, reply:`Hey Aarav! 👋 I\'m OKIO, your library co-pilot. Ask me about due dates, reservations, fines, or what to read next.` }
  ];

  function okioReply(prompt){
    const hit = OKIO_RESPONSES.find(r => r.match.test(prompt));
    return hit ? hit.reply : `Got it. I\'ll dig into "<em>${prompt.replace(/</g,'&lt;')}</em>" and surface the best answer shortly. In the meantime try asking about due dates, reservations, or recommendations.`;
  }

  function openOkio(){
    if (!okioPanel.hidden) return;
    okioPanel.hidden = false;
    okioPanel.classList.remove('is-closing');
    if (!okioBody.children.length){
      addMsg(`Hi Aarav — I\'m <b>OKIO</b>, your CircuLib assistant. I can help with reservations, due dates, fines and recommendations. What\'s on your mind?`);
    }
    setTimeout(()=>okioInput.focus(), 150);
  }
  function closeOkio(){
    if (okioPanel.hidden) return;
    okioPanel.classList.add('is-closing');
    setTimeout(()=>{ okioPanel.hidden = true; okioPanel.classList.remove('is-closing'); }, 240);
  }

  okioBtn.addEventListener('click', () => okioPanel.hidden ? openOkio() : closeOkio());
  okioClose.addEventListener('click', closeOkio);

  function sendOkio(text){
    if (!text.trim()) return;
    addMsg(text, 'user');
    okioInput.value = '';
    const typing = addTyping();
    setTimeout(() => {
      typing.remove();
      addMsg(okioReply(text), 'bot');
    }, 700 + Math.random()*500);
  }

  okioForm.addEventListener('submit', e => { e.preventDefault(); sendOkio(okioInput.value); });
  $('#okioQuick').addEventListener('click', e => {
    const b = e.target.closest('button[data-q]');
    if (b){ openOkio(); sendOkio(b.dataset.q); }
  });

  /* ---------- Book modal ---------- */
  const bookModal = $('#bookModal');
  function openBookModal(b, tag){
    $('#modalCover').style.backgroundImage = `url('${b.cover}')`;
    $('#modalTitle').textContent = b.title;
    $('#modalAuthor').textContent = b.author || b.sub || '';
    $('#modalDesc').textContent = b.desc || 'A timeless read carefully curated for the CircuLib catalog.';
    $('#modalTag').textContent = tag || 'Book';
    const meta = $('#modalMeta');
    meta.innerHTML = '';
    if (b.due)      meta.append(el('span', { class:'chip chip--warn' }, `Due ${b.due}`));
    if (b.pos)      meta.append(el('span', { class:'chip' }, `Queue ${b.pos}`));
    if (b.kind)     meta.append(el('span', { class:'chip' }, b.kind));
    bookModal.hidden = false;
  }
  function closeModal(){ bookModal.hidden = true; }
  bookModal.addEventListener('click', e => { if (e.target.matches('[data-close]')) closeModal(); });

  /* ---------- Aurora parallax ---------- */
  const blobs = $$('.aurora__blob');
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - .5);
    const y = (e.clientY / window.innerHeight - .5);
    blobs.forEach((b,i) => {
      const f = (i+1) * 12;
      b.style.transform = `translate(${x*f}px, ${y*f}px)`;
    });
  });

  /* ---------- Boot ---------- */
  mountAll();
})();