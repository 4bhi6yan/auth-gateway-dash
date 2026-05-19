/* ============================================
   CircuLib — Interactions
   ============================================ */

/* ---------- Floating particles in background ---------- */
(function spawnParticles(){
  const layer = document.getElementById('particles');
  if(!layer) return;
  const count = window.innerWidth < 700 ? 18 : 36;
  for(let i=0;i<count;i++){
    const p = document.createElement('span');
    p.className = 'particle';
    p.style.left = Math.random()*100 + '%';
    p.style.bottom = '-10px';
    p.style.opacity = (0.3 + Math.random()*0.6).toString();
    p.style.animationDuration = (12 + Math.random()*18) + 's';
    p.style.animationDelay = (-Math.random()*20) + 's';
    p.style.transform = `scale(${0.6 + Math.random()*1.4})`;
    layer.appendChild(p);
  }
})();

/* ---------- Navbar scroll state + active link ---------- */
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link');
const sections = ['home','features','okio','login'].map(id => document.getElementById(id));

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);

  // active section detection
  let current = 'home';
  for(const s of sections){
    if(!s) continue;
    const top = s.getBoundingClientRect().top;
    if(top < window.innerHeight * 0.35) current = s.id;
  }
  navLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
});

/* ---------- Reveal-on-scroll using IntersectionObserver ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Login: role selection ---------- */
document.querySelectorAll('.role').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.role').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ---------- OKIO Chatbot ---------- */
const chatBody = document.getElementById('chatBody');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

const responses = [
  { match: ['feature','what','do','offer'], reply: "CircuLib offers QR-powered borrowing, a publisher marketplace, and three role-based dashboards in one elegant ecosystem." },
  { match: ['qr','scan','code'],            reply: "Librarians generate QR codes for every book — students scan to reserve, queue, request issuing, or leave reviews." },
  { match: ['publisher','market'],          reply: "Publishers can build profiles, discover nearby libraries, and connect directly with librarians on CircuLib." },
  { match: ['login','sign','account','register'], reply: "Head to the Login section below — choose your role: Student, Faculty, Librarian, or Publisher." },
  { match: ['hello','hi','hey'],            reply: "Hello! 🌿 I'm OKIO. Ask me about features, roles, or how CircuLib works." },
  { match: ['contact','email','phone','reach'], reply: "You can reach us at circulib26@gmail.com or call 1100223344." },
  { match: ['who','okio','you'],            reply: "I'm OKIO — your smart library companion. I help you navigate CircuLib." },
];

function botReply(text){
  const lower = text.toLowerCase();
  for(const r of responses){
    if(r.match.some(k => lower.includes(k))) return r.reply;
  }
  return "Great question! CircuLib unifies students, librarians and publishers — try asking about features, QR access, or the publisher marketplace.";
}

function appendMsg(text, who){
  const m = document.createElement('div');
  m.className = 'msg ' + who;
  m.textContent = text;
  chatBody.appendChild(m);
  chatBody.scrollTop = chatBody.scrollHeight;
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = chatInput.value.trim();
  if(!v) return;
  appendMsg(v, 'user');
  chatInput.value = '';
  setTimeout(() => appendMsg(botReply(v), 'bot'), 500);
});

/* ---------- Floating chat bubble: slide in + open popover ---------- */
const bubble = document.getElementById('chatBubble');
const chatPop = document.getElementById('chatPop');
const chatPopClose = document.getElementById('chatPopClose');
const chatPopForm = document.getElementById('chatPopForm');
const chatPopInput = document.getElementById('chatPopInput');
const chatPopBody = document.getElementById('chatPopBody');

setTimeout(() => bubble.classList.add('in'), 1800);

function appendPopMsg(text, who){
  const m = document.createElement('div');
  m.className = 'msg ' + who;
  m.textContent = text;
  chatPopBody.appendChild(m);
  chatPopBody.scrollTop = chatPopBody.scrollHeight;
}

function togglePop(force){
  const willOpen = force !== undefined ? force : !chatPop.classList.contains('open');
  chatPop.classList.toggle('open', willOpen);
  chatPop.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
  if(willOpen) setTimeout(() => chatPopInput && chatPopInput.focus(), 200);
}

