/* ============================================================
   site-color.js — 章节换色（唯一新增的 JS）
   ------------------------------------------------------------
   按「视口中心落在哪一章」决定色站，越接近下一章边界越往下一色过渡。
   零依赖、不新增 DOM、不改动任何原有逻辑。
   删掉这个文件和 index.html 里两行引用即可完全回到原样。
   ============================================================ */
(function () {
  'use strict';

  /* 色站：与章节顺序一一对应
     00 首屏      靛蓝
     01 ABOUT     琥珀
     02 WORK      冰青
     03 PHOTO     中性
     04 AIGC      紫
     05 IMPRINT   墨绿
     06 STUDIO    暗金
     07 CONTACT   靛蓝 */
  var STOPS = [
    { bg: [11, 13, 21], ac: '#6a86ff' },
    { bg: [18, 16, 12], ac: '#e0a367' },
    { bg: [10, 17, 22], ac: '#56c0dc' },
    { bg: [7, 8, 9], ac: '#d9d5c8' },
    { bg: [15, 10, 23], ac: '#b07ae8' },
    { bg: [9, 18, 16], ac: '#52cfa2' },
    { bg: [18, 16, 10], ac: '#e0b65a' },
    { bg: [11, 13, 21], ac: '#6a86ff' }
  ];

  var html = document.documentElement;
  var secs = [];
  var VH = window.innerHeight || 800;
  var curStop = -1;
  var lastBg = '';
  var ticking = false;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 章节顶边位置。v19 的图没有固定尺寸，图片加载后页面高度会变，
     所以每次尺寸变化都重新量一遍 */
  function measure() {
    VH = window.innerHeight || 800;
    var list = document.querySelectorAll('main .section');
    secs = [];
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      secs.push({ top: r.top + window.pageYOffset, h: r.height });
    }
  }

  function paint(y) {
    var cy = y + VH * 0.5;
    var idx = -1;
    for (var i = secs.length - 1; i >= 0; i--) {
      if (cy >= secs[i].top) { idx = i; break; }
    }

    /* 首屏落在色站 0；章节 0 对应色站 1 */
    var base = clamp(idx + 1, 0, 7);
    var next = clamp(base + 1, 0, 7);

    /* 过渡窗口贴着章节边界：距下一章顶部 0.95 屏才起步，
       压在边界处完成 —— 免得一章很长时在中段就换完色 */
    var sec = secs[idx];
    var nextTop = secs[idx + 1] ? secs[idx + 1].top
      : (sec ? sec.top + sec.h : cy + 1e9);
    var t = idx < 0 ? 0 : clamp(1 - (nextTop - cy) / (VH * 0.95), 0, 1);

    var a = STOPS[base].bg;
    var b = STOPS[next].bg;
    var key = Math.round(a[0] + (b[0] - a[0]) * t) + ',' +
      Math.round(a[1] + (b[1] - a[1]) * t) + ',' +
      Math.round(a[2] + (b[2] - a[2]) * t);

    if (key !== lastBg) {
      lastBg = key;
      html.style.setProperty('--bg', 'rgb(' + key + ')');
    }

    /* 强调色整段切换，交给 CSS 的 --accent 过渡 */
    var stop = t > 0.5 ? next : base;
    if (stop !== curStop) {
      curStop = stop;
      html.style.setProperty('--accent', STOPS[stop].ac);
    }
  }

  function update() { ticking = false; paint(window.pageYOffset); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function refresh() { measure(); paint(window.pageYOffset); }

  function init() {
    refresh();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('load', refresh);
    /* 图片/内容撑开后章节位置会变，重排一次 */
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(refresh);
      ro.observe(document.body);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
