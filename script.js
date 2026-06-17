/* ═══════════════════════════════════════════════════════
   Career Craft — Horizontal Side-Scroller Engine
   GSAP ScrollTrigger: parallax, character walk, HUD sync
   ═══════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ── Era Data ────────────────────────────────────────── */
const ERAS = [
  { start: 1998, end: 2002, xp: 8,   joy: 65,  role: 'Fennels Bar — Bartender' },
  { start: 2002, end: 2003, xp: 12,  joy: 50,  role: 'Statoil — Forecourt' },
  { start: 2003, end: 2005, xp: 18,  joy: 55,  role: 'Dell — Manufacturer' },
  { start: 2006, end: 2007, xp: 22,  joy: 42,  role: 'JK Wholesale — Fish Monger' },
  { start: 2007, end: 2008, xp: 28,  joy: 55,  role: 'Walsh Auto — Mechanic' },
  { start: 2008, end: 2015, xp: 48,  joy: 80,  role: 'Fishing — Deckhand 🐟' },
  { start: 2015, end: 2016, xp: 52,  joy: 35,  role: 'Emerald — Sales Agent' },
  { start: 2016, end: 2017, xp: 58,  joy: 48,  role: 'FMI — Contact Centre' },
  { start: 2018, end: 2019, xp: 68,  joy: 82,  role: 'ICT @ Microsoft — AVLink SME' },
  { start: 2019, end: 2020, xp: 75,  joy: 78,  role: 'Auxilion — Jr Site Ops' },
  { start: 2020, end: 2021, xp: 80,  joy: 62,  role: 'Auxilion — Sr Ops (COVID)' },
  { start: 2021, end: 2025, xp: 92,  joy: 88,  role: 'Unisys — TL EMEA' },
  { start: 2025, end: 2026, xp: 100, joy: 94,  role: 'Wipro — TL GS Onsite EMEA 🤖' },
];

/* ── DOM Refs ────────────────────────────────────────── */
const track     = document.getElementById('track');
const character = document.getElementById('character');
const slider    = document.getElementById('timeline-slider');
const yearLabel = document.getElementById('current-year');
const roleLabel = document.getElementById('current-role');
const xpBar     = document.getElementById('xp-bar');
const joyBar    = document.getElementById('joy-bar');
const skillsCt  = document.getElementById('skills-count');
const invSlots  = document.querySelectorAll('.inv-slot');

const unlockedSkills = new Set();
let walkTimeout;

/* ── 1. HORIZONTAL SCROLL ────────────────────────────── */
const totalMove = () => track.scrollWidth - window.innerWidth;

const scrollTween = gsap.to(track, {
  x: () => -totalMove(),
  ease: 'none',
  scrollTrigger: {
    trigger: '#world',
    pin: true,
    scrub: 0.6,
    end: () => '+=' + track.scrollWidth,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      updateHUD(self.progress);
      detectWalk(self);
    },
  },
});

/* ── 2. PARALLAX LAYERS ──────────────────────────────── */
gsap.to('#bg-far', {
  x: () => -totalMove() * 0.12,
  ease: 'none',
  scrollTrigger: {
    trigger: '#world',
    scrub: true,
    end: () => '+=' + track.scrollWidth,
    invalidateOnRefresh: true,
  },
});

gsap.to('#bg-mid', {
  x: () => -totalMove() * 0.28,
  ease: 'none',
  scrollTrigger: {
    trigger: '#world',
    scrub: true,
    end: () => '+=' + track.scrollWidth,
    invalidateOnRefresh: true,
  },
});

gsap.to('#cloud-layer', {
  x: () => -totalMove() * 0.18,
  ease: 'none',
  scrollTrigger: {
    trigger: '#world',
    scrub: true,
    end: () => '+=' + track.scrollWidth,
    invalidateOnRefresh: true,
  },
});

