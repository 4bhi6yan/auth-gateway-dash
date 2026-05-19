/* CircuLib · Faculty Dashboard JS */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  /* ---------- Data ---------- */
  const covers = ['assets/book-1.png','assets/book-2.png','assets/book-3.png','assets/book-4.png','assets/book-5.png','assets/book-6.png'];

  const issued = [
    {title:'Designing Data-Intensive Applications', author:'Martin Kleppmann', cover:covers[1], due:'12 days', tag:'On time', progress:62, type:'textbook'},
    {title:'The Art of Computer Programming, Vol. 1', author:'Donald E. Knuth', cover:covers[2], due:'4 days', tag:'Due soon', progress:88, type:'textbook', due_:true},
    {title:'Clean Architecture', author:'Robert C. Martin', cover:covers[3], due:'21 days', tag:'On time', progress:34, type:'textbook'},
    {title:'Distributed Systems', author:'Maarten van Steen', cover:covers[4], due:'2 days', tag:'Due soon', progress:91, type:'research', due_:true},
    {title:'Cryptography Engineering', author:'Niels Ferguson', cover:covers[5], due:'18 days', tag:'On time', progress:48, type:'research'},
  ];

  const recs = [
    {title:'Designing Data-Intensive Applications', cover:covers[1], note:'Essential systems reading for the Distributed Systems unit.', tags:['Systems','Required'], pickups:42, type:'textbook'},
    {title:'Pattern Recognition & Machine Learning', cover:covers[0], note:'Strong probabilistic foundation for the ML elective.', tags:['ML','Elective'], pickups:31, type:'textbook'},
    {title:'Cryptography Engineering', cover:covers[5], note:'Reference for the security capstone.', tags:['Security'], pickups:18, type:'research'},
    {title:'The Mythical Man-Month', cover:covers[3], note:'Companion reading for software engineering studio.', tags:['SE','Soft'], pickups:24, type:'journal'},
    {title:'Compilers: Principles, Techniques & Tools', cover:covers[2], note:'Dragon book — compiler design module.', tags:['Compilers'], pickups:15, type:'textbook'},
    {title:'Quantum Computing for CS', cover:covers[4], note:'Optional enrichment for theory track.', tags:['Theory','Optional'], pickups:9, type:'research'},
  ];

  const arrivals = [
    {title:'Algorithm Design Manual', tag:'New · Algorithms', cover:covers[0]},
    {title:'Operating Systems: 3 Pieces', tag:'New · Systems', cover:covers[1]},
    {title:'Computer Networking', tag:'New · Networks', cover:covers[2]},
    {title:'Modern Robotics', tag:'New · Robotics', cover:covers[3]},
    {title:'Reinforcement Learning', tag:'New · AI', cover:covers[4]},
    {title:'Probabilistic Graphical Models', tag:'New · ML', cover:covers[5]},
  ];

  const queue = [
    {title:'Designing Machine Learning Systems', meta:'2 ahead · expected in 3 days', status:'queue', label:'Queued'},
    {title:'Compilers: Principles, Techniques & Tools', meta:'Available now · pickup before Fri', status:'avail', label:'Ready'},
    {title:'Database System Concepts', meta:'4 ahead · expected next week', status:'wait', label:'Waiting'},
    {title:'Operating System Concepts', meta:'1 ahead · expected tomorrow', status:'queue', label:'Queued'},
  ];

  const reqs = [
    {title:'Request — Bulk order: Distributed Systems texts', meta:'Sent · 2 days ago', body:'Requested 25 copies of "Designing Data-Intensive Applications" for the upcoming semester intake. Awaiting publisher confirmation.'},
    {title:'Suggestion — Subscribe to ACM Digital Library', meta:'Sent · 5 days ago', body:'Recommended a full ACM subscription to support graduate research seminars.'},
    {title:'Reservation — Quantum Algorithms (3 copies)', meta:'Approved · today', body:'Reservation confirmed for the elective study group. Pickup at the main desk on Monday.'},
  ];

  const saved = [
    {title:'Clean Code', cat:'SE', cover:covers[3]},
    {title:'Deep Learning', cat:'AI', cover:covers[0]},
    {title:'Cracking the Coding Interview', cat:'Career', cover:covers[2]},
    {title:'Linkers & Loaders', cat:'Systems', cover:covers[5]},
    {title:'Refactoring', cat:'SE', cover:covers[4]},
  ];

  const anns = [
    {title:'Library extended hours for finals', when:'2 hours ago', body:'The main library will remain open 24/7 from Dec 14–22 to support exam preparation.'},
    {title:'New ACM Digital Library subscription live', when:'Yesterday', body:'Faculty members can now access the full ACM archive directly through CircuLib using your faculty credentials.'},
    {title:'Research grant: Spring 2026 applications open', when:'2 days ago', body:'The academic office is accepting research grant applications for Spring 2026 until January 31.'},
    {title:'Recommendation analytics now available', when:'1 week ago', body:'Track student pickup of your curated recommendations from the Engagement panel.'},
  ];

  const due = [
    {title:'The Art of Computer Programming, Vol. 1', meta:'Due in 4 days · Dec 22'},
    {title:'Distributed Systems', meta:'Due in 2 days · Dec 20'},
  ];

  const notifs = [
    {title:'OKIO drafted 3 new recommendations', meta:'Just now'},
    {title:'Student Aarav D. requested a meeting', meta:'1 hr ago'},
    {title:'Library: your reservation is ready', meta:'3 hr ago'},
    {title:'New journal added: IEEE Trans. AI', meta:'Yesterday'},
  ];

  /* ---------- Renderers ---------- */
  $('#fcIssuedList').innerHTML = issued.map(b => `
    <div class="fc-issued" data-type="${b.type}">
      <div class="fc-issued__cover"><img src="${b.cover}" alt=""/></div>
      <div class="fc-issued__meta">
        <strong>${b.title}</strong>
        <small>${b.author} · Due in ${b.due}</small>
        <div class="fc-issued__progress"><span style="width:${b.progress}%"></span></div>
      </div>
      <span class="fc-issued__tag ${b.due_?'due':''}">${b.tag}</span>
    </div>`).join('');

  $('#fcRecGrid').innerHTML = recs.map(r => `
    <div class="fc-rec" data-type="${r.type}">
      <div class="fc-rec__cover"><img src="${r.cover}" alt=""/></div>
      <div class="fc-rec__title">${r.title}</div>
      <div class="fc-rec__note">${r.note}</div>
      <div class="fc-rec__tags">${r.tags.map(t=>`<span>${t}</span>`).join('')}</div>
      <div class="fc-rec__foot"><span>${r.pickups} pickups</span><em>Visible to students</em></div>
    </div>`).join('');

  $('#fcArrivals').innerHTML = arrivals.map(a => `
    <div class="fc-arrival"><img src="${a.cover}" alt=""/><div class="fc-arrival__overlay"><strong>${a.title}</strong><small>${a.tag}</small></div></div>`).join('');

  $('#fcQueue').innerHTML = queue.map(q => `
    <li><div><strong>${q.title}</strong><small>${q.meta}</small></div><span class="fc-status ${q.status}">${q.label}</span></li>`).join('');

  $('#fcReqs').innerHTML = reqs.map(r => `
    <li><details><summary>${r.title}<small style="display:block;font-size:11px;color:var(--fc-ink-dim);font-weight:400;margin-top:3px">${r.meta}</small></summary><p>${r.body}</p></details></li>`).join('');

  $('#fcSaved').innerHTML = saved.map(s => `
    <div class="fc-saved__item"><div class="fc-saved__cover"><img src="${s.cover}" alt=""/></div><strong>${s.title}</strong><small>${s.cat}</small></div>`).join('');

  $('#fcAnns').innerHTML = anns.map(a => `
    <details><summary>${a.title}<small>${a.when}</small></summary><p>${a.body}</p></details>`).join('');

  /* ---------- Engagement chart ---------- */
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const vals = [42,58,49,72,86,61,54];
  $('#fcEngageChart').innerHTML = days.map((d,i) =>
    `<div class="fc-engage__bar"><i style="height:${vals[i]}%"></i><span>${d}</span></div>`).join('');

  /* ---------- Sidebar nav ---------- */
  $$('.fc-nav__item').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    $$('.fc-nav__item').forEach(x => x.classList.remove('is-active'));
    a.classList.add('is-active');
    const sec = a.dataset.section;
    const map = {dashboard:null, issued:'#fcIssued', recommend:'.fc-rec-grid', academic:'.fc-cats', reservations:'#fcQueue', requests:'#fcReqs', arrivals:'#fcArrivals', research:'.fc-research-list', notifications:null, announcements:'#fcAnns', guidelines:'#fcAcc', saved:'#fcSaved'};
    const sel = map[sec];
    if (sel && $(sel)) $(sel).scrollIntoView({behavior:'smooth', block:'start'});
  }));
  $$('[data-section-go]').forEach(b => b.addEventListener('click', () => {
    const target = b.dataset.sectionGo;
    const item = $(`.fc-nav__item[data-section="${target}"]`);
    if (item) item.click();
  }));

  /* ---------- Topbar filter chips ---------- */
  $$('.fc-chip').forEach(c => c.addEventListener('click', () => {
    $$('.fc-chip').forEach(x => x.classList.remove('is-active'));
    c.classList.add('is-active');
    const f = c.dataset.filter;
    $$('.fc-rec, .fc-issued').forEach(el => {
      el.style.display = (f === 'all' || el.dataset.type === f) ? '' : 'none';
    });
  }));
  $('.fc-chip[data-filter="all"]').classList.add('is-active');

  /* ---------- Search ---------- */
  const searchData = [
    ...recs.map(r => ({title:r.title, kind:'Recommendation'})),
    ...issued.map(i => ({title:i.title, kind:'Issued'})),
    ...arrivals.map(a => ({title:a.title, kind:'New arrival'})),
    {title:'Aarav Deshmukh', kind:'Student'}, {title:'Maya Iyer', kind:'Student'}, {title:'Leon Park', kind:'Student'},
    {title:'Attention Is All You Need', kind:'Research paper'}, {title:'BERT: Pre-training of Deep Bidirectional', kind:'Research paper'},
  ];
  const sInput = $('#fcSearch'), sDrop = $('#fcSearchDropdown');
  const renderSearch = q => {
    if (!q) { sDrop.classList.remove('is-open'); return; }
    const list = searchData.filter(x => x.title.toLowerCase().includes(q.toLowerCase())).slice(0,7);
    if (!list.length) { sDrop.innerHTML = `<div class="res"><span>No matches for "${q}"</span></div>`; }
    else sDrop.innerHTML = list.map(r => `<div class="res"><span>${r.title}</span><small>${r.kind}</small></div>`).join('');
    sDrop.classList.add('is-open');
  };
  sInput.addEventListener('input', e => renderSearch(e.target.value.trim()));
  document.addEventListener('click', e => {
    if (!e.target.closest('.fc-search')) sDrop.classList.remove('is-open');
  });

  /* ---------- Add recommendation (demo) ---------- */
  $('#fcAddRec').addEventListener('click', () => {
    openModal('Add Recommendation', `<p style="color:var(--fc-ink-dim);font-size:13px;line-height:1.55;margin:0 0 14px">Compose a quick recommendation to surface to your enrolled students.</p>
      <input id="fcNewTitle" placeholder="Book title" style="width:100%;padding:11px 14px;border-radius:10px;background:rgba(12,17,31,.6);border:1px solid var(--fc-line);color:var(--fc-ink);font-size:13px;margin-bottom:10px;outline:0"/>
      <input id="fcNewNote" placeholder="One-line academic note" style="width:100%;padding:11px 14px;border-radius:10px;background:rgba(12,17,31,.6);border:1px solid var(--fc-line);color:var(--fc-ink);font-size:13px;margin-bottom:14px;outline:0"/>
      <button class="fc-btn fc-btn--primary" id="fcNewSave" style="width:100%;justify-content:center">Publish to students</button>`, 'Recommendation');
    setTimeout(() => $('#fcNewSave')?.addEventListener('click', () => {
      const t = $('#fcNewTitle').value.trim() || 'Untitled recommendation';
      const n = $('#fcNewNote').value.trim() || 'Curated by Dr. Reyna';
      const cover = covers[Math.floor(Math.random()*covers.length)];
      $('#fcRecGrid').insertAdjacentHTML('afterbegin', `
        <div class="fc-rec" data-type="textbook" style="animation:fcSlide .35s ease">
          <div class="fc-rec__cover"><img src="${cover}" alt=""/></div>
          <div class="fc-rec__title">${t}</div>
          <div class="fc-rec__note">${n}</div>
          <div class="fc-rec__tags"><span>New</span><span>Curated</span></div>
          <div class="fc-rec__foot"><span>0 pickups</span><em>Visible to students</em></div>
        </div>`);
      closeModal();
    }, 30));
  });

  /* ---------- Modal ---------- */
  const modal = $('#fcModal');
  function openModal(title, html, kicker='Info'){
    $('#fcModalKicker').textContent = kicker;
    $('#fcModalTitle').textContent = title;
    $('#fcModalBody').innerHTML = html;
    modal.classList.add('is-open');
  }
  function closeModal(){ modal.classList.remove('is-open'); }
  modal.addEventListener('click', e => { if (e.target.dataset.close !== undefined) closeModal(); });

  $$('[data-modal]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.modal;
    if (k === 'due') openModal('Due soon', `<ul>${due.map(d=>`<li><strong>${d.title}</strong><small>${d.meta}</small></li>`).join('')}</ul>`, 'Alerts');
    if (k === 'notif') openModal('Notifications', `<ul>${notifs.map(n=>`<li><strong>${n.title}</strong><small>${n.meta}</small></li>`).join('')}</ul>`, 'Inbox');
  }));

  /* ---------- OKIO ---------- */
  const panel = $('#fcOkioPanel'), body = $('#fcOkioBody'), form = $('#fcOkioForm'), input = $('#fcOkioInput');
  const toggle = open => panel.classList[open ? 'add' : 'remove']('is-open');
  $('#fcOkioFab').addEventListener('click', () => toggle(!panel.classList.contains('is-open')));
  $('#fcOkioOpen').addEventListener('click', () => toggle(true));
  $('#fcOkioClose').addEventListener('click', () => toggle(false));

  const responses = [
    "Based on this semester's syllabus, I'd surface 'Designing Data-Intensive Applications' to your distributed systems cohort. Want me to draft the recommendation note?",
    "Three students bookmarked 'Cryptography Engineering' but haven't borrowed it yet. I can nudge them with a short academic note from you.",
    "Trending in your faculty network: papers on retrieval-augmented generation. Want a curated list?",
    "I've drafted 3 candidate recommendations from your saved resources — open the Recommendations panel to review.",
    "The Quantum Algorithms reservation queue has 4 students. I can move it up if you'd like to prioritize the elective group.",
  ];
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim(); if (!v) return;
    body.insertAdjacentHTML('beforeend', `<div class="fc-msg user">${v}</div>`);
    input.value = '';
    body.scrollTop = body.scrollHeight;
    setTimeout(() => {
      const r = responses[Math.floor(Math.random()*responses.length)];
      body.insertAdjacentHTML('beforeend', `<div class="fc-msg bot">${r}</div>`);
      body.scrollTop = body.scrollHeight;
    }, 600);
  });

  /* ---------- ESC closes everything ---------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); toggle(false); }
  });
})();