bubble.addEventListener('click', (e) => { e.stopPropagation(); togglePop(); });
chatPopClose.addEventListener('click', () => togglePop(false));
document.addEventListener('click', (e) => {
  if(!chatPop.classList.contains('open')) return;
  if(chatPop.contains(e.target) || bubble.contains(e.target)) return;
  togglePop(false);
});
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') togglePop(false); });

chatPopForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = chatPopInput.value.trim();
  if(!v) return;
  appendPopMsg(v, 'user');
  chatPopInput.value = '';
  setTimeout(() => appendPopMsg(botReply(v), 'bot'), 500);
});

/* ---------- Login auth tabs ---------- */
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const which = tab.dataset.tab;
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === which));
    const tabs = document.querySelector('.auth-tabs');
    if(tabs) tabs.dataset.active = which;
  });
});

/* ---------- Role pills (both panels) ---------- */
document.querySelectorAll('.auth-panel').forEach(panel => {
  panel.querySelectorAll('.role-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.role-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

/* ---------- Feature chips: click to open detail modal ---------- */
const chipDetails = {
  'Reserve': { kicker:'QR Access', title:'Reserve', body:'Hold any title in seconds. Scan a QR code and a copy is reserved in your name — no waiting at the desk, no paperwork.' },
  'Queue':   { kicker:'QR Access', title:'Smart Queue', body:'When a book is unavailable, join its live queue. CircuLib notifies you the moment a copy is ready for pickup.' },
  'Issue':   { kicker:'QR Access', title:'Instant Issuing', body:'Approved requests turn into one-tap issuing for librarians — fully digital, fully tracked, fully effortless.' },
  'Review':  { kicker:'QR Access', title:'Reader Reviews', body:'Share ratings and reviews directly from the book’s QR. Build a living, community-driven catalogue.' },
  'Profiles':  { kicker:'Marketplace', title:'Publisher Profiles', body:'Publishers craft rich profiles with catalogues, imprints and contact details — visible to every verified library.' },
  'Discovery': { kicker:'Marketplace', title:'Library Discovery', body:'Find nearby libraries by region, specialization or institution and reach decision-makers in one click.' },
  'Proposals': { kicker:'Marketplace', title:'Catalogue Proposals', body:'Send curated catalogue proposals straight to librarians and track responses in real time.' },
  'Ratings':   { kicker:'Marketplace', title:'Trusted Ratings', body:'Librarians rate publishers based on quality and service — building a transparent academic marketplace.' },
  'Librarian': { kicker:'Dashboards', title:'Librarian Dashboard', body:'A cinematic control room: inventory, issuing, returns, queues and analytics — all in one orchestrated view.' },
  'Student':   { kicker:'Dashboards', title:'Student Dashboard', body:'Track borrowed books, queues, due dates and recommendations curated for your course and interests.' },
  'Publisher': { kicker:'Dashboards', title:'Publisher Dashboard', body:'Manage catalogues, monitor library outreach, and view engagement analytics from a single elegant panel.' },
};

const chipModal = document.getElementById('chipModal');
const chipModalKicker = document.getElementById('chipModalKicker');
const chipModalTitle = document.getElementById('chipModalTitle');
const chipModalBody = document.getElementById('chipModalBody');

function openChipModal(key){
  const d = chipDetails[key];
  if(!d) return;
  chipModalKicker.textContent = d.kicker;
  chipModalTitle.textContent = d.title;
  chipModalBody.textContent = d.body;
  chipModal.classList.add('open');
  chipModal.setAttribute('aria-hidden','false');
}
function closeChipModal(){
  chipModal.classList.remove('open');
  chipModal.setAttribute('aria-hidden','true');
}

document.querySelectorAll('.feature-card .chips li, .feature-card .dash-previews span').forEach(el => {
  el.setAttribute('role','button');
  el.setAttribute('tabindex','0');
  el.addEventListener('click', () => openChipModal(el.textContent.trim()));
  el.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openChipModal(el.textContent.trim()); }
  });
});

chipModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeChipModal));
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeChipModal(); });