/* ── 3. ERA CARD REVEALS ─────────────────────────────── */
document.querySelectorAll('.era-card').forEach(card => {
  gsap.from(card, {
    y: 60,
    opacity: 0,
    duration: 0.6,
    scrollTrigger: {
      trigger: card,
      containerAnimation: scrollTween,
      start: 'left 80%',
      toggleActions: 'play none none reverse',
    },
  });
});

/* ── 4. SKILL UNLOCK TRIGGERS ────────────────────────── */
document.querySelectorAll('.skill-unlock').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    containerAnimation: scrollTween,
    start: 'left 65%',
    onEnter: () => {
      el.classList.add('revealed');
      const skill = el.dataset.skill;
      if (skill && !unlockedSkills.has(skill)) {
        unlockedSkills.add(skill);
        updateSkillsCount();
        unlockSlot(skill);
      }
    },
    once: true,
  });
});

function unlockSlot(skill) {
  invSlots.forEach(slot => {
    if (slot.dataset.skill === skill) {
      slot.classList.add('unlocked');
      gsap.from(slot, { scale: 1.5, duration: 0.4, ease: 'back.out(2)' });
    }
  });
}

function updateSkillsCount() {
  skillsCt.textContent = unlockedSkills.size + ' / 19';
}

/* ── 5. CHARACTER WALK DETECTION ─────────────────────── */
function detectWalk(self) {
  if (Math.abs(self.getVelocity()) > 30) {
    character.classList.add('walking');
    clearTimeout(walkTimeout);
    walkTimeout = setTimeout(() => character.classList.remove('walking'), 180);
  }
}

/* ── 6. HUD UPDATE ───────────────────────────────────── */
function findEra(year) {
  for (let i = ERAS.length - 1; i >= 0; i--) {
    if (year >= ERAS[i].start) return i;
  }
  return 0;
}

function updateHUD(progress) {
  const year = 1998 + progress * (2026 - 1998);
  const idx = findEra(year);
  const era = ERAS[idx];
  const prev = idx > 0 ? ERAS[idx - 1] : { xp: 0, joy: 50 };
  const span = era.end - era.start || 1;
  const p = Math.min((year - era.start) / span, 1);

  const xp  = prev.xp  + (era.xp  - prev.xp)  * p;
  const joy = prev.joy  + (era.joy - prev.joy)  * p;

  xpBar.style.width  = xp  + '%';
  joyBar.style.width = joy + '%';
  yearLabel.textContent = Math.round(year);
  roleLabel.textContent = era.role;

  // Sync slider (suppress feedback)
  slider.value = year.toFixed(1);
}

/* Slider click → scroll to year */
let sliderDragging = false;
slider.addEventListener('input', () => {
  sliderDragging = true;
  const year = Number(slider.value);
  const pct = (year - 1998) / (2026 - 1998);
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: pct * docH, behavior: 'smooth' });
  setTimeout(() => { sliderDragging = false; }, 100);
});

/* ── 7. DECORATION ANIMATIONS ────────────────────────── */
document.querySelectorAll('.era-deco .deco').forEach(deco => {
  gsap.from(deco, {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    ease: 'back.out(2)',
    scrollTrigger: {
      trigger: deco,
      containerAnimation: scrollTween,
      start: 'left 90%',
      toggleActions: 'play none none reverse',
    },
  });
});

/* ── 8. AMBIENT STARS (dark sky eras) ────────────────── */
function spawnStars() {
  document.querySelectorAll('.sky-night, .sky-dawn, .sky-ocean, .sky-dusk, .sky-grey').forEach(era => {
    const count = era.classList.contains('sky-ocean') ? 30 : 15;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.cssText = `
        top: ${2 + Math.random() * 45}%;
        left: ${Math.random() * 100}%;
        animation-delay: ${(Math.random() * 3).toFixed(1)}s;
        width: ${2 + Math.random() * 2}px;
        height: ${2 + Math.random() * 2}px;
      `;
      era.appendChild(star);
    }
  });
}

