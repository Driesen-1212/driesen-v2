/* ============================================================
   giats.js — the clone build

   Every number in here was measured on giats.me in a headless browser
   on 2026-10-26 (driesen-dev/giats/inv.json, wheel.json):

   boot card          820ms hold, card scales from .94 with the opacity
   entrance           skewY(1deg) + translateY 116 / 23 / 30px, settle to none
   running strip      185px/s, plus 0.09 of every downward scroll pixel
   right progress     4px, difference blend, 80vh
   quote              sticky, one word per slice of the section's scroll
   projects           sticky card per viewport, the next covers the last
   hero photograph    one frame plus a Klein blue panel, 4% scale on scroll

   Deliberately NOT copied: Lenis. giats wraps the page in it, which is
   exactly the "content drifts backwards while you scroll up" feel. Here
   everything scroll-driven reads position and never velocity.

   Content below is Driesen's, taken from data.js and index.html. Nothing
   is invented: the six products, their metrics, the thirty-one frames,
   the thirty-six stills, the twenty-one shots and the sixteen album pages
   are the real counts.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     0. Content
     ============================================================ */

  /* Six products. Copy rewritten, facts untouched. */
  var WORKS = [
    {
      n: '01', year: '2026', tag: 'AI Interviewer · Coze Agent',
      title: 'AI Interviewer',
      bg: 'What a graduate lacks is not advice. It is a mock interview that feels real. A human coach costs too much, and an ordinary chat bot cannot hold the details of a job.',
      how: 'Three Coze agents split the work: ask, follow up, review. A purpose-built Skill-RAG plugin pulls the CV and the job description into context. Voice in, voice out, a reply inside three seconds.',
      metrics: [['96%', 'Question match'], ['90%', 'CV parsing'], ['3s', 'Voice reply']],
      meta: ['Solo build', 'Coze · DeepSeek-V3.2', 'Delivered'],
      note: 'Third prize, Guangdong provincial collegiate computer design contest'
    },
    {
      n: '02', year: '2026', tag: 'Assertion-level fact check',
      title: 'Verity',
      bg: 'Citations get invented. One unsourced sentence inside a paragraph and the reader will not catch it. The author may not either.',
      how: 'The PDF is split to assertion level and every assertion is traced back. Three verdicts only: sourced, not found, contradicts the source. Each line jumps back to its page.',
      metrics: [['1.000', 'P · R · F1'], ['0.955', 'Rule coverage'], ['pytest 87', 'Tests']],
      meta: ['Solo build', 'Python · SQLite · inverted index', 'Online'],
      link: { label: 'Open', url: 'https://verity-check.app.workbuddy.host' }
    },
    {
      n: '03', year: '2026', tag: 'A/B experiment desk',
      title: 'Verdict',
      bg: 'The usual way an experiment dies: two weeks in, someone notices the sample was never large enough to begin with.',
      how: 'Sample size and duration are computed before launch. SRM imbalance, novelty effect and sequential boundaries are checked on one screen. Frequentist and Bayesian sit side by side, and every verdict can be archived.',
      metrics: [['1,000', 'Sample size'], ['SRM', 'Integrity check'], ['Sequential', 'Boundary']],
      meta: ['Solo build', 'Statistics · both schools', 'Online'],
      link: { label: 'Open', url: 'https://verdict-lab.app.workbuddy.host' }
    },
    {
      n: '04', year: '2026', tag: 'WeChat mini program',
      title: 'Buqi',
      bg: 'A teacher has thirty seconds between classes. Handwritten records do not survive a semester.',
      how: 'Structured records squeezed into thirty seconds. Parent feedback drafted by the model, sent only after the teacher confirms. A full review before submission, every issue cleared before it ships.',
      metrics: [['45', 'Review issues fixed'], ['24 / 24', 'Unit tests'], ['5', 'Cloud functions']],
      meta: ['Solo build', 'WeChat mini program · cloud', 'In debug']
    },
    {
      n: '05', year: '2026', tag: 'Goal breakdown × virtual pet',
      title: 'Dragon Nest',
      bg: 'Goal trackers are not scarce. A reason to keep going is.',
      how: 'Goals break into tasks, and the tasks feed a dragon that grows. One uni-app codebase for web, mini program and app, with regression assertions holding every change in place.',
      metrics: [['14', 'Screens'], ['304', 'Regression assertions'], ['3', 'Targets, one source']],
      meta: ['Solo build', 'uni-app · Capacitor', 'Iterating']
    },
    {
      n: '06', year: '2025', tag: 'Bid integrity AI',
      title: 'Bid Radar',
      bg: 'Winning-bid records are scattered over dozens of platforms. Checking one company means a dozen tabs.',
      how: 'Enter a company name or a credit code and multiple sources aggregate into one profile. Two verdicts only: verified, or not found.',
      metrics: [['¥34.74T', 'Market covered'], ['1.84M', 'Projects a year'], ['Minutes', 'Response']],
      meta: ['Product and build', 'Multi-source · evidence chain', 'Operating'],
      note: 'Built at the Shunde hackathon'
    }
  ];

  /* Thirty-one photographs. Order, names and files are data.js verbatim. */
  var PHOTOS = [
    ['01-eaves', 'Eaves', 'Temple'], ['02-angling', 'Angling', 'City'],
    ['03-sparse-shadows', 'Sparse Shadows', 'Plateau'], ['21-bloom', 'Bloom', 'Still life'],
    ['19-forest-creature', 'Forest Creature', 'Plateau'], ['06-stupa-and-banners', 'Stupa and Banners', 'Temple'],
    ['07-watch', 'Watch', 'Plateau'], ['24-trees-by-the-lake', 'Trees by the Lake', 'Plateau'],
    ['09-cloud-on-the-peak', 'Cloud on the Peak', 'Plateau'], ['10-banners-on-the-road', 'Banners on the Road', 'Plateau'],
    ['17-steam-and-time', 'Steam and Time', 'City'], ['12-snow-ridge', 'Snow Ridge', 'Plateau'],
    ['27-red-brick', 'Red Brick', 'City'], ['14-distant-bridge', 'Distant Bridge', 'City'],
    ['26-urban-pearl', 'Urban Pearl', 'City'], ['16-gate', 'Gate', 'Temple'],
    ['11-evening-haze', 'Evening Haze', 'Plateau'], ['18-water-birds', 'Water Birds', 'Plateau'],
    ['05-succulent', 'Succulent', 'Still life'], ['20-clock-tower', 'Clock Tower', 'Temple'],
    ['04-lone-shadow', 'Lone Shadow', 'Plateau'], ['29-prayer-wheels', 'Prayer Wheels', 'Temple'],
    ['23-bridge-in-grey', 'Bridge in Grey', 'City'], ['08-herding-home', 'Herding Home', 'Plateau'],
    ['25-one-leaf', 'One Leaf', 'Still life'], ['15-flowing-gold', 'Flowing Gold', 'City'],
    ['13-water-on-rock', 'Water on Rock', 'Plateau'], ['28-old-alley', 'Old Alley', 'City'],
    ['22-veins-of-earth', 'Veins of Earth', 'Plateau'], ['30-banner-walk', 'Banner Walk', 'Temple'],
    ['31-sacred-lake', 'Sacred Lake', 'Plateau']
  ];

  /* Wide slots in the photo grid, so 31 frames keep a rhythm. */
  var WIDE = { 0: 1, 6: 1, 13: 1, 21: 1, 28: 1 };

  var FRAMES = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12',
    'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'S22', 'S23', 'S24',
    'S25', 'S26', 'S27', 'S28', 'S29', 'S30', 'S31', 'S32', 'S33', 'S34', 'S35', 'S36'];

  var AWAKEN = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
    '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];

  var NOTES = [
    ['Grid', 'A twelve-column grid. The first screen holds one sentence and gives the rest to the picture.'],
    ['Type', 'Two sizes only. Large type states, small type proves.'],
    ['Space', 'Whitespace paced like breathing. Screens do not explain each other; rhythm carries it.'],
    ['Light', 'One 45-degree backlight throughout. Tone held at silver, so the object stands up on its own.']
  ];

  /* ============================================================
     1. Helpers
     ============================================================ */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function throttle(fn, ms) {
    var t = 0, timer = 0;
    return function () {
      var now = Date.now();
      if (now - t > ms) { t = now; fn(); }
      else if (!timer) {
        timer = setTimeout(function () { timer = 0; t = Date.now(); fn(); }, ms);
      }
    };
  }

  /* ============================================================
     2. Render
     ============================================================ */

  /* Three products get a viewport each; the rest sit in one dense row.
     Six full-screen cards read as one long corridor — the eye stops
     distinguishing them by the third — so the stack keeps only the three
     with the most to show and the others compress to a single band. */
  var FEATURED = 3;

  function renderWorks() {
    var host = $('#workStack');
    var more = $('#workMore');
    if (!host) return;
    var html = '', mhtml = '';
    for (var i = 0; i < WORKS.length; i++) {
      var w = WORKS[i];
      var met = '';
      for (var m = 0; m < w.metrics.length; m++) {
        met += '<li><b>' + w.metrics[m][0] + '</b><span>' + w.metrics[m][1] + '</span></li>';
      }
      var foot = '';
      for (var f = 0; f < w.meta.length; f++) foot += '<span>' + w.meta[f] + '</span>';
      var link = w.link
        ? '<a class="pc-open" href="' + w.link.url + '" target="_blank" rel="noopener">' + w.link.label + ' ↗</a>'
        : '';

      if (i < FEATURED) {
        html += '<div class="slot"><article class="pcard"><div class="pcard-in">'
          + '<div class="pc-top" style="--d:0s"><span>' + w.n + ' / 0' + FEATURED + '</span><span>' + w.year + ' — ' + w.tag + '</span></div>'
          + '<h3 class="pc-title" style="--d:.05s">' + w.title + '</h3>'
          + '<p class="pc-tag" style="--d:.09s">' + w.tag + '</p>'
          + '<div class="pc-body" style="--d:.13s">'
          + '<div><h4>Background</h4><p>' + w.bg + '</p></div>'
          + '<div><h4>Approach</h4><p>' + w.how + '</p></div>'
          + '</div>'
          + '<ul class="pc-metrics" style="--d:.17s">' + met + '</ul>'
          + '<div class="pc-foot" style="--d:.21s">' + foot + link
          + (w.note ? '<span class="pc-note">' + w.note + '</span>' : '')
          + '</div>'
          + '</div></article></div>';
      } else {
        mhtml += '<article class="mcard rv" style="--d:' + ((i - FEATURED) * .06) + 's">'
          + '<div class="mc-top"><span>' + w.n + '</span><span>' + w.year + '</span></div>'
          + '<h3 class="mc-title">' + w.title + '</h3>'
          + '<p class="mc-tag">' + w.tag + '</p>'
          + '<p class="mc-line">' + w.how + '</p>'
          + '<ul class="mc-met">' + met + '</ul>'
          + '<div class="mc-foot"><span>' + w.meta[2] + '</span>' + link + '</div>'
          + (w.note ? '<p class="mc-note">' + w.note + '</p>' : '')
          + '</article>';
      }
    }
    host.innerHTML = html;
    if (more) more.innerHTML = mhtml;
  }

  /* ============================================================
     3c. Photography — Cover Flow shelf
     Same mechanism as the first build, re-skinned. Every input (drag,
     wheel, arrows, swipe) writes one target index; the position eases
     into it. Nothing is driven by velocity, so the shelf cannot
     overshoot and cannot drift back after you let go.
     ============================================================ */
  var cfItems = [], cfPos = 0, cfTarget = 0, cfStep = 200, cfCardH = 320, cfNeed = true;

  function cfLayout() {
    var narrow = window.innerWidth < 700;
    var ang = narrow ? 28 : 44;
    for (var i = 0; i < cfItems.length; i++) {
      var it = cfItems[i];
      var d = it.i - cfPos;
      var ad = Math.abs(d);
      var x = d * cfStep;
      var z = -ad * cfCardH * 0.5;
      var rot = Math.max(-ang, Math.min(ang, -d * ang));
      var sc = Math.max(0.7, 1 - ad * 0.075);
      it.fig.style.transform =
        'translate3d(calc(-50% + ' + x.toFixed(1) + 'px), -50%, ' + z.toFixed(0) + 'px)'
        + ' rotateY(' + rot.toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')';
      it.fig.style.opacity = ad > 3.4 ? '0' : String(Math.max(0.24, 1 - ad * 0.17));
      it.fig.style.zIndex = String(200 - Math.round(ad * 10));
      it.fig.style.pointerEvents = ad > 3.4 ? 'none' : 'auto';
      if (ad < 0.5) it.fig.classList.add('is-center');
      else it.fig.classList.remove('is-center');
    }
  }

  function cfMeta() {
    var i = Math.round(cfPos);
    var p = PHOTOS[i];
    var c = $('#cfCount'), n = $('#cfName');
    if (c) c.textContent = pad(i + 1) + ' / ' + pad(PHOTOS.length);
    if (n && p) n.textContent = p[1] + ' · ' + p[2];
  }

  function cfMeasure() {
    var stage = $('#cfStage');
    if (!stage || !cfItems.length) return;
    var sh = stage.clientHeight;
    var sw = stage.clientWidth;
    cfCardH = Math.round(Math.min(Math.max(sh * 0.82, 190), sw * 0.96, 430));
    for (var i = 0; i < cfItems.length; i++) {
      var it = cfItems[i];
      var iw = it.img.naturalWidth || 1600;
      var ih = it.img.naturalHeight || 1067;
      var asp = iw / ih;
      var h = cfCardH;
      var w = Math.round(h * asp);
      var maxW = Math.round(sw * 0.76);
      if (w > maxW) { w = maxW; h = Math.round(w / asp); }
      it.fig.style.width = (w + 14) + 'px';
      it.fig.style.height = (h + 14) + 'px';
    }
    /* The reference shelf leaves a good third of each neighbour on show.
       At 0.74 the plates overlapped almost completely once the 44deg turn
       compressed them, and the stack read as one smear. */
    cfStep = Math.min(cfCardH * (sw < 700 ? 0.7 : 0.92), sw * (sw < 700 ? 0.46 : 0.26));
    cfNeed = true;
  }

  function renderPhotos() {
    var stage = $('#cfStage');
    if (!stage) return;

    /* reduced motion gets the flat grid: no perspective, no drag */
    if (reduce) {
      var g = document.createElement('div');
      g.className = 'photo-grid';
      g.innerHTML = PHOTOS.map(function (p, i) {
        return '<figure class="ph"><img src="assets/photos/' + p[0] + '.webp" alt="'
          + p[1] + ', ' + p[2] + ', by Driesen" loading="lazy" decoding="async" />'
          + '<figcaption class="ph-cap"><span>' + p[1] + '</span><em>' + pad(i + 1) + ' · ' + p[2] + '</em></figcaption></figure>';
      }).join('');
      stage.appendChild(g);
      stage.style.height = 'auto';
      stage.style.overflow = 'visible';
      return;
    }

    var N = PHOTOS.length;
    for (var i = 0; i < N; i++) {
      var p = PHOTOS[i];
      var fig = document.createElement('figure');
      fig.className = 'cf-item';
      fig.innerHTML = '<div class="cf-card"><img src="assets/photos/' + p[0] + '.webp" alt="'
        + p[1] + ', ' + p[2] + ', by Driesen" draggable="false" decoding="async" loading="lazy" /></div>';
      stage.appendChild(fig);
      cfItems.push({ fig: fig, img: fig.querySelector('img'), p: p, i: i });
    }

    function clampI(v) { return Math.max(0, Math.min(N - 1, v)); }
    function go(i) { cfTarget = clampI(i); }

    function loop() {
      var diff = cfTarget - cfPos;
      if (Math.abs(diff) > 0.0005) { cfPos += diff * 0.16; cfNeed = true; }
      else if (cfPos !== cfTarget) { cfPos = cfTarget; cfNeed = true; }
      if (cfNeed) { cfLayout(); cfMeta(); cfNeed = false; }
      requestAnimationFrame(loop);
    }

    /* ---- drag ---- */
    var down = false, sx = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0;
    var moved = false, captured = false;

    stage.addEventListener('pointerdown', function (e) {
      down = true; moved = false; captured = false;
      sx = lastX = e.clientX; startPos = cfPos; lastT = performance.now(); vel = 0;
      stage.classList.add('is-grabbing');
    });

    stage.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 6 && !moved) {
        moved = true;
        if (!captured) { try { stage.setPointerCapture(e.pointerId); captured = true; } catch (_) {} }
      }
      if (!moved) return;
      cfPos = clampI(startPos - dx / cfStep);
      cfTarget = cfPos;
      cfNeed = true;
      var now = performance.now();
      var dt = Math.max(now - lastT, 16);
      vel = (e.clientX - lastX) / dt;
      lastX = e.clientX; lastT = now;
    });

    function endDrag() {
      if (!down) return;
      down = false;
      stage.classList.remove('is-grabbing');
      var kick = -vel * 260 / cfStep;
      go(Math.round(clampI(cfPos + Math.max(-2, Math.min(2, kick)))));
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerleave', endDrag);

    stage.addEventListener('wheel', function (e) {
      var d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(d) < 2) return;
      e.preventDefault();
      go(Math.round(cfTarget) + (d > 0 ? 1 : -1));
    }, { passive: false });

    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(cfTarget) + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(cfTarget) - 1); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lbOpen(Math.round(cfPos)); }
    });

    cfItems.forEach(function (it) {
      it.fig.addEventListener('click', function () {
        if (moved) return;
        if (Math.abs(cfPos - it.i) < 0.5) lbOpen(it.i);
        else go(it.i);
      });
    });

    window.addEventListener('resize', throttle(cfMeasure, 160), { passive: true });

    var loaded = 0;
    function onImg() { if (++loaded >= N) { cfMeasure(); cfLayout(); } }
    cfItems.forEach(function (it) {
      if (it.img.complete && it.img.naturalWidth) onImg();
      else {
        it.img.addEventListener('load', onImg, { once: true });
        it.img.addEventListener('error', onImg, { once: true });
      }
    });

    cfMeasure(); cfLayout(); cfMeta();
    requestAnimationFrame(loop);
  }

  /* ---- lightbox ---- */
  var lbRoot = null, lbImg = null, lbCap = null, lbCur = -1;

  function lbOpen(i) {
    if (!lbRoot) return;
    i = Math.max(0, Math.min(PHOTOS.length - 1, i));
    lbCur = i;
    var p = PHOTOS[i];
    lbImg.src = 'assets/photos/' + p[0] + '.webp';
    lbImg.alt = p[1] + ', ' + p[2];
    lbCap.textContent = pad(i + 1) + ' / ' + pad(PHOTOS.length) + ' — ' + p[1] + ' · ' + p[2];
    lbRoot.classList.add('open');
    lbRoot.setAttribute('aria-hidden', 'false');
  }

  function lbClose() {
    if (!lbRoot) return;
    lbRoot.classList.remove('open');
    lbRoot.setAttribute('aria-hidden', 'true');
  }

  function initLightbox() {
    lbRoot = $('#lightbox');
    if (!lbRoot) return;
    lbImg = $('#lbImg');
    lbCap = $('#lbCap');
    $('#lbClose').addEventListener('click', lbClose);
    lbRoot.addEventListener('click', function (e) { if (e.target === lbRoot) lbClose(); });
    document.addEventListener('keydown', function (e) {
      if (!lbRoot.classList.contains('open')) return;
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowRight') lbOpen(lbCur + 1);
      if (e.key === 'ArrowLeft') lbOpen(lbCur - 1);
    });
    var tx = 0, ty = 0;
    lbRoot.addEventListener('touchstart', function (e) {
      tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    }, { passive: true });
    lbRoot.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      var dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) lbOpen(lbCur + (dx < 0 ? 1 : -1));
      else if (dy > 70 && Math.abs(dy) > Math.abs(dx)) lbClose();
    });
  }

  function renderFrames() {
    var host = $('#frameGrid');
    if (!host) return;
    var html = '';
    for (var i = 0; i < 36; i++) {
      html += '<figure class="fr" data-n="' + FRAMES[i] + '">'
        + '<img src="assets/frames-grid/g' + pad(i + 1) + '.webp" alt="Back to Zero, frame ' + (i + 1) + '" loading="lazy" decoding="async" />'
        + '</figure>';
    }
    host.innerHTML = html;
  }

  function renderAwaken() {
    var host = $('#awakenGrid');
    if (!host) return;
    var html = '';
    for (var i = 0; i < 21; i++) {
      html += '<figure class="fr" data-n="' + AWAKEN[i] + '">'
        + '<img src="assets/sb/aw' + AWAKEN[i] + '.webp" alt="Awaken, shot ' + AWAKEN[i] + '" loading="lazy" decoding="async" />'
        + '</figure>';
    }
    host.innerHTML = html;
  }

  function renderRails() {
    var s = $('#screenRail');
    if (s) {
      var h = '';
      for (var i = 1; i <= 9; i++) {
        h += '<div class="shot-rail"><img src="assets/aigc/A-0' + i + '.webp" alt="AIGC product page, screen ' + i + '" loading="lazy" decoding="async" /></div>';
      }
      s.innerHTML = h;
    }
    var a = $('#albumRail');
    if (a) {
      var g = '';
      for (var j = 1; j <= 16; j++) {
        g += '<div class="shot-rail"><img src="assets/album/p' + pad(j) + '.webp" alt="Above the Snow Line, page ' + j + '" loading="lazy" decoding="async" /></div>';
      }
      a.innerHTML = g;
    }
    var n = $('#notes');
    if (n) {
      var m = '';
      for (var k = 0; k < NOTES.length; k++) {
        m += '<li><b>' + NOTES[k][0] + '</b><span>' + NOTES[k][1] + '</span></li>';
      }
      n.innerHTML = m;
    }
  }

  function renderMarquee() {
    var t = $('#marqueeTrack');
    if (!t) return;
    var unit = '<span class="mq">Scroll Down</span><span class="mq mq-stroke">Scroll Down</span>';
    t.innerHTML = unit + unit + unit + unit;
  }

  /* ============================================================
     3. Word splitting
     Body copy is split into inline words so each can lift on its own.
     Only the text is rewritten, never the line boxes, so nothing breaks
     in a place the browser would not have broken it anyway.
     ============================================================ */
  function splitWords(el) {
    if (el.__split) return;
    var text = el.textContent;
    if (!text || !text.trim()) return;
    el.__split = true;
    var parts = text.split(/(\s+)/);
    var frag = document.createDocumentFragment();
    var n = 0;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p) continue;
      if (/^\s+$/.test(p)) {
        frag.appendChild(document.createTextNode(p));
      } else {
        var sp = document.createElement('span');
        sp.className = 'w';
        sp.textContent = p;
        sp.style.setProperty('--d', Math.min(n * 0.022, 0.42).toFixed(3) + 's');
        frag.appendChild(sp);
        n++;
      }
    }
    el.textContent = '';
    el.appendChild(frag);
  }

  /* ============================================================
     3b. Character split
     giats types its section headings out one letter at a time, each
     rising out of its own baseline. Spaces are kept as text so the line
     still breaks where it should; <br> and <b> survive untouched.
     ============================================================ */
  function splitChars(el) {
    var i = 0;

    function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      for (var k = 0; k < kids.length; k++) {
        var n = kids[k];
        if (n.nodeType === 3) {
          var txt = n.nodeValue;
          if (!txt.replace(/\s/g, '').length) continue;
          var frag = document.createDocumentFragment();
          for (var c = 0; c < txt.length; c++) {
            var ch = txt.charAt(c);
            if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
            var sp = document.createElement('span');
            sp.className = 'chr';
            sp.textContent = ch;
            sp.style.setProperty('--i', i++);
            frag.appendChild(sp);
          }
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      }
    }

    walk(el);
    el.classList.add('split');
  }

  /* ============================================================
     4. Entrance
     One observer for everything, plus a sweep that resolves anything
     at or above the fold. The sweep is not belt and braces: an observer
     alone can leave an element stuck invisible if it is scrolled past
     between two layout states, and a blank heading on screen is worse
     than no animation at all.
     ============================================================ */
  var watch = [];

  function observe(el) {
    watch.push(el);
  }

  function markIn(el) {
    if (el.__in) return;
    el.__in = true;
    el.classList.add('in');
  }

  function sweep() {
    var vh = window.innerHeight || 800;
    for (var i = 0; i < watch.length; i++) {
      var el = watch[i];
      if (el.__in) continue;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > -vh) markIn(el);
    }
  }

  function initEntrance() {
    $$('.words').forEach(splitWords);
    $$('.split-on-view').forEach(splitChars);

    $$('.rv, .words, .hl, .cl, .ch, .stat, .scene, .f-quote, .pcard-in, .shot, .about-photo, .split-on-view')
      .forEach(function (el) { observe(el); });

    /* grids and rails resolve as a block: thirty-six separate clips would
       be both expensive and noisy */
    ['#frameGrid', '#awakenGrid', '#screenRail', '#albumRail', '#notes'].forEach(function (s) {
      var el = $(s);
      if (el && !el.classList.contains('rv')) {
        el.classList.add('rv');
        observe(el);
      }
    });

    if (reduce) { watch.forEach(markIn); return; }

    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            markIn(entries[i].target);
            io.unobserve(entries[i].target);
          }
        }
      }, { threshold: 0.06 });
      watch.forEach(function (el) { io.observe(el); });
    }

    sweep();
    window.addEventListener('scroll', throttle(sweep, 90), { passive: true });
    window.addEventListener('resize', throttle(sweep, 200), { passive: true });
    window.addEventListener('load', sweep);
    /* last resort: after 2.4s nothing on screen is allowed to stay blank */
    setTimeout(sweep, 2400);
  }

  /* ============================================================
     5. Boot card
     ============================================================ */
  function initBoot() {
    var el = $('#boot');
    if (!el) return;
    if (reduce) { el.style.display = 'none'; return; }
    /* a plain timeout rather than rAF: the first frame of a heavy page can
       be 500ms away, and the card would then be fully drawn for a blink
       before it starts fading again */
    setTimeout(function () { el.classList.add('open'); }, 40);
    setTimeout(function () { el.classList.add('done'); }, 1260);
    setTimeout(function () { el.style.display = 'none'; }, 1950);
  }

  /* ============================================================
     6. Menu
     ============================================================ */
  function initMenu() {
    var btn = $('#menuBtn'), menu = $('#menu');
    if (!btn || !menu) return;

    function set(open) {
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      /* the label itself is two stacked faces — writing textContent here
         would delete both of them, which is what blanked the button */
      document.body.classList.toggle('menu-open', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
    }

    btn.addEventListener('click', function () {
      set(!menu.classList.contains('open'));
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { set(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) set(false);
    });
  }

  /* ============================================================
     6b. Wordmark tone
     The footer is a black band; a fixed ink wordmark would disappear
     into it. One observer, one class — no scroll listener, no blend
     mode repainting the header on every frame.
     ============================================================ */
  function initLogo() {
    var logo = $('.gn-logo');
    var foot = $('.foot');
    if (!logo || !foot || !window.IntersectionObserver) return;
    new IntersectionObserver(function (entries) {
      logo.classList.toggle('on-dark', entries[0].isIntersecting);
    }, { rootMargin: '0px 0px -86% 0px' }).observe(foot);
  }

  /* ============================================================
     7. Hero photograph
     The puzzle is gone, so there is nothing to measure or seat. What is
     left is a slow scale driven by scroll position: the frame creeps in
     by four percent over the first 520px, which gives the photograph a
     little depth without ever moving it against the scroll.
     ============================================================ */
  var heroShot = null;

  function paintHero(y) {
    if (!heroShot) return;
    var s = (1 + 0.045 * clamp(y / 520, 0, 1)).toFixed(4);
    if (s !== paintHero.__s) {
      paintHero.__s = s;
      heroShot.style.setProperty('--hs', s);
    }
  }

  /* ============================================================
     8. Running strip
     giats travels about 185px/s on its own, plus 0.09 of every pixel of
     downward scroll. Upward scroll does not reverse it — that reads as a
     fault, not as an effect.
     ============================================================ */
  var track = null, mqX = 0, mqHalf = 1;

  function measureMarquee() {
    if (!track) return;
    mqHalf = (track.scrollWidth || 1) / 2;
  }

  function paintMarquee(dt, dy) {
    if (!track) return;
    mqX -= 180 * dt + Math.max(0, dy) * 0.09;
    if (mqX <= -mqHalf) mqX += mqHalf;
    track.style.transform = 'translate3d(' + mqX.toFixed(1) + 'px,0,0)';
  }

  /* ============================================================
     9. Quote — the sentence assembles itself
     Every word starts displaced, turned, enlarged and half-faded, and
     travels home as the section scrolls. The paragraph is laid out
     once, at rest, and only transform ever changes, so nothing reflows
     and no line ever jumps.
     ============================================================ */
  var quoteEl = null, quoteBox = null, quoteWords = [];

  /* Deterministic jitter. Math.random would give a different composition
     on every reload, which is fine for the eye and useless for checking
     one build against another. */
  function rnd(i, s) {
    var x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function splitQuote() {
    var el = $('#quoteText');
    if (!el) return;
    quoteEl = el;
    quoteBox = $('#quote');
    var text = el.textContent.trim();
    var parts = text.split(/(\s+)/);
    var frag = document.createDocumentFragment();
    /* offsets shrink on a narrow screen or the words leave the frame
       entirely and the sentence never appears */
    var spread = clamp((window.innerWidth || 1200) / 1200, 0.42, 1);
    quoteWords = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p) continue;
      if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); continue; }
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = p;
      s.style.setProperty('--wx', ((rnd(i, 1) * 2 - 1) * 240 * spread).toFixed(1));
      s.style.setProperty('--wy', ((rnd(i, 2) * 2 - 1) * 168 * spread).toFixed(1));
      s.style.setProperty('--wr', ((rnd(i, 3) * 2 - 1) * 9).toFixed(1));
      s.style.setProperty('--ws', (rnd(i, 4) * 0.95).toFixed(2));
      s.style.setProperty('--wf', (0.48 + rnd(i, 5) * 0.44).toFixed(2));
      s.style.setProperty('--mxf', ((rnd(i, 6) * 2 - 1) * 15).toFixed(1));
      frag.appendChild(s);
      quoteWords.push(s);
    }
    el.textContent = '';
    el.appendChild(frag);
    if (reduce && quoteBox) quoteBox.style.setProperty('--q', '0');
  }

  function paintQuote(y) {
    if (!quoteBox || !quoteWords.length) return;
    var vh = window.innerHeight || 800;
    var r = quoteBox.getBoundingClientRect();
    var top = r.top + y;
    var span = quoteBox.offsetHeight - vh;
    var p = clamp((y - top) / (span || 1), 0, 1);
    /* Seated at 52% of the travel; the remaining half of the section is
       hold, so the sentence can actually be read before it leaves. */
    var t = clamp((p - 0.02) / 0.5, 0, 1);
    var seat = t * t * (3 - 2 * t);
    var q = (1 - seat).toFixed(3);
    if (q !== paintQuote.__q) {
      paintQuote.__q = q;
      quoteBox.style.setProperty('--q', q);
    }
    /* the three oversized words stay out of the way until the section is
       actually on screen, then hold at one strength */
    var gq = clamp(p * 6, 0, 1).toFixed(2);
    if (gq !== paintQuote.__g) {
      paintQuote.__g = gq;
      quoteBox.style.setProperty('--gq', gq);
    }
  }

  /* ============================================================
     9b. Pointer — one number for the whole page
     --mx runs from -1 at the left edge to 1 at the right, --my the same
     top to bottom. Layers multiply it by their own --mul; nothing reads
     the mouse directly, so a layer cannot jump when the pointer enters,
     leaves, or teleports across the window. The value eases toward the
     pointer rather than copying it — the lag is the breathing, and at
     0.07 per frame it settles in about a third of a second.
     ============================================================ */
  var px = { tx: 0, ty: 0, cx: 0, cy: 0, on: false };

  function initPointer() {
    if (reduce) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    px.on = true;
    window.addEventListener('pointermove', function (e) {
      px.tx = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
      px.ty = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget) { px.tx = 0; px.ty = 0; }
    });
  }

  function stepPointer() {
    if (!px.on) return;
    var dx = px.tx - px.cx, dy = px.ty - px.cy;
    if (Math.abs(dx) < 0.0012 && Math.abs(dy) < 0.0012) {
      if (px.cx !== px.tx || px.cy !== px.ty) {
        px.cx = px.tx; px.cy = px.ty;
        var st = document.documentElement.style;
        st.setProperty('--mx', px.cx.toFixed(3));
        st.setProperty('--my', px.cy.toFixed(3));
      }
      return;
    }
    px.cx += dx * 0.07;
    px.cy += dy * 0.07;
    var s = document.documentElement.style;
    s.setProperty('--mx', px.cx.toFixed(3));
    s.setProperty('--my', px.cy.toFixed(3));
  }

  /* ============================================================
     9c. Ink — Klein blue, a pool of lagging blobs trailing the pointer.
     The reference runs a WebGL fluid; seven soft circles, each
     easing toward the pointer at its own rate and swayed by its
     own sine, read the same at a fraction of the cost. Overlap
     darkens the core the way real ink pools. The layer erases a
     slice of itself every frame, so a resting pointer evaporates
     in about a second and nothing is left behind.
     ============================================================ */
  var ink = null, inkCtx = null, inkBlobs = [], inkOn = false;
  var inkMx = -1, inkMy = -1;

  function initInk() {
    if (reduce) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    ink = $('#ink');
    if (!ink || !ink.getContext) return;
    inkCtx = ink.getContext('2d');
    if (!inkCtx) return;
    inkOn = true;
    sizeInk();

    /* A small blot, not a creature: radii stay under 30px, the sway is
       barely a pixel or two, and every blob closes on the pointer fast
       enough that the pool never separates into a trailing tentacle.
       The wide, laggy version read as something alive. */
    var cfg = [
      { lag: .135, r: 26, ax: 5, ay: 4, f: .00042, ph: 0.0 },
      { lag: .180, r: 20, ax: -6, ay: 5, f: .00055, ph: 1.3 },
      { lag: .225, r: 22, ax: 4, ay: -5, f: .00037, ph: 2.6 },
      { lag: .270, r: 16, ax: -4, ay: -3, f: .00061, ph: 3.9 },
      { lag: .315, r: 23, ax: 5, ay: 2, f: .00048, ph: 5.1 }
    ];
    for (var i = 0; i < cfg.length; i++) {
      inkBlobs.push({ x: -100, y: -100, c: cfg[i] });
    }

    window.addEventListener('pointermove', function (e) {
      inkMx = e.clientX;
      inkMy = e.clientY;
      /* first contact: snap the whole pool onto the pointer so it
         does not swim in from the top-left corner */
      if (inkBlobs[0] && inkBlobs[0].x < -50) {
        for (var j = 0; j < inkBlobs.length; j++) {
          inkBlobs[j].x = inkMx;
          inkBlobs[j].y = inkMy;
        }
      }
    }, { passive: true });

    window.addEventListener('resize', throttle(sizeInk, 140), { passive: true });
  }

  function sizeInk() {
    if (!ink || !inkCtx) return;
    var d = Math.min(window.devicePixelRatio || 1, 2);
    ink.width = Math.round(window.innerWidth * d);
    ink.height = Math.round(window.innerHeight * d);
    inkCtx.setTransform(d, 0, 0, d, 0, 0);
  }

  function stepInk(t) {
    if (!inkOn) return;
    var c = inkCtx;
    var w = window.innerWidth, h = window.innerHeight;

    /* evaporate — faster than before: a short smudge behind the cursor,
       gone in about half a second */
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = 'rgba(0,0,0,0.085)';
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'source-over';

    if (inkMx < 0) return;

    for (var i = 0; i < inkBlobs.length; i++) {
      var b = inkBlobs[i], k = b.c;
      b.x += (inkMx - b.x) * k.lag;
      b.y += (inkMy - b.y) * k.lag;
      var x = b.x + Math.sin(t * k.f + k.ph) * k.ax;
      var y = b.y + Math.cos(t * k.f * 1.3 + k.ph) * k.ay;
      var g = c.createRadialGradient(x, y, 0, x, y, k.r);
      /* A light wash of Klein blue rather than wet ink. Multiply pushed
         the overlapping cores to navy; plain alpha keeps the trail in
         the blue range however many blobs pile up. */
      g.addColorStop(0, 'rgba(0,47,167,0.085)');
      g.addColorStop(1, 'rgba(0,47,167,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, k.r, 0, 6.2832);
      c.fill();
    }
  }

  /* ============================================================
     10. Progress hairline
     ============================================================ */
  var fill = null;

  function paintBar(y) {
    if (!fill) return;
    var max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    var p = clamp(y / max, 0, 1);
    if (Math.abs(p - (paintBar.__p || -1)) < 0.0015) return;
    paintBar.__p = p;
    fill.style.height = (p * 100).toFixed(2) + '%';
  }

  /* ============================================================
     11. Stats — count up once, on arrival
     ============================================================ */
  function initStats() {
    var stats = $$('.stat');
    if (!stats.length) return;
    if (reduce) {
      stats.forEach(function (s) {
        var b = $('b', s);
        if (b) b.textContent = b.getAttribute('data-count');
      });
      return;
    }
    var done = false;
    function run() {
      if (done) return;
      done = true;
      var t0 = 0;
      function step(t) {
        if (!t0) t0 = t;
        var p = clamp((t - t0) / 900, 0, 1);
        var e = 1 - Math.pow(1 - p, 3);
        stats.forEach(function (s) {
          var b = $('b', s);
          if (!b) return;
          var target = parseFloat(b.getAttribute('data-count')) || 0;
          b.textContent = Math.round(target * e);
        });
        if (p < 1) raf(step);
      }
      raf(step);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { run(); io.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(stats[0].parentNode);
    } else { run(); }
    setTimeout(run, 4000);
  }

  /* ============================================================
     12. Rails — drag to scroll
     ============================================================ */
  function initRails() {
    $$('.rail').forEach(function (rail) {
      var down = false, startX = 0, startL = 0;
      rail.__moved = 0;
      rail.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        down = true;
        rail.__moved = 0;
        startX = e.clientX;
        startL = rail.scrollLeft;
        rail.style.cursor = 'grabbing';
      });
      rail.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        rail.__moved = Math.abs(dx);
        rail.scrollLeft = startL - dx;
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
        rail.addEventListener(ev, function () {
          down = false;
          rail.style.cursor = '';
        });
      });
      rail.addEventListener('click', function (e) {
        if (rail.__moved > 6) { e.preventDefault(); e.stopPropagation(); }
      }, true);
    });
  }

  /* ============================================================
     13. Clock in the menu
     ============================================================ */
  function initClock() {
    var el = $('#clock');
    if (!el) return;
    function tick() {
      try {
        el.textContent = new Date().toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit'
        });
      } catch (e) { el.textContent = ''; }
    }
    tick();
    setInterval(tick, 20000);
  }

  /* ============================================================
     14. Frame loop
     Every value below reads scroll POSITION. Nothing reads velocity,
     so nothing can lag behind the finger.
     ============================================================ */
  var lastY = -1, lastT = 0;

  function frame(t) {
    var now = t || 0;
    var dt = lastT ? clamp((now - lastT) / 1000, 0.004, 0.05) : 0.016;
    lastT = now;

    var y = window.scrollY || window.pageYOffset || 0;
    var dy = lastY < 0 ? 0 : y - lastY;
    lastY = y;

    if (!reduce) {
      stepPointer();
      stepInk(now);
      paintHero(y);
      paintMarquee(dt, dy);
    }
    paintQuote(y);
    paintBar(y);
    raf(frame);
  }

  /* ============================================================
     15. Boot
     ============================================================ */
  function boot() {
    heroShot = $('#heroShot');
    track = $('#marqueeTrack');
    fill = $('#barFill');

    renderWorks();
    renderPhotos();
    renderFrames();
    renderAwaken();
    renderRails();
    renderMarquee();

    var pc = $('#photoCount');
    if (pc) pc.textContent = PHOTOS.length + ' frames';

    initLightbox();
    initBoot();
    initMenu();
    initLogo();
    initEntrance();
    initStats();
    initRails();
    initClock();
    initPointer();
    initInk();
    splitQuote();

    measureMarquee();

    paintHero(window.scrollY || 0);
    paintQuote(window.scrollY || 0);
    paintBar(window.scrollY || 0);

    if (reduce) return;

    raf(frame);

    window.addEventListener('resize', throttle(function () {
      measureMarquee();
      paintQuote.__q = null;
      paintQuote(window.scrollY || 0);
    }, 140), { passive: true });

    window.addEventListener('load', function () { measureMarquee(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { measureMarquee(); });
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { lastY = -1; lastT = 0; }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
