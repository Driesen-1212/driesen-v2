/* ============================================================
   site-color.js — 章节换色（唯一新增的 JS）
   ------------------------------------------------------------
   纯氛围层：按滚动位置把 --bg / --accent 混成连续色。
   零依赖、不新增 DOM、不改动任何原有逻辑。
   删掉这个文件和 index.html 里两行引用即可完全回到原样。

   柔化三招（2026-10-27 用户反馈「颜色转变太硬」后重写）：
   1) 滚动值先做惯性跟随再算颜色 —— 滚轮一格跳 120px 也不会闪色
   2) 颜色进度按「边界累计」算，不再按章节索引切换
      （旧写法在跨过边界那一帧会从半混色直接跳到纯色，就是「硬」的来源）
   3) 颜色在线性光空间插值，暗部中段不会泛灰发闷
   ============================================================ */
(function () {
  'use strict';

  /* 色站：与「首屏 + 7 个 section」一一对应
     0 首屏      靛蓝
     1 ABOUT     琥珀
     2 WORK      冰青
     3 PHOTO     中性
     4 AIGC      紫
     5 IMPRINT   墨绿
     6 STUDIO    暗金
     7 CONTACT   靛蓝 */
  var STOPS = [
    { bg: [11, 13, 21], ac: [106, 134, 255] }, /* #6a86ff */
    { bg: [18, 16, 12], ac: [224, 163, 103] }, /* #e0a367 */
    { bg: [10, 17, 22], ac: [86, 192, 220] },  /* #56c0dc */
    { bg: [7, 8, 9],    ac: [217, 213, 200] }, /* #d9d5c8 */
    { bg: [15, 10, 23], ac: [176, 122, 232] }, /* #b07ae8 */
    { bg: [9, 18, 16],  ac: [82, 207, 162] },  /* #52cfa2 */
    { bg: [18, 16, 10], ac: [224, 182, 90] },  /* #e0b65a */
    { bg: [11, 13, 21], ac: [106, 134, 255] }
  ];
  var MAXI = STOPS.length - 1;   /* 最大色站索引 = 7 */

  /* ---- 颜色空间：sRGB <-> 线性光 ----
     直接对 0-255 插值，暗色在中段会明显泛亮（看着就是「啪」一下变灰）；
     转到线性光再混，亮度过渡跟真实光一样连续 */
  function toLin(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function toSrgb(v) {
    var c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    c = Math.round(c * 255);
    return c < 0 ? 0 : (c > 255 ? 255 : c);
  }
  for (var s = 0; s < STOPS.length; s++) {
    STOPS[s].bgL = STOPS[s].bg.map(toLin);
    STOPS[s].acL = STOPS[s].ac.map(toLin);
  }

  function mix(aL, bL, t) {
    return 'rgb(' +
      toSrgb(aL[0] + (bL[0] - aL[0]) * t) + ',' +
      toSrgb(aL[1] + (bL[1] - aL[1]) * t) + ',' +
      toSrgb(aL[2] + (bL[2] - aL[2]) * t) + ')';
  }

  var html = document.documentElement;
  var secs = [];
  var edges = [];          /* 每条缝：{ y, f, b } = 位置 / 前带宽 / 后带宽 */
  var VH = window.innerHeight || 800;
  var lastBg = '';
  var lastAc = '';

  var target = window.pageYOffset;   /* 真实滚动位置 */
  var smooth = target;               /* 拿去算颜色的位置 */
  var rafId = 0;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function smoothstep(t) { return t * t * (3 - 2 * t); }

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

  /* 每条缝一条过渡带，中心压在缝上：前 1.15 屏起手、后 0.65 屏收尾（总计约 1.8 屏）。
     带宽还要让给相邻缝一半距离，否则两个窗口叠在一起，颜色会连跳两站。 */
  function buildEdges() {
    edges = [];
    var n = Math.min(secs.length, MAXI);       /* 最多 7 条缝 */
    for (var k = 0; k < n; k++) {
      var y = secs[k].top;
      var prev = k > 0 ? secs[k - 1].top : 0;
      var nxt = (k + 1 < secs.length) ? secs[k + 1].top : (secs[k].top + secs[k].h);
      var gp = y - prev;
      var gn = Math.max(nxt - y, 1);
      /* 第一条缝前面是页面顶端，没有相邻窗口，可以给满宽 */
      var f = k === 0 ? VH * 1.15 : Math.min(VH * 1.15, gp * 0.5);
      var b = Math.min(VH * 0.65, gn * 0.5);
      if (f + b < 60) { f = 30; b = 30; }
      edges.push({ y: y, f: f, b: b });
    }
  }

  function paint(y) {
    var cy = y + VH * 0.5;

    /* 累计色站进度 u：过一条缝 +1。u 是连续量，
       base = floor(u)、t = u - base，跨站那一刻正好落在整数上，颜色不断 */
    var u = 0;
    for (var k = 0; k < edges.length; k++) {
      var e = edges[k];
      var t = (cy - (e.y - e.f)) / (e.f + e.b);
      if (t <= 0) break;                    /* 后面的缝更远，不用看了 */
      u += smoothstep(clamp(t, 0, 1));
    }
    if (u > MAXI) u = MAXI;

    var base = Math.floor(u);
    if (base > MAXI) base = MAXI;
    var next = base + 1 > MAXI ? MAXI : base + 1;
    var k2 = u - base;

    var bg = mix(STOPS[base].bgL, STOPS[next].bgL, k2);
    if (bg !== lastBg) {
      lastBg = bg;
      html.style.setProperty('--bg', bg);
    }

    /* 强调色走同一根进度，逐帧混 —— 不再整段切换，
       所以编号、下划线、按钮不会「啪」地换一个色 */
    var ac = mix(STOPS[base].acL, STOPS[next].acL, k2);
    if (ac !== lastAc) {
      lastAc = ac;
      html.style.setProperty('--accent', ac);
    }
  }

  function loop() {
    rafId = 0;
    var d = target - smooth;
    if (Math.abs(d) < 0.5) smooth = target;
    else smooth += d * 0.13;         /* 每帧吃掉 13% 差距，约 0.3s 追平 */
    paint(smooth);
    if (smooth !== target) kick();
  }
  function kick() { if (!rafId) rafId = requestAnimationFrame(loop); }

  function onScroll() { target = window.pageYOffset; kick(); }

  function refresh() {
    measure();
    buildEdges();
    target = window.pageYOffset;
    /* 图片撑开导致页面高度剧变时直接对齐，免得颜色倒着跑；
       小抖动就不管，别让颜色跳 */
    if (Math.abs(target - smooth) > VH) smooth = target;
    paint(smooth);
  }

  function init() {
    refresh();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('load', refresh);
    if ('ResizeObserver' in window) {
      new ResizeObserver(refresh).observe(document.body);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