/* ── 9. OCEAN BUBBLES ────────────────────────────────── */
function spawnBubbles() {
  const ocean = document.querySelector('.sky-ocean');
  if (!ocean) return;

  for (let i = 0; i < 18; i++) {
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      position: absolute;
      width: ${3 + Math.random() * 5}px;
      height: ${3 + Math.random() * 5}px;
      background: rgba(255,255,255,0.12);
      border-radius: 50%;
      bottom: ${90 + Math.random() * 200}px;
      left: ${Math.random() * 100}%;
      pointer-events: none;
      z-index: 4;
    `;
    ocean.appendChild(bubble);

    gsap.to(bubble, {
      y: -(120 + Math.random() * 350),
      x: (Math.random() - 0.5) * 60,
      opacity: 0,
      duration: 4 + Math.random() * 5,
      repeat: -1,
      delay: Math.random() * 5,
      ease: 'power1.out',
    });
  }
}

/* ── 9. LEONARDI SCENE BUILDER ────────────────────────── */

function el(parent, cls, styles) {
  const d = document.createElement('div');
  d.className = cls;
  if (styles) Object.assign(d.style, styles);
  parent.appendChild(d);
  return d;
}

function makeTree(parent, left, size) {
  const t = el(parent, 'tree-round ' + (size || ''), { left });
  el(t, 'tree-canopy');
  el(t, 'tree-trunk');
}

function buildLeonardiScene() {
  const sections = document.querySelectorAll('#track .era');
  const titles = [
    null, // intro
    'Fennels Bar — Dublin',
    'Walsh\'s Statoil',
    'Dell — Limerick',
    'JK WholeSale',
    'Walsh Auto Repairs',
    'Commercial Fishing — Atlantic',
    'Emerald Group — Sales',
    'FMI — Contact Centre',
    'ICT Services @ Microsoft',
    'Auxilion @ Microsoft',
    'Auxilion — COVID Era',
    'Unisys @ Microsoft',
    'Wipro @ Microsoft',
  ];

  sections.forEach((sec, i) => {
    const bg = el(sec, 'sega-bg');
    bg.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;';

    // Ribbon banner (skip intro)
    if (i > 0 && titles[i]) {
      const r = el(sec, 'ribbon-banner');
      r.textContent = titles[i];
      r.style.zIndex = '15';
    }

    // Trees (scatter along ground)
    if (i === 0) { // Intro: a few trees
      makeTree(bg, '3%', 'tree-lg tree-dark');
      makeTree(bg, '85%', 'tree-lg');
      makeTree(bg, '92%', 'tree-sm');
    }

    // Per-era themed backgrounds
    switch(i) {
      case 1: buildPubScene(bg); break;     // Streets of Rage
      case 2: buildStationScene(bg); break;  // OutRun
      case 3: buildFactoryScene(bg); break;  // Chemical Plant
      case 4: buildMarketScene(bg); break;   // Fish market
      case 5: buildGarageScene(bg); break;   // Road Rash
      case 6: buildOceanScene(bg); break;    // Ecco
      case 7: buildSalesScene(bg); break;    // Alex Kidd
      case 8: buildOfficeScene(bg); break;   // Phantasy Star
      case 9: buildTechScene(bg, 1); break;  // Star Light
      case 10: buildTechScene(bg, 2); break; // Casino Night
      case 11: buildTechScene(bg, 3); break; // Marble Garden
      case 12: buildTechScene(bg, 4); break; // Flying Battery
      case 13: buildTechScene(bg, 5); break; // Stardust Speedway
    }

    // Level gate between sections (skip intro & last)
    if (i > 0 && i < sections.length - 1) {
      const gate = el(sec, 'level-gate');
      const label = el(gate, 'level-gate-label');
      label.textContent = 'LVL ' + (i + 1);
    }

    // Background hills per section (except underwater)
    if (i !== 6) {
      el(bg, 'bg-hill hill-far', { width: '180px', height: '100px', left: '5%' });
      el(bg, 'bg-hill hill-far', { width: '220px', height: '120px', right: '8%' });
      if (i > 5) el(bg, 'bg-hill hill-mid', { width: '140px', height: '80px', left: '40%' });
    }

    // Scattered clouds per section
    if (i !== 6 && i !== 1) { // skip underwater & night pub
      for (let c = 0; c < 2; c++) {
        el(bg, 'cloud' + (Math.random() > 0.5 ? ' cloud-sm' : ''), {
          top: (8 + Math.random() * 20) + '%',
          left: (10 + Math.random() * 70) + '%',
        });
      }
    }
  });
}

/* ── Per-Era Scene Builders ──────────────────────────── */

function buildPubScene(bg) {
  // Streets of Rage: city buildings with lit windows, neon BAR sign
  el(bg, 'px-bldg lit', { left:'1%', width:'55px', height:'200px', '--bldg-color':'#1a1a2e' });
  el(bg, 'px-bldg lit', { left:'7%', width:'70px', height:'280px', '--bldg-color':'#161628' });
  el(bg, 'px-bldg lit', { left:'14%', width:'48px', height:'190px', '--bldg-color':'#1e1e30' });
  el(bg, 'px-bldg lit', { right:'1%', width:'60px', height:'250px', '--bldg-color':'#1a1a2e' });
  el(bg, 'px-bldg lit', { right:'8%', width:'55px', height:'210px', '--bldg-color':'#161628' });
  el(bg, 'px-bldg lit', { right:'15%', width:'65px', height:'270px', '--bldg-color':'#1e1e30' });
  const neon = el(bg, 'neon-sign neon-red', { left:'9%', bottom:'250px' });
  neon.textContent = 'BAR';
  el(bg, 'px-lamp', { left:'30%' });
  el(bg, 'px-lamp', { right:'28%' });
  // Stars for night sky
  for (let s = 0; s < 20; s++) {
    el(bg, 'star', { top: (3+Math.random()*40)+'%', left: (Math.random()*100)+'%',
      animationDelay: (Math.random()*3).toFixed(1)+'s' });
  }
}

function buildStationScene(bg) {
  // OutRun: palm trees on a dawn road
  for (const pos of ['5%','18%','75%','88%']) {
    const palm = el(bg, 'tree-round', { left: pos });
    const fronds = el(palm, 'tree-canopy');
    fronds.style.background = '#2d7a1a';
    fronds.style.width = '50px'; fronds.style.height = '35px';
    fronds.style.borderRadius = '50%';
    const trunk = el(palm, 'tree-trunk');
    trunk.style.height = '55px'; trunk.style.width = '10px';
  }
  makeTree(bg, '35%', 'tree-sm');
  makeTree(bg, '60%', 'tree-sm tree-dark');
}

function buildFactoryScene(bg) {
  // Chemical Plant Zone: pipes, tanks, industrial blue
  el(bg, 'px-pipe-h', { bottom:'220px', left:'0', width:'35%' });
  el(bg, 'px-pipe-v', { bottom:'90px', left:'35%', height:'130px' });
  el(bg, 'px-pipe-h', { bottom:'170px', left:'35%', width:'25%' });
  el(bg, 'px-pipe-v', { bottom:'90px', right:'25%', height:'80px' });
  el(bg, 'px-pipe-h', { bottom:'200px', right:'0', width:'30%' });
  el(bg, 'chem-tank', { left:'70%' });
  el(bg, 'chem-tank', { right:'5%' });
  const neon = el(bg, 'neon-sign neon-blue', { left:'5%', bottom:'260px' });
  neon.textContent = 'DELL';
}

function buildMarketScene(bg) {
  // Fish market: crates, trees
  makeTree(bg, '3%', 'tree-lg tree-dark');
  makeTree(bg, '15%', 'tree-sm');
  makeTree(bg, '80%', 'tree-lg');
  makeTree(bg, '93%', 'tree-sm tree-dark');
}

function buildGarageScene(bg) {
  // Road Rash: garage, wrenches, tools
  makeTree(bg, '2%', 'tree-sm');
  makeTree(bg, '90%', 'tree-sm');
  el(bg, 'px-loop', { left:'70%', opacity:'0.2' });
}

function buildOceanScene(bg) {
  // Ecco the Dolphin: underwater world
  // Light rays from surface
  for (let r = 0; r < 6; r++) {
    el(bg, 'light-ray', { left: (5 + r * 18) + '%', animationDelay: (r * 0.8) + 's' });
  }
  // Coral
  const coralColors = ['#e74c3c','#e91e63','#ff7043','#ef5350','#f06292'];
  for (let c = 0; c < 8; c++) {
    el(bg, 'px-coral-piece', {
      left: (5 + c * 12) + '%',
      width: (15 + Math.random()*25) + 'px',
      height: (20 + Math.random()*40) + 'px',
      background: coralColors[c % coralColors.length],
    });
  }
  // Seaweed
  for (let w = 0; w < 10; w++) {
    el(bg, 'px-seaweed', {
      left: (3 + w * 10) + '%',
      height: (25 + Math.random()*45) + 'px',
      background: ['#27ae60','#2ecc71','#1abc9c','#16a085'][w%4],
      '--dur': (2.5 + Math.random()*2) + 's',
      '--del': (Math.random()*2) + 's',
    });
  }
  // Extra stars for deep water atmosphere
  for (let s = 0; s < 15; s++) {
    el(bg, 'star', { top:(2+Math.random()*25)+'%', left:(Math.random()*100)+'%',
      animationDelay:(Math.random()*3).toFixed(1)+'s' });
  }
}

function buildSalesScene(bg) {
  // Alex Kidd: colourful neighbourhood, houses, trees
  makeTree(bg, '3%', 'tree-lg');
  makeTree(bg, '12%', 'tree-sm tree-dark');
  makeTree(bg, '75%', 'tree-lg tree-dark');
  makeTree(bg, '88%', 'tree-sm');
  makeTree(bg, '95%', 'tree-lg');
}

function buildOfficeScene(bg) {
  // Phantasy Star: transition zone, some trees, desk elements
  makeTree(bg, '2%', 'tree-sm');
  makeTree(bg, '85%', 'tree-lg tree-dark');
  makeTree(bg, '95%', 'tree-sm');
}

function buildTechScene(bg, level) {
  // Sonic zones for Microsoft eras: loops, platforms, tech elements
  makeTree(bg, '2%', level > 2 ? 'tree-lg' : 'tree-sm');
  makeTree(bg, '92%', 'tree-lg tree-dark');

  // Sonic loops (more as career progresses)
  if (level >= 2) el(bg, 'px-loop', { left: '25%', opacity: '0.25' });
  if (level >= 4) el(bg, 'px-loop', { right: '20%', opacity: '0.2' });

  // Speed lines for later eras
  if (level >= 3) {
    for (let l = 0; l < 4; l++) {
      el(bg, 'speed-line', {
        top: (30 + l * 12) + '%',
        left: (10 + l * 15) + '%',
        width: (60 + Math.random()*80) + 'px',
        animationDelay: (l * 0.6) + 's',
      });
    }
  }

  // AI particles for final era (Wipro)
  if (level === 5) {
    for (let p = 0; p < 12; p++) {
      el(bg, 'ai-particle', {
        top: (15 + Math.random()*55) + '%',
        left: (5 + Math.random()*90) + '%',
        '--ai-dur': (4 + Math.random()*4) + 's',
        '--ai-del': (Math.random()*4) + 's',
      });
    }
  }

  // Industrial pipes for Unisys/later eras
  if (level >= 4) {
    el(bg, 'px-pipe-h', { bottom:'180px', left:'0', width:'20%' });
    el(bg, 'px-pipe-h', { bottom:'160px', right:'0', width:'15%' });
  }
}

/* ── INIT ─────────────────────────────────────────────── */
function init() {
  buildLeonardiScene();
  spawnStars();
  spawnBubbles();
  updateSkillsCount();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
