/* ===== CircuLib · Publisher Dashboard ===== */
(() => {
  const BOOKS = [
    { id:1, title:'Cosmos', author:'Carl Sagan', cat:'Science', req:128, img:'assets/book-1.png', tag:'top' },
    { id:2, title:'The Pragmatic Programmer', author:'Hunt & Thomas', cat:'CS', req:96, img:'assets/book-2.png', tag:'top' },
    { id:3, title:'Atomic Habits', author:'James Clear', cat:'Self-help', req:212, img:'assets/book-3.png', tag:'featured' },
    { id:4, title:'Sapiens', author:'Yuval N. Harari', cat:'History', req:84, img:'assets/book-4.png', tag:'top' },
    { id:5, title:'Clean Architecture', author:'Robert C. Martin', cat:'CS', req:71, img:'assets/book-5.png', tag:'new' },
    { id:6, title:'Designing Data-Intensive Apps', author:'Martin Kleppmann', cat:'CS', req:154, img:'assets/book-6.png', tag:'featured' },
    { id:7, title:'Deep Work', author:'Cal Newport', cat:'Self-help', req:62, img:'assets/book-1.png', tag:'new' },
    { id:8, title:'The Design of Everyday Things', author:'Don Norman', cat:'Design', req:48, img:'assets/book-2.png', tag:'new' },
  ];

  const LIBS = [
    { name:'Central City Library', region:'Mumbai, IN', type:'public', readers:'2.4K', status:'ok', tags:['Public','General'] },
    { name:'NIT Tech Library', region:'Trichy, IN', type:'academic', readers:'1.8K', status:'ok', tags:['Academic','CS'] },
    { name:'Riverside Public', region:'Pune, IN', type:'public', readers:'3.1K', status:'pending', tags:['Public','Fiction'] },
    { name:'St. Xavier Archive', region:'Kolkata, IN', type:'private', readers:'920', status:'ok', tags:['Private','Research'] },
    { name:'Maple Grove Library', region:'Bangalore, IN', type:'public', readers:'4.0K', status:'pending', tags:['Public'] },
    { name:'Greenfield Univ.', region:'Delhi, IN', type:'academic', readers:'2.2K', status:'ok', tags:['Academic'] },
    { name:'Harbor City Library', region:'Chennai, IN', type:'public', readers:'1.5K', status:'pending', tags:['Public'] },
    { name:'IIT Bombay Library', region:'Mumbai, IN', type:'academic', readers:'3.4K', status:'ok', tags:['Academic','Science'] },
  ];

  const REQUESTS = [
    { id:1, dir:'received', user:'Central City Library', meta:'Mumbai · Public', detail:'12 copies of Cosmos', status:'pending' },
    { id:2, dir:'received', user:'NIT Tech Library', meta:'Trichy · Academic', detail:'Bulk · DDIA (8 copies)', status:'pending' },
    { id:3, dir:'received', user:'IIT Bombay Library', meta:'Mumbai · Academic', detail:'Restock · Clean Architecture', status:'approved' },
    { id:4, dir:'sent', user:'Riverside Public', meta:'Pune · Public', detail:'Catalog sync proposal · 24 titles', status:'pending' },
    { id:5, dir:'sent', user:'Maple Grove Library', meta:'Bangalore', detail:'Partnership pitch', status:'pending' },
    { id:6, dir:'sent', user:'Greenfield Univ.', meta:'Delhi', detail:'New title launch · Deep Work', status:'approved' },
    { id:7, dir:'received', user:'St. Xavier Archive', meta:'Kolkata', detail:'Research collection inquiry', status:'pending' },
    { id:8, dir:'sent', user:'Harbor City Library', meta:'Chennai', detail:'Quarterly restock', status:'pending' },
    { id:9, dir:'received', user:'Maple Grove Library', meta:'Bangalore', detail:'Fiction collection request', status:'approved' },
  ];

  const TRENDS = [
    { name:'Science', pct:'+32%', sub:'Cosmos, Sapiens leading' },
    { name:'Computer Science', pct:'+28%', sub:'DDIA, Clean Arch surging' },
    { name:'Self-help', pct:'+24%', sub:'Atomic Habits dominant' },
    { name:'Design', pct:'+18%', sub:'DOET steady climb' },
    { name:'History', pct:'+14%', sub:'Sapiens consistent' },
    { name:'Philosophy', pct:'+9%', sub:'Slow but rising' },
  ];

  const ANNOUNCEMENTS = [
    { title:'New analytics module live', date:'Today', body:'Per-library demand forecasting is now in beta. Visit Analytics → Forecast to enable.' },
    { title:'Partnership program expanded', date:'2d ago', body:'48 new academic libraries joined CircuLib this week — discover them in the Network view.' },
    { title:'Trending insights weekly', date:'1w ago', body:'Subscribe to the Tuesday digest for category surges and acquisition opportunities.' },
  ];

  document.addEventListener('DOMContentLoaded', () => {
    setDate();
    wireNav();
    wireTopbar();
    wireSearch();
    renderInterest();
    renderReach();
    renderCatChart();
    renderEngChart();
    renderRequests('received');
    renderSideReqs();
    renderTopBooks();
    renderTrends();
    renderConnections();
    renderLibs('all');
    renderPubs('all');
    renderNotifFull();
    renderAnnouncements();
    wireReqTabs();
    wireLibFilters();
    wirePubFilters();
    wireMap();
    wireUpload();
    wireOkio();
    wireParallax();
  });

  function setDate(){
    const el = document.getElementById('todayDate');
    if (el) el.textContent = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
  }

  /* Nav */
  function wireNav(){
    document.querySelectorAll('[data-section]').forEach(el=>{
      el.addEventListener('click',e=>{
        e.preventDefault();
        const name = el.dataset.section;
        document.querySelectorAll('.nav__item').forEach(n=>n.classList.toggle('is-active',n.dataset.section===name));
        document.querySelectorAll('.view').forEach(v=>v.classList.toggle('is-active',v.dataset.view===name));
        window.scrollTo({top:0,behavior:'smooth'});
      });
    });
  }

  /* Topbar */
  function wireTopbar(){
    const nb = document.getElementById('notifBtn');
    const np = document.getElementById('notifPanel');
    nb.addEventListener('click',e=>{e.stopPropagation();np.hidden=!np.hidden});
    document.addEventListener('click',e=>{if(!np.contains(e.target)&&e.target!==nb)np.hidden=true});
    document.getElementById('markAllRead').addEventListener('click',()=>{
      document.querySelector('.notif-dot').style.display='none';
      toast('All notifications marked as read');
    });
    document.getElementById('quickUploadBtn').addEventListener('click',()=>{
      document.querySelector('.nav__item[data-section="upload"]').click();
    });
  }

  /* Search */
  function wireSearch(){
    const input = document.getElementById('globalSearch');
    const dd = document.getElementById('searchDropdown');
    const pool = [
      ...BOOKS.map(b=>({type:'Book',title:b.title,sub:b.author})),
      ...LIBS.map(l=>({type:'Library',title:l.name,sub:l.region})),
    ];
    input.addEventListener('input',()=>{
      const q = input.value.trim().toLowerCase();
      if(!q){dd.hidden=true;return}
      const matches = pool.filter(p=>p.title.toLowerCase().includes(q)).slice(0,6);
      dd.innerHTML = matches.length
        ? matches.map(m=>`<div class="res"><div>${m.title}<br><span>${m.sub}</span></div><span>${m.type}</span></div>`).join('')
        : `<div class="res"><div>No results for "${q}"</div></div>`;
      dd.hidden=false;
    });
    document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus()}});
    document.addEventListener('click',e=>{if(!dd.contains(e.target)&&e.target!==input)dd.hidden=true});
  }

  /* Charts */
  function bars(elId, labels){
    const el = document.getElementById(elId); if(!el) return;
    el.innerHTML = labels.map(l=>{
      const a = 40+Math.random()*130;
      return `<div class="bar-col"><div class="bar-col__bars"><i style="height:${a}px"></i></div><span>${l}</span></div>`;
    }).join('');
  }
  function renderInterest(){ bars('interestChart', ['Sci','CS','Self','Hist','Design','Phil','Fic']); }
  function renderReach(){ bars('reachChart', ['J','F','M','A','M','J','J','A','S','O','N','D']); }
  function renderCatChart(){ bars('catChart', ['Sci','CS','Self','Hist','Design','Phil']); }
  function renderEngChart(){ bars('engChart', ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']); }

  /* Requests */
  function wireReqTabs(){
    document.querySelectorAll('#reqTabs .tab').forEach(t=>{
      t.addEventListener('click',()=>{
        document.querySelectorAll('#reqTabs .tab').forEach(x=>x.classList.remove('is-active'));
        t.classList.add('is-active');
        renderRequests(t.dataset.tab);
      });
    });
  }
  function renderRequests(filter){
    const list = document.getElementById('reqMainList');
    let items;
    if (filter==='pending') items = REQUESTS.filter(r=>r.status==='pending');
    else if (filter==='approved') items = REQUESTS.filter(r=>r.status==='approved');
    else items = REQUESTS.filter(r=>r.dir===filter);
    list.innerHTML = items.map(r=>`
      <li data-id="${r.id}">
        <div class="req-main">
          <strong>${r.user}</strong>
          <span>${r.meta} · ${r.detail}</span>
          <span class="req-tag">${r.dir} · ${r.status}</span>
        </div>
        <div class="req-actions">
          <button class="btn btn--ghost btn--sm" data-action="reject">Reject</button>
          <button class="btn btn--primary btn--sm" data-action="accept">${r.dir==='sent'?'Withdraw':'Accept'}</button>
        </div>
      </li>`).join('') || '<li><div class="req-main"><span>No requests in this view.</span></div></li>';
    list.querySelectorAll('button[data-action]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const li = e.target.closest('li');
        li.style.transition='all .25s';li.style.opacity='0';li.style.transform='translateX(20px)';
        setTimeout(()=>li.remove(),250);
        toast(btn.dataset.action==='accept'?'Action confirmed ✓':'Request rejected');
      });
    });
  }
  function renderSideReqs(){
    const sent = REQUESTS.filter(r=>r.dir==='sent').slice(0,4);
    const rec = REQUESTS.filter(r=>r.dir==='received').slice(0,4);
    const render = (items)=>items.map(r=>`
      <li><div class="req-main"><strong>${r.user}</strong><span>${r.meta} · ${r.detail}</span></div>
      <div class="req-actions"><button class="btn btn--ghost btn--sm">Reject</button><button class="btn btn--primary btn--sm">${r.dir==='sent'?'Resend':'Accept'}</button></div></li>`).join('');
    document.getElementById('sentList').innerHTML = render(sent);
    document.getElementById('receivedList').innerHTML = render(rec);
  }

  /* Top books */
  function renderTopBooks(){
    const items = [...BOOKS].sort((a,b)=>b.req-a.req).slice(0,5);
    const html = items.map(b=>`
      <div class="pop"><img src="${b.img}" alt="${b.title}"/>
        <div><strong>${b.title}</strong><span>${b.author} · ${b.cat}</span></div>
        <em>${b.req}</em></div>`).join('');
    const el = document.getElementById('topBooks'); if (el) el.innerHTML = html;
    const el2 = document.getElementById('anaTop'); if (el2) el2.innerHTML = html;
  }

  /* Trends */
  function renderTrends(){
    const html = TRENDS.map(t=>`<div class="trend"><strong>${t.name}</strong><span>${t.sub}</span><em>${t.pct}</em></div>`).join('');
    const a = document.getElementById('trendGrid'); if(a) a.innerHTML = html;
    const b = document.getElementById('trendGrid2'); if(b) b.innerHTML = html;
  }

  /* Connections */
  function renderConnections(){
    const items = LIBS.map(l=>({
      initials: l.name.split(' ').map(w=>w[0]).slice(0,2).join(''),
      name:l.name, region:l.region, status:l.status
    }));
    const html = items.map(c=>`
      <div class="conn">
        <div class="conn__avatar">${c.initials}</div>
        <div class="conn__meta"><strong>${c.name}</strong><span>${c.region}</span></div>
        <span class="conn__status ${c.status}">${c.status==='ok'?'Active':'Pending'}</span>
      </div>`).join('');
    const a = document.getElementById('connGrid'); if(a) a.innerHTML = items.slice(0,4).map(c=>`
      <div class="conn"><div class="conn__avatar">${c.initials}</div>
      <div class="conn__meta"><strong>${c.name}</strong><span>${c.region}</span></div>
      <span class="conn__status ${c.status}">${c.status==='ok'?'Active':'Pending'}</span></div>`).join('');
    const b = document.getElementById('connGridFull'); if(b) b.innerHTML = html;
  }

  /* Libraries */
  function renderLibs(filter){
    const el = document.getElementById('libList'); if(!el) return;
    const q = (document.getElementById('libSearch')?.value||'').toLowerCase();
    let items = LIBS;
    if (filter!=='all') items = items.filter(l=>l.type===filter);
    if (q) items = items.filter(l=>l.name.toLowerCase().includes(q)||l.region.toLowerCase().includes(q));
    el.innerHTML = items.map(l=>`
      <div class="lib-card" data-name="${l.name}" data-meta="${l.region} · ${l.type}">
        <strong>${l.name}</strong>
        <span class="conn__status ${l.status}">${l.status==='ok'?'Connected':'Discover'}</span>
        <div class="meta">${l.region} · ${l.readers} readers</div>
        <div class="tags">${l.tags.map(t=>`<span>${t}</span>`).join('')}</div>
      </div>`).join('') || '<div class="lib-card"><strong>No libraries match.</strong></div>';
    el.querySelectorAll('.lib-card').forEach(card=>{
      card.addEventListener('click',()=>openLibModal(card.dataset.name, card.dataset.meta));
    });
  }
  function wireLibFilters(){
    document.querySelectorAll('[data-libfilter]').forEach(c=>{
      c.addEventListener('click',()=>{
        document.querySelectorAll('[data-libfilter]').forEach(x=>x.classList.remove('is-active'));
        c.classList.add('is-active');
        renderLibs(c.dataset.libfilter);
      });
    });
    document.getElementById('libSearch')?.addEventListener('input',()=>{
      const active = document.querySelector('[data-libfilter].is-active');
      renderLibs(active?.dataset.libfilter||'all');
    });
  }

  /* Publications */
  function renderPubs(filter){
    const el = document.getElementById('pubGrid'); if(!el) return;
    let items = BOOKS;
    if (filter==='top') items = [...items].sort((a,b)=>b.req-a.req).slice(0,4);
    else if (filter==='new') items = items.filter(b=>b.tag==='new');
    else if (filter==='featured') items = items.filter(b=>b.tag==='featured');
    el.innerHTML = items.map(b=>`
      <div class="pub-card glass">
        <img src="${b.img}" alt="${b.title}"/>
        <strong>${b.title}</strong><span>${b.author}</span>
        <div class="pub-card__meta"><span>${b.cat}</span><em>${b.req} req</em></div>
      </div>`).join('');
  }
  function wirePubFilters(){
    document.querySelectorAll('[data-pubfilter]').forEach(c=>{
      c.addEventListener('click',()=>{
        document.querySelectorAll('[data-pubfilter]').forEach(x=>x.classList.remove('is-active'));
        c.classList.add('is-active');
        renderPubs(c.dataset.pubfilter);
      });
    });
  }

  /* Map */
  function wireMap(){
    document.querySelectorAll('.pub-map__pin').forEach(p=>{
      p.addEventListener('click',()=>openLibModal(p.dataset.name,'Discoverable library'));
    });
  }

  /* Library modal */
  function openLibModal(name, meta){
    const m = document.getElementById('libModal');
    document.getElementById('libModalName').textContent = name;
    document.getElementById('libModalMeta').textContent = meta;
    m.hidden = false;
  }
  document.addEventListener('click',e=>{
    if (e.target.matches('[data-close]')) document.getElementById('libModal').hidden = true;
  });

  /* Notifications full */
  function renderNotifFull(){
    const items = [
      {dot:'info',title:'Central City Library',sub:'requested 12 copies of "Cosmos"',time:'2m'},
      {dot:'ok',title:'NIT Tech Library',sub:'approved your catalog sync',time:'18m'},
      {dot:'warn',title:'Trending alert',sub:'"Self-help" is up 24% this week',time:'1h'},
      {dot:'info',title:'Upload complete',sub:'"Deep Work" published to 14 libraries',time:'3h'},
      {dot:'ok',title:'IIT Bombay Library',sub:'partnership confirmed',time:'1d'},
      {dot:'info',title:'New library nearby',sub:'Greenfield Univ. is discoverable',time:'2d'},
    ];
    const el = document.getElementById('notifFull'); if(!el) return;
    el.innerHTML = items.map(i=>`<li><i class="dot dot--${i.dot}"></i><div><strong>${i.title}</strong><span>${i.sub}</span></div><em>${i.time}</em></li>`).join('');
  }

  /* Announcements */
  function renderAnnouncements(){
    const el = document.getElementById('announceList'); if(!el) return;
    el.innerHTML = ANNOUNCEMENTS.map(a=>`
      <details class="announce">
        <summary>${a.title} <em>${a.date}</em></summary>
        <p>${a.body}</p>
      </details>`).join('');
  }

  /* Upload */
  function wireUpload(){
    const dz = document.getElementById('dropzone');
    const input = document.getElementById('fileInput');
    const prog = document.getElementById('uploadProgress');
    const bar = document.getElementById('upBar');
    const pct = document.getElementById('upPct');
    const name = document.getElementById('upFileName');
    if (!dz) return;
    dz.addEventListener('click',()=>input.click());
    ['dragover','dragenter'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('is-drag')}));
    ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('is-drag')}));
    dz.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)simulate(f.name)});
    input.addEventListener('change',()=>{if(input.files[0])simulate(input.files[0].name)});
    function simulate(n){
      name.textContent = n; prog.hidden=false; let p=0;
      const id=setInterval(()=>{
        p+=Math.random()*18; if(p>=100){p=100;clearInterval(id);toast('Upload complete ✓')}
        bar.style.width=p+'%'; pct.textContent=Math.round(p)+'%';
      },180);
    }
    document.getElementById('uploadForm').addEventListener('submit',e=>{
      e.preventDefault(); toast('Published to network ✓');
    });
  }

  /* OKIO */
  function wireOkio(){
    const btn = document.getElementById('okioBtn');
    const panel = document.getElementById('okioPanel');
    const close = document.getElementById('okioClose');
    const form = document.getElementById('okioForm');
    const input = document.getElementById('okioInput');
    const body = document.getElementById('okioBody');
    btn.addEventListener('click',()=>{panel.hidden=false;input.focus()});
    close.addEventListener('click',()=>{panel.hidden=true});
    document.querySelectorAll('#okioSuggest button').forEach(b=>b.addEventListener('click',()=>send(b.textContent)));
    form.addEventListener('submit',e=>{e.preventDefault();const v=input.value.trim();if(!v)return;send(v);input.value=''});
    function send(t){add(t,'user');setTimeout(()=>add(reply(t),'bot'),600)}
    function add(t,k){const d=document.createElement('div');d.className=`okio-msg okio-msg--${k}`;d.textContent=t;body.appendChild(d);body.scrollTop=body.scrollHeight}
    function reply(q){
      const s=q.toLowerCase();
      if(s.includes('target')||s.includes('which lib'))return 'Top targets: Central City (high Cosmos demand), NIT Tech (CS surge), and Maple Grove (untapped fiction reach).';
      if(s.includes('trend')||s.includes('category'))return 'Science is leading at +32% this week, followed by CS at +28%. Atomic Habits is dominating Self-help.';
      if(s.includes('pitch')||s.includes('draft'))return 'Drafted: "Hi {library}, our catalog has 24 titles aligned with your readership. Would you like a 30-day trial sync?" Ready to send?';
      if(s.includes('reach')||s.includes('audience'))return 'Monthly reach is 48.2K (+12%). 62% students, 24% faculty. Cosmos is your highest-reach title.';
      if(s.includes('hi')||s.includes('hello'))return 'Hi! I can surface library demand, draft pitches, or explain trends. What do you need?';
      return 'I can help with library targeting, trend insights, pitches, and analytics. Try a suggestion above.';
    }
  }

  /* Parallax */
  function wireParallax(){
    const blobs = document.querySelectorAll('.aurora__blob');
    window.addEventListener('mousemove',e=>{
      const x=(e.clientX/innerWidth-.5)*30, y=(e.clientY/innerHeight-.5)*30;
      blobs.forEach((b,i)=>{const f=(i+1)*.4;b.style.transform=`translate(${x*f}px,${y*f}px)`});
    });
  }

  /* Toast */
  let tt;
  function toast(m){const el=document.getElementById('toast');el.textContent=m;el.hidden=false;clearTimeout(tt);tt=setTimeout(()=>el.hidden=true,2400)}
})();
