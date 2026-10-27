/* ============================================================
   site-band.js — 章节滚动横幅（带呼吸）
   ------------------------------------------------------------
   给每个 .section 的 .container 开头插一条字带，然后：
   · 重复到至少 1.05 屏宽，整段复制一份，位移走满一整段即无缝
   · 速度按正弦起伏（62px/s ±16%，周期 9s），像在呼吸而不是匀速跑
   · 呼吸相位逐条错开 1.4s，七条带子不会一起吸气一起呼气
   · 同一相位写进 --bh，CSS 用它做明暗和微缩放
   · 离屏整条暂停

   零依赖；不碰任何已有逻辑。
   ============================================================ */
(function () {
  'use strict';

  var SPEED = 62;        /* px / s 基准速度 */
  var PERIOD = 9000;     /* 呼吸周期 ms */
  var AMP = 0.16;        /* 速度起伏幅度 */
  var PHASE_GAP = 1400;  /* 相邻带子的相位差 ms */
  var TAU = Math.PI * 2;

  var recs = [];
  var rafId = 0;
  var last = 0;

  function labelOf(sec) {
    var custom = sec.getAttribute('data-band');
    if (custom) return custom.trim();

    var eb = sec.querySelector('.eyebrow');
    var txt = eb ? (eb.textContent || '') : '';
    /* "01 — ABOUT" / "02 - SELECTED WORK" → 取破折号后面那段 */
    var parts = txt.split(/[\u2014\u2013\u2015\-—–]/);
    var lastPart = (parts.pop() || '').replace(/\s+/g, ' ').trim();
    if (lastPart) return lastPart;

    return (sec.id || '').replace(/[-_]+/g, ' ').toUpperCase();
  }

  function fill(run, text, n) {
    var html = '';
    for (var i = 0; i < n; i++) html += '<span>' + text + '</span>';
    run.innerHTML = html;
  }

  function measure(rec) {
    var vw = rec.band.clientWidth || window.innerWidth;
    if (!vw) return;

    fill(rec.runA, rec.text, 1);
    var one = rec.runA.scrollWidth;
    if (!one) return;

    var n = Math.ceil((vw * 1.05) / one) + 1;
    fill(rec.runA, rec.text, n);
    fill(rec.runB, rec.text, n);

    rec.runW = rec.runA.scrollWidth || one;
    if (rec.x < -rec.runW || rec.x > 0) rec.x = 0;
  }

  function still(rec) {
    rec.track.style.transform = 'translate3d(0,0,0)';
    rec.track.style.setProperty('--bh', '.72');
  }

  function loop(now) {
    rafId = 0;
    var dt = last ? Math.min(now - last, 60) : 16;
    last = now;

    var alive = false;
    for (var i = 0; i < recs.length; i++) {
      var rec = recs[i];
      if (!rec.on || !rec.runW) continue;
      alive = true;

      rec.t += dt;
      /* s: -1 呼尽 → 1 吸满 */
      var s = Math.sin((rec.t / PERIOD) * TAU);
      var sp = SPEED * (1 + AMP * s);

      rec.x -= (sp * dt) / 1000;
      if (rec.x <= -rec.runW) rec.x += rec.runW;
      if (rec.x > 0) rec.x -= rec.runW;

      var bh = (s + 1) / 2;
      rec.track.style.transform =
        'translate3d(' + rec.x.toFixed(1) + 'px,0,0) scale(' +
        (0.993 + 0.012 * bh).toFixed(4) + ')';
      rec.track.style.setProperty('--bh', bh.toFixed(3));
    }

    if (alive) rafId = requestAnimationFrame(loop);
    else last = 0;
  }

  function kick() {
    if (!rafId) {
      last = 0;
      rafId = requestAnimationFrame(loop);
    }
  }

  function build(sec, i) {
    if (sec.__band) return;
    var text = labelOf(sec);
    if (!text) return;

    var host = sec.querySelector('.container') || sec;
    sec.__band = 1;

    var band = document.createElement('div');
    band.className = 'band';
    band.setAttribute('aria-hidden', 'true');

    var track = document.createElement('div');
    track.className = 'band-track';

    var runA = document.createElement('div');
    runA.className = 'band-run';
    var runB = document.createElement('div');
    runB.className = 'band-run';
    fill(runB, text, 1);

    track.appendChild(runA);
    track.appendChild(runB);
    band.appendChild(track);
    host.insertBefore(band, host.firstChild);

    var rec = {
      band: band, track: track, runA: runA, runB: runB,
      text: text, runW: 0, x: 0, t: i * PHASE_GAP, on: false
    };
    recs.push(rec);
    measure(rec);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        for (var k = 0; k < es.length; k++) {
          var r = null;
          for (var q = 0; q < recs.length; q++) {
            if (recs[q].band === es[k].target) { r = recs[q]; break; }
          }
          if (!r) continue;
          r.on = es[k].isIntersecting;
          if (r.on) kick();
        }
      }, { rootMargin: '150px 0px' });
      io.observe(band);
    } else {
      rec.on = true;
      kick();
    }
  }

  function relayout() {
    for (var i = 0; i < recs.length; i++) measure(recs[i]);
  }

  function init() {
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var secs = document.querySelectorAll('main .section');
    for (var i = 0; i < secs.length; i++) build(secs[i], i);

    if (reduce) {
      for (var k = 0; k < recs.length; k++) still(recs[k]);
      return;
    }

    window.addEventListener('resize', relayout, { passive: true });
    window.addEventListener('load', relayout);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(relayout).catch(function () {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
