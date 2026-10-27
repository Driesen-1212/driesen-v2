/* ============================================================
   site-band.js — 章节滚动横幅
   ------------------------------------------------------------
   给每个 .section 的 .container 开头插一条字带，然后：
   · 重复到至少 1.05 屏宽，整段复制一份，位移 -50% 即无缝
   · 时长按宽度算，恒速 62px/s（宽屏也不会跑得更快）
   · 离屏暂停，别让 7 条带子在后台白烧电

   零依赖；不碰任何已有逻辑。
   ============================================================ */
(function () {
  'use strict';

  var SPEED = 62;          /* px / s */
  var recs = [];
  var ro = null;

  function labelOf(sec) {
    var custom = sec.getAttribute('data-band');
    if (custom) return custom.trim();

    var eb = sec.querySelector('.eyebrow');
    var txt = eb ? (eb.textContent || '') : '';
    /* "01 — ABOUT" / "02 - SELECTED WORK" → 取破折号后面那段 */
    var parts = txt.split(/[\u2014\u2013\u2015\-—–]/);
    var last = (parts.pop() || '').replace(/\s+/g, ' ').trim();
    if (last) return last;

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

    var w = rec.runA.scrollWidth;
    rec.track.style.setProperty('--dur', (w / SPEED).toFixed(1) + 's');
  }

  function build(sec) {
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

    var rec = { band: band, track: track, runA: runA, runB: runB, text: text };
    recs.push(rec);
    measure(rec);

    /* 离屏暂停：滚到这一章才跑 */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        for (var i = 0; i < es.length; i++) {
          es[i].target.style.animationPlayState = es[i].isIntersecting ? 'running' : 'paused';
        }
      }, { rootMargin: '150px 0px' });
      io.observe(band);
    }
  }

  function relayout() {
    for (var i = 0; i < recs.length; i++) measure(recs[i]);
  }

  function init() {
    var secs = document.querySelectorAll('main .section');
    for (var i = 0; i < secs.length; i++) build(secs[i]);

    window.addEventListener('resize', relayout, { passive: true });
    window.addEventListener('load', relayout);
    /* 字体到位后单字宽会变，重排一次 */
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
