/* ═══════════════════════════════════════════════════════
   Career Craft — Horizontal Side-Scroller Engine
   GSAP ScrollTrigger: parallax, character walk, HUD sync
   ═══════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ── Era Data ────────────────────────────────────────── */
const ERAS = [
  { start: 1995, end: 1998, xp: 0,   joy: 50,  role: 'Tommy Walsh — Clare' },              // Intro
  { start: 1995, end: 1998, xp: 2,   joy: 55,  role: 'About Me' },                        // About
  { start: 1995, end: 1998, xp: 3,   joy: 60,  role: 'Home — Carrigaholt, Loop Head' },   // Home
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
  { start: 2026, end: 2026, xp: 100, joy: 95,  role: 'Get in Touch 📬' },                 // Outro
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

gsap.to('#game-deco-layer', {
  x: () => -totalMove() * 0.45,
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
    walkTimeout = setTimeout(() => character.classList.remove('walking'), 250);
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
    null, // intro title screen
    null, // about me
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
    null, // contact/outro
  ];

  sections.forEach((sec, i) => {
    const bg = el(sec, 'sega-bg');
    bg.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;';

    // Ribbon banner (skip intro, about, contact)
    if (titles[i]) {
      const r = el(sec, 'ribbon-banner');
      r.textContent = titles[i];
      r.style.zIndex = '15';
    }

    // Trees along the ground (every section except ocean)
    const isOcean = (i === 7); // Fishing era
    const isNight = (i === 0 || i === 2); // Intro + Fennels
    if (!isOcean) {
      const treeCount = 3 + Math.floor(Math.random() * 3);
      for (let t = 0; t < treeCount; t++) {
        const pos = (2 + t * (90 / treeCount) + Math.random() * 8).toFixed(0) + '%';
        const sizes = ['tree-sm', '', 'tree-lg'];
        const variant = sizes[Math.floor(Math.random() * 3)];
        const dark = Math.random() > 0.5 ? ' tree-dark' : '';
        makeTree(bg, pos, variant + dark);
      }
    }

    // ═══ DENSE SKY FILL — clouds, birds, sun/moon, kites ═══
    if (!isOcean && !isNight) {
      // Big puffy clouds — 4 to 7 per section
      const cloudCount = 4 + Math.floor(Math.random() * 4);
      for (let c = 0; c < cloudCount; c++) {
        const size = Math.random() > 0.6 ? '' : ' cloud-sm';
        el(bg, 'cloud' + size, {
          top: (5 + Math.random() * 30) + '%',
          left: (c * (90 / cloudCount) + Math.random() * 10) + '%',
        });
      }
    } else if (isNight) {
      // Night clouds (fewer, darker)
      for (let c = 0; c < 2; c++) {
        el(bg, 'cloud cloud-sm', {
          top: (10 + Math.random() * 20) + '%',
          left: (20 + Math.random() * 60) + '%',
          opacity: '0.15',
        });
      }
    }

    // Background hills — bigger, more of them (except ocean/night)
    if (!isOcean) {
      el(bg, 'bg-hill hill-far', { width:'260px', height:'140px', left:'-2%' });
      el(bg, 'bg-hill hill-far', { width:'300px', height:'160px', right:'-3%' });
      el(bg, 'bg-hill hill-far', { width:'200px', height:'110px', left:'30%' });
      if (i > 3) {
        el(bg, 'bg-hill hill-mid', { width:'180px', height:'95px', left:'55%' });
        el(bg, 'bg-hill hill-mid', { width:'220px', height:'105px', right:'20%' });
      }
    }

    // Flying birds (mid-sky, sections 3+)
    if (i >= 3 && !isOcean && !isNight) {
      const birdCount = 2 + Math.floor(Math.random() * 3);
      for (let b = 0; b < birdCount; b++) {
        const bird = el(bg, 'sky-bird', {
          top: (8 + Math.random() * 25) + '%',
          left: (10 + Math.random() * 80) + '%',
          animationDelay: (Math.random() * 4).toFixed(1) + 's',
        });
      }
    }

    // Sun or warm glow (daytime sections)
    if (i >= 3 && i <= 6 && !isOcean) {
      el(bg, 'sky-sun', { top: '6%', right: (10 + Math.random() * 15) + '%' });
    }

    // Per-era themed backgrounds
    switch(i) {
      case 0: buildIntroScene(bg); break;    // Title screen
      case 1: buildAboutScene(bg); break;    // About me
      case 2: buildPubScene(bg); break;      // Streets of Rage
      case 3: buildStationScene(bg); break;  // OutRun
      case 4: buildFactoryScene(bg); break;  // Chemical Plant
      case 5: buildMarketScene(bg); break;   // Fish market
      case 6: buildGarageScene(bg); break;   // Road Rash
      case 7: buildOceanScene(bg); break;    // Ecco
      case 8: buildSalesScene(bg); break;    // Alex Kidd
      case 9: buildOfficeScene(bg); break;   // Phantasy Star
      case 10: buildTechScene(bg, 1); break; // Star Light
      case 11: buildTechScene(bg, 2); break; // Casino Night
      case 12: buildTechScene(bg, 3); break; // Marble Garden
      case 13: buildTechScene(bg, 4); break; // Flying Battery
      case 14: buildTechScene(bg, 5); break; // Stardust Speedway
      case 15: buildOutroScene(bg); break;   // Contact
    }

    // Level gate between sections (skip first 2 and last)
    if (i >= 2 && i < sections.length - 1) {
      const gate = el(sec, 'level-gate');
      const label = el(gate, 'level-gate-label');
      label.textContent = 'LVL ' + (i - 1);
    }
  });
}

/* ── Per-Era Scene Builders ──────────────────────────── */

function buildIntroScene(bg) {
  // Title screen — night sky with shooting stars, moon, city silhouette
  // Moon
  el(bg, 'sky-moon', { top:'8%', right:'12%' });

  // Shooting stars
  for (let s = 0; s < 3; s++) {
    el(bg, 'shooting-star', {
      top: (5 + s * 12) + '%',
      left: (15 + s * 25) + '%',
      animationDelay: (s * 2.5) + 's',
    });
  }

  // Stars
  for (let s = 0; s < 40; s++) {
    el(bg, 'star', { top:(2+Math.random()*50)+'%', left:(Math.random()*100)+'%',
      animationDelay:(Math.random()*3).toFixed(1)+'s' });
  }

  // City silhouette
  const bldgHeights = [120,180,150,200,130,170,220,140,190,160,210,130,180,150];
  bldgHeights.forEach((h, idx) => {
    el(bg, 'px-bldg', { left:(idx*7)+'%', width:'50px', height:h+'px',
      '--bldg-color': 'rgba(10,10,25,0.7)', bottom:'90px' });
  });
}

function buildAboutScene(bg) {
  // Bright morning — signpost, bench, park feel
  // Signpost
  el(bg, '', { position:'absolute', bottom:'90px', left:'8%', width:'6px', height:'100px',
    background:'#6B4F0A', zIndex:'4' });
  el(bg, '', { position:'absolute', bottom:'175px', left:'5.5%', width:'60px', height:'25px',
    background:'#8B6914', border:'2px solid #6B4F0A', borderRadius:'3px', zIndex:'4',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontFamily:'var(--pixel-font)', fontSize:'7px', color:'#fff' });

  // Park bench
  el(bg, '', { position:'absolute', bottom:'90px', right:'15%', width:'60px', height:'8px',
    background:'#8B6914', borderRadius:'2px', zIndex:'4' });
  el(bg, '', { position:'absolute', bottom:'90px', right:'16.5%', width:'4px', height:'25px',
    background:'#6B4F0A', zIndex:'3' });
  el(bg, '', { position:'absolute', bottom:'90px', right:'18.5%', width:'4px', height:'25px',
    background:'#6B4F0A', zIndex:'3' });

  // Kite in the sky
  el(bg, 'sky-kite', { top:'15%', left:'65%' });

  // Butterflies
  for (let b = 0; b < 4; b++) {
    el(bg, 'sky-butterfly', {
      top: (25 + Math.random() * 35) + '%',
      left: (20 + Math.random() * 60) + '%',
      animationDelay: (Math.random() * 3) + 's',
    });
  }
}

function buildPubScene(bg) {
  // STREETS OF RAGE — dark city, neon, gritty nightlife
  // Skyline of buildings
  const bldgConfigs = [
    { l:'0%',w:70,h:310,c:'#12122a' }, { l:'5%',w:55,h:240,c:'#1a1a35' },
    { l:'10%',w:80,h:280,c:'#161630' }, { l:'16%',w:50,h:200,c:'#1e1e38' },
    { l:'80%',w:65,h:260,c:'#14142c' }, { l:'86%',w:75,h:300,c:'#1a1a35' },
    { l:'92%',w:55,h:220,c:'#161630' },
  ];
  bldgConfigs.forEach(b => el(bg, 'px-bldg lit', { left:b.l, width:b.w+'px', height:b.h+'px', '--bldg-color':b.c }));

  // Neon signs
  const n1 = el(bg, 'neon-sign neon-red', { left:'7%', bottom:'300px' }); n1.textContent = '🍺 BAR';
  const n2 = el(bg, 'neon-sign neon-blue', { left:'83%', bottom:'280px' }); n2.textContent = 'FENNELS';
  const n3 = el(bg, 'neon-sign neon-red', { left:'13%', bottom:'240px' }); n3.textContent = 'OPEN';

  // Street lamps
  for (const pos of ['25%','40%','55%','70%']) el(bg, 'px-lamp', { left: pos });

  // Stars for night sky
  for (let s = 0; s < 30; s++) {
    el(bg, 'star', { top:(2+Math.random()*35)+'%', left:(Math.random()*100)+'%',
      animationDelay:(Math.random()*3).toFixed(1)+'s' });
  }

  // Fog/mist at ground level
  el(bg, '', { position:'absolute', bottom:'90px', left:'0', right:'0', height:'40px',
    background:'linear-gradient(180deg, transparent, rgba(100,80,60,0.3))', zIndex:'3' });
}

function buildStationScene(bg) {
  // OUTRUN — sunset highway, palm trees, retro road
  // Palm trees along the road
  for (const pos of ['3%','14%','28%','65%','78%','92%']) {
    const palm = el(bg, 'tree-round', { left: pos });
    const canopy = el(palm, 'tree-canopy');
    canopy.style.cssText = 'width:45px;height:30px;background:#1a8a10;border-radius:60% 60% 40% 40%;margin-bottom:-6px;box-shadow:inset -4px -4px 0 rgba(0,0,0,0.15)';
    const trunk = el(palm, 'tree-trunk');
    trunk.style.cssText = 'width:8px;height:60px;background:linear-gradient(90deg,#8B6914,#A0782A,#8B6914);transform:rotate(3deg)';
  }

  // Retro road stripes along the ground
  for (let d = 0; d < 8; d++) {
    el(bg, '', { position:'absolute', bottom:'85px', left:(5+d*13)+'%',
      width:'40px', height:'6px', background:'#fff', opacity:'0.6', zIndex:'5' });
  }

  // Sun glow on horizon
  el(bg, '', { position:'absolute', bottom:'90px', left:'40%', width:'200px', height:'200px',
    background:'radial-gradient(circle, rgba(255,160,50,0.35) 0%, transparent 70%)',
    borderRadius:'50%', zIndex:'1' });
}

function buildFactoryScene(bg) {
  // CHEMICAL PLANT ZONE — industrial pipes, tanks, toxic green, blue steel
  // Dense pipe network
  el(bg, 'px-pipe-h', { bottom:'280px', left:'0', width:'40%' });
  el(bg, 'px-pipe-v', { bottom:'90px', left:'40%', height:'190px' });
  el(bg, 'px-pipe-h', { bottom:'220px', left:'40%', width:'30%' });
  el(bg, 'px-pipe-v', { bottom:'90px', left:'70%', height:'130px' });
  el(bg, 'px-pipe-h', { bottom:'250px', right:'0', width:'35%' });
  el(bg, 'px-pipe-v', { bottom:'150px', left:'15%', height:'130px' });
  el(bg, 'px-pipe-h', { bottom:'180px', left:'0', width:'20%' });

  // Chemical tanks
  for (const pos of ['55%','72%','88%']) {
    el(bg, 'chem-tank', { left: pos });
  }

  // Neon DELL sign
  const n = el(bg, 'neon-sign neon-blue', { left:'8%', bottom:'320px' }); n.textContent = 'DELL LIMERICK';

  // Toxic drip effect
  for (let d = 0; d < 6; d++) {
    el(bg, '', { position:'absolute', top:(40+d*8)+'%', left:(10+d*15)+'%',
      width:'3px', height:'15px', background:'rgba(72,199,142,0.5)', borderRadius:'2px',
      animation:'chemBub 2s ease-in-out infinite '+(d*0.4)+'s', zIndex:'2' });
  }

  // Background industrial structures
  el(bg, 'px-bldg', { left:'0', width:'45px', height:'180px', '--bldg-color':'#2d3748', bottom:'90px' });
  el(bg, 'px-bldg', { right:'2%', width:'55px', height:'200px', '--bldg-color':'#2d3748', bottom:'90px' });
}

function buildMarketScene(bg) {
  // COLUMNS — colourful market stalls, crates, fish boxes
  // Market stall awnings
  for (let s = 0; s < 3; s++) {
    const colors = ['#e74c3c','#3498db','#f39c12'];
    el(bg, '', { position:'absolute', bottom:(130+s*5)+'px', left:(15+s*28)+'%',
      width:'80px', height:'35px', background:colors[s],
      borderRadius:'4px 4px 0 0', border:'3px solid rgba(0,0,0,0.2)', zIndex:'3' });
    // Stall post
    el(bg, '', { position:'absolute', bottom:'90px', left:(17+s*28)+'%',
      width:'6px', height:'75px', background:'#6B4F0A', zIndex:'3' });
    el(bg, '', { position:'absolute', bottom:'90px', left:(23+s*28)+'%',
      width:'6px', height:'75px', background:'#6B4F0A', zIndex:'3' });
  }

  // Crates / fish boxes
  for (let c = 0; c < 5; c++) {
    const bColors = ['#8B6914','#6d4c1a','#9a7b2e'];
    el(bg, '', { position:'absolute', bottom:'90px', left:(5+c*20)+'%',
      width:'22px', height:'18px', background:bColors[c%3],
      border:'2px solid rgba(0,0,0,0.3)', zIndex:'4' });
  }

  makeTree(bg, '2%', 'tree-lg tree-dark');
  makeTree(bg, '90%', 'tree-lg');
}

function buildGarageScene(bg) {
  // ROAD RASH — garage, tools, road
  // Garage structure
  el(bg, 'px-bldg', { left:'60%', width:'120px', height:'150px', '--bldg-color':'#4a3520', bottom:'90px' });
  // Garage door
  el(bg, '', { position:'absolute', bottom:'90px', left:'63%',
    width:'70px', height:'80px', background:'repeating-linear-gradient(180deg, #888 0px, #999 4px, #777 8px)',
    border:'3px solid #555', zIndex:'3' });

  // Road surface with centre line
  for (let d = 0; d < 6; d++) {
    el(bg, '', { position:'absolute', bottom:'82px', left:(8+d*16)+'%',
      width:'35px', height:'4px', background:'#eee', opacity:'0.5', zIndex:'5' });
  }

  // Tyre stacks
  for (const pos of ['55%','80%']) {
    for (let t = 0; t < 3; t++) {
      el(bg, '', { position:'absolute', bottom:(90+t*14)+'px', left:pos,
        width:'20px', height:'12px', background:'#222', borderRadius:'50%',
        border:'2px solid #444', zIndex:'3' });
    }
  }

  // Oil drum
  el(bg, '', { position:'absolute', bottom:'90px', left:'45%',
    width:'18px', height:'28px', background:'linear-gradient(90deg,#c0392b,#e74c3c,#c0392b)',
    border:'2px solid #922b21', borderRadius:'2px', zIndex:'3' });

  makeTree(bg, '2%', 'tree-sm');
  makeTree(bg, '92%', 'tree-sm tree-dark');
}

function buildOceanScene(bg) {
  // ECCO THE DOLPHIN — deep underwater, bioluminescent, coral reef
  // Light rays from surface
  for (let r = 0; r < 8; r++) {
    el(bg, 'light-ray', { left:(3+r*13)+'%', width:(25+Math.random()*20)+'px',
      animationDelay:(r*0.7)+'s' });
  }

  // Large coral formations
  const coralColors = ['#e74c3c','#e91e63','#ff7043','#ef5350','#f06292','#ab47bc','#ff5722','#ec407a'];
  for (let c = 0; c < 12; c++) {
    el(bg, 'px-coral-piece', {
      left: (2 + c * 8.5) + '%',
      width: (18 + Math.random()*35) + 'px',
      height: (25 + Math.random()*55) + 'px',
      background: coralColors[c % coralColors.length],
      opacity: (0.6 + Math.random()*0.4).toFixed(2),
    });
  }

  // Dense seaweed
  for (let w = 0; w < 16; w++) {
    el(bg, 'px-seaweed', {
      left: (1 + w * 6.5) + '%',
      height: (30 + Math.random()*60) + 'px',
      background: ['#27ae60','#2ecc71','#1abc9c','#16a085','#00897b'][w%5],
      '--dur': (2 + Math.random()*2.5) + 's',
      '--del': (Math.random()*2) + 's',
    });
  }

  // Bubbles rising
  for (let b = 0; b < 20; b++) {
    const bub = el(bg, '', { position:'absolute', bottom:(90+Math.random()*200)+'px',
      left:(Math.random()*95)+'%',
      width:(3+Math.random()*8)+'px', height:(3+Math.random()*8)+'px',
      background:'rgba(150,220,255,0.35)', borderRadius:'50%', zIndex:'2',
      animation:'aiBubbleRise '+(3+Math.random()*5)+'s ease-in-out infinite '+(Math.random()*4)+'s' });
  }

  // Deep water particles (bioluminescent)
  for (let p = 0; p < 15; p++) {
    el(bg, 'ai-particle', {
      top:(10+Math.random()*70)+'%', left:(Math.random()*95)+'%',
      background: ['#00e5ff','#76ff03','#e040fb','#ffeb3b'][p%4],
      boxShadow: '0 0 6px currentColor',
      '--ai-dur': (4 + Math.random()*5) + 's',
      '--ai-del': (Math.random()*5) + 's',
    });
  }
}

function buildSalesScene(bg) {
  // ALEX KIDD — bright colourful neighbourhood, houses
  const houseColors = ['#e74c3c','#3498db','#f39c12','#2ecc71','#9b59b6'];
  for (let h = 0; h < 4; h++) {
    const hx = 8 + h * 22;
    // House body
    el(bg, '', { position:'absolute', bottom:'90px', left:hx+'%',
      width:'50px', height:'65px', background:houseColors[h],
      border:'3px solid rgba(0,0,0,0.2)', zIndex:'2' });
    // Roof
    el(bg, '', { position:'absolute', bottom:'155px', left:(hx-1)+'%',
      width:'0', height:'0', zIndex:'2',
      borderLeft:'28px solid transparent', borderRight:'28px solid transparent',
      borderBottom:'25px solid '+houseColors[(h+2)%5] });
    // Door
    el(bg, '', { position:'absolute', bottom:'90px', left:(hx+1.5)+'%',
      width:'14px', height:'28px', background:'#6B4F0A', border:'2px solid #4a3508', zIndex:'3' });
    // Window
    el(bg, '', { position:'absolute', bottom:'130px', left:(hx+2.5)+'%',
      width:'16px', height:'14px', background:'rgba(255,255,150,0.6)',
      border:'2px solid rgba(0,0,0,0.2)', zIndex:'3' });
  }

  makeTree(bg, '1%', 'tree-lg');
  makeTree(bg, '93%', 'tree-lg tree-dark');
  makeTree(bg, '35%', 'tree-sm');
}

function buildOfficeScene(bg) {
  // PHANTASY STAR — transition to tech, cubicle maze vibe
  // Office building backdrop
  el(bg, 'px-bldg lit', { left:'5%', width:'90px', height:'250px', '--bldg-color':'#2c3e50', '--win-color':'rgba(255,255,200,0.4)' });
  el(bg, 'px-bldg lit', { right:'5%', width:'80px', height:'220px', '--bldg-color':'#34495e', '--win-color':'rgba(200,220,255,0.4)' });

  // Desk / cubicle partition lines
  for (let d = 0; d < 3; d++) {
    el(bg, '', { position:'absolute', bottom:'90px', left:(30+d*12)+'%',
      width:'4px', height:'50px', background:'#7f8c8d', zIndex:'3' });
    el(bg, '', { position:'absolute', bottom:'140px', left:(30+d*12)+'%',
      width:'35px', height:'4px', background:'#95a5a6', zIndex:'3' });
  }

  // Phone/headset icon (using simple pixel shapes)
  el(bg, '', { position:'absolute', bottom:'100px', left:'42%',
    width:'12px', height:'8px', background:'#2c3e50', borderRadius:'6px 6px 0 0', zIndex:'4' });

  makeTree(bg, '0%', 'tree-sm tree-dark');
  makeTree(bg, '92%', 'tree-lg');

  const neon = el(bg, 'neon-sign neon-blue', { right:'8%', bottom:'260px' }); neon.textContent = 'FMI';
}

function buildTechScene(bg, level) {
  // SONIC ZONES — escalating tech complexity per Microsoft era
  // Level 1: Star Light Zone (ICT Services) — city lights, first MS experience
  // Level 2: Casino Night Zone (Auxilion Jr) — neon corporate
  // Level 3: Marble Garden Zone (Auxilion Sr / COVID) — quiet, grey, isolated
  // Level 4: Flying Battery Zone (Unisys) — industrial scale ops
  // Level 5: Stardust Speedway (Wipro) — futuristic AI

  // Trees (more as career progresses)
  makeTree(bg, '1%', level > 2 ? 'tree-lg' : 'tree-sm');
  makeTree(bg, '94%', 'tree-lg tree-dark');
  if (level >= 3) makeTree(bg, '50%', 'tree-sm');

  // Sonic-style loops
  if (level >= 1) el(bg, 'px-loop', { left:'20%', opacity:'0.3' });
  if (level >= 2) el(bg, 'px-loop', { right:'15%', opacity:'0.25' });
  if (level >= 4) el(bg, 'px-loop', { left:'55%', opacity:'0.2' });

  // Buildings (more and taller as level increases)
  if (level >= 1) {
    el(bg, 'px-bldg lit', { left:'2%', width:'50px', height:(140+level*30)+'px', '--bldg-color':'#1a2a4a' });
    el(bg, 'px-bldg lit', { right:'2%', width:'60px', height:(160+level*25)+'px', '--bldg-color':'#1e2e50' });
  }
  if (level >= 2) {
    el(bg, 'px-bldg lit', { left:'10%', width:'45px', height:(120+level*20)+'px', '--bldg-color':'#162040' });
    const neonColors = ['neon-blue','neon-red','neon-blue','neon-red','neon-blue'];
    const neonTexts = ['ICT','AUXILION','COVID-19','UNISYS','WIPRO AI'];
    const n = el(bg, 'neon-sign '+neonColors[level-1], { left:'4%', bottom:(180+level*30)+'px' });
    n.textContent = neonTexts[level-1];
  }

  // Speed lines (increasing with level)
  if (level >= 2) {
    const lineCount = Math.min(level * 2, 8);
    for (let l = 0; l < lineCount; l++) {
      el(bg, 'speed-line', {
        top: (20 + l * 8) + '%',
        left: (5 + l * 10) + '%',
        width: (50 + Math.random()*100) + 'px',
        animationDelay: (l * 0.5) + 's',
      });
    }
  }

  // Industrial pipes for later eras
  if (level >= 3) {
    el(bg, 'px-pipe-h', { bottom:'200px', left:'0', width:'25%' });
    el(bg, 'px-pipe-h', { bottom:'170px', right:'0', width:'20%' });
  }
  if (level >= 4) {
    el(bg, 'px-pipe-v', { bottom:'90px', left:'25%', height:'110px' });
    el(bg, 'px-pipe-h', { bottom:'240px', left:'10%', width:'35%' });
    el(bg, 'px-pipe-v', { bottom:'90px', right:'20%', height:'80px' });
    // More industrial structures
    el(bg, 'chem-tank', { left:'75%' });
  }

  // AI particles for Wipro (level 5 — Stardust Speedway)
  if (level === 5) {
    for (let p = 0; p < 20; p++) {
      el(bg, 'ai-particle', {
        top: (10 + Math.random()*60) + '%',
        left: (3 + Math.random()*94) + '%',
        '--ai-dur': (3 + Math.random()*4) + 's',
        '--ai-del': (Math.random()*4) + 's',
      });
    }
    // Holographic grid floor effect
    el(bg, '', { position:'absolute', bottom:'90px', left:'0', right:'0', height:'25px',
      background:'repeating-linear-gradient(90deg, rgba(0,200,255,0.15) 0px, transparent 1px, transparent 20px)',
      zIndex:'5' });
    el(bg, '', { position:'absolute', bottom:'90px', left:'0', right:'0', height:'25px',
      background:'repeating-linear-gradient(0deg, rgba(0,200,255,0.1) 0px, transparent 1px, transparent 10px)',
      zIndex:'5' });
  }

  // Street lamps
  for (let lamp = 0; lamp < Math.min(level + 1, 4); lamp++) {
    el(bg, 'px-lamp', { left: (25 + lamp * 18) + '%' });
  }
}

function buildOutroScene(bg) {
  // Celebration — fireworks, confetti, sunset glow
  // Firework bursts
  for (let f = 0; f < 8; f++) {
    el(bg, 'firework-burst', {
      top: (5 + Math.random() * 35) + '%',
      left: (5 + Math.random() * 90) + '%',
      animationDelay: (Math.random() * 5) + 's',
      '--fw-color': ['#ff4444','#44ff44','#4488ff','#ffaa00','#ff44ff','#44ffff','#ffff44','#ff8844'][f],
    });
  }

  // Trophy / flag at the end
  el(bg, '', { position:'absolute', bottom:'90px', right:'10%', width:'6px', height:'120px',
    background:'#888', zIndex:'4' });
  el(bg, '', { position:'absolute', bottom:'190px', right:'7%', width:'45px', height:'30px',
    background:'#e74c3c', zIndex:'4', borderRadius:'0 4px 4px 0' });

  // Stars for atmosphere
  for (let s = 0; s < 20; s++) {
    el(bg, 'star', { top:(2+Math.random()*40)+'%', left:(Math.random()*100)+'%',
      animationDelay:(Math.random()*3).toFixed(1)+'s' });
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
