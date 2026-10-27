/* ============================================================
   motion.js — 电影剧场版
   1. 色彩流转   8 层氛围光，按滚动位置交叉淡出（只写 opacity，不重绘）
   2. 巨型水印   每章一个 27vw 描边数字，静止装饰
   3. 章节轨道   右侧竖排，当前章高亮
   4. 匀速描边带 恒速跑马灯，滚动不会改变它的速度
   5. 幕次揭幕   行级上翻 + 扫光

   ⚠️ 设计红线（2026-10-26 定）：页面里不存在任何「惯性」。
      · 内容层位移一律为 0 —— 滚多少，内容走多少，1:1 跟手。
        向上滚时内容绝不往下走，否则读起来就是「东西在往回倒」。
      · 不读滚动速度。没有「松手后还漂一下」，也没有「快滚时晃一拍」。
      · 全部动效只在两个时刻发生：进入视口的那一次，和章节切换的那一次。

   零依赖、零请求。删掉引用即可完全回滚。
   ============================================================ */
(function () {
  'use strict';

  var html = document.documentElement;
  var io = null;
  var VH = 800;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- 色站：每章一套氛围 + 强调色 + 底色 ---------- */
  var STOPS = [
    { bg: '#0b0d15', ac: '#6a86ff' },  // 00 HERO      靛蓝
    { bg: '#12100c', ac: '#e0a367' },  // 01 ABOUT     琥珀
    { bg: '#0a1116', ac: '#56c0dc' },  // 02 WORK      冰青
    { bg: '#070809', ac: '#d9d5c8' },  // 03 PHOTO     中性
    { bg: '#0f0a17', ac: '#b07ae8' },  // 04 AIGC      紫
    { bg: '#091210', ac: '#52cfa2' },  // 05 IMPRINT   墨绿
    { bg: '#12100a', ac: '#e0b65a' },  // 06 STUDIO    暗金
    { bg: '#0b0d15', ac: '#6a86ff' }   // 07 CONTACT   靛蓝
  ];

  var flowLayers = [];
  var ghostItems = [];
  var sections = [];
  var curStop = -1;

  /* ============================================================
     1. 注入氛围光层
     ============================================================ */
  function buildFlow() {
    var box = document.createElement('div');
    box.className = 'm-flow';
    box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 8; i++) box.appendChild(document.createElement('i'));
    document.body.insertBefore(box, document.body.firstChild);
    flowLayers = $$('i', box);
    flowLayers[0].style.opacity = '1';
    flowLayers[0].__o = 1;
    curStop = 0;
    paintStop(0);
  }

  function paintStop(i) {
    var s = STOPS[i];
    if (!s) return;
    html.style.setProperty('--accent', s.ac);
    html.style.setProperty('--bg', s.bg);
  }

  /* ---- 底色连续插值 ----
     STOPS 里存的是 hex，这里自己算中间色。
     只有在算出来的 rgb 真的变了（哪怕只差 1/255）才写 DOM，
     页面停住时一帧都不碰。 */
  var RGB = {};
  function toRgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function rgbOf(i) {
    if (!RGB[i]) RGB[i] = toRgb(STOPS[i].bg);
    return RGB[i];
  }
  var lastBg = '';
  function paintBg(base, next, t) {
    var a = rgbOf(base), b = rgbOf(next);
    var r = Math.round(a[0] + (b[0] - a[0]) * t);
    var g = Math.round(a[1] + (b[1] - a[1]) * t);
    var bl = Math.round(a[2] + (b[2] - a[2]) * t);
    var key = r + ',' + g + ',' + bl;
    if (key === lastBg) return;
    lastBg = key;
    html.style.setProperty('--bg', 'rgb(' + key + ')');
  }

  /* ============================================================
     2. 章节水印
     ============================================================ */
  function buildGhosts() {
    sections.forEach(function (sec, i) {
      var eyebrow = sec.querySelector('.eyebrow');
      if (!eyebrow) return;
      var raw = (eyebrow.textContent || '').trim();
      var m = raw.match(/^(\d{2})\s*[\u2014\u2013-]\s*(.+)$/);
      var num = m ? m[1] : String(i + 1);
      var name = m ? m[2] : raw;

      var g = document.createElement('div');
      g.className = 'm-ghost';
      g.setAttribute('aria-hidden', 'true');
      g.textContent = num;
      var em = document.createElement('em');
      em.textContent = name;
      g.appendChild(em);
      sec.insertBefore(g, sec.firstChild);

      ghostItems.push({ el: g, sec: sec });
    });
  }

  /* ============================================================
     3. 章节轨道 —— 已删除
     右侧那排「短横线 + 当前章名」用户不要了（2026-10-26）。
     删掉节点、观察逻辑和 CSS，别再回来。
     ============================================================ */

  /* ============================================================
     4. 描边带（唯一会自己动的东西）
     这里曾经有三套视差：内容层几何错层、背景层速度冲刺、水印速度滞后。
     全部拆掉了。原因只有一个：凡是「元素位移和手指反着走」的写法，
     手感都是错的 —— 往上滑，东西往下掉。看上去像页面在跟你掰手腕。

     现在页面里只有一条横向跑马灯自己跑，恒速，不看滚动。
     ============================================================ */
  var bandItems = [];
  var lastT = 0, running = false;

  /* 描边带跑马灯：接管 CSS animation，才可能把滚动速度算进去 */
  function collectBands() {
    bandItems = [];
    $$('.m-band-track').forEach(function (track) {
      var w = track.scrollWidth / 3;      /* 带子里放了 3 份文案 */
      if (!w || w < 40) return;
      track.classList.add('m-js');
      track.__x = 0;
      bandItems.push({ el: track, w: w, base: w / 26 });  /* base 与 CSS 的 26s 对齐 */
    });
  }

  function measure() {
    VH = window.innerHeight || 800;
    sections.forEach(function (s) {
      s.__top = s.getBoundingClientRect().top + window.scrollY;
      s.__h = s.offsetHeight || 1;
    });
    ghostItems.forEach(function (g) {
      var r = g.sec.getBoundingClientRect();
      g.top = r.top + window.scrollY;
      g.h = g.sec.offsetHeight || 1;
    });
    bandItems.forEach(function (b) {
      b.w = b.el.scrollWidth / 3 || b.w;
      b.base = b.w / 26;
    });
  }

  function tick(t) {
    var now = t || 0;
    var dt = lastT ? clamp((now - lastT) / 1000, 0.004, 0.05) : 0.016;
    lastT = now;

    var y = window.scrollY || window.pageYOffset || 0;

    /* ---- 描边带：纯匀速，不读滚动 ---- */
    /* 底速与 CSS 的 26s 对齐，滚动时也保持这个速度。
       上一版会让它随滚速提速，看着挺猛，但那是「惯性」的另一种形态，
       一起撤掉 */
    for (var b = 0; b < bandItems.length; b++) {
      var band = bandItems[b];
      band.el.__x -= band.base * dt;
      if (band.el.__x <= -band.w) band.el.__x += band.w;
      if (band.el.__x > 0) band.el.__x -= band.w;
      band.el.style.transform = 'translate3d(' + band.el.__x.toFixed(1) + 'px,0,0)';
    }

    paintFlow(y);
    requestAnimationFrame(tick);
  }

  function kick() {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  }

  /* ============================================================
     5. 色彩流转：按滚动中心所在章节插值
     ============================================================ */
  function paintFlow(y) {
    if (!sections.length || !flowLayers.length) return;
    var cy = y + VH * 0.5;
    var idx = -1;

    for (var i = sections.length - 1; i >= 0; i--) {
      if (cy >= sections[i].__top) { idx = i; break; }
    }

    /* section 0 = ABOUT → 色站 1；首屏（idx = -1）落在色站 0 */
    var base = clamp(idx + 1, 0, 7);
    var next = clamp(base + 1, 0, 7);

    /* 过渡窗口贴着章节边界：距下一章顶部 0.95 屏才起步，压在边界处完成。
       之前按「章节内进度 42%」起算，一章很长时会在中段就换完色，看着像色错了 */
    var sec = sections[idx];
    var nextTop = sections[idx + 1]
      ? sections[idx + 1].__top
      : (sec ? sec.__top + sec.__h : cy + 1e9);
    var t = idx < 0 ? 0 : clamp(1 - (nextTop - cy) / (VH * 0.95), 0, 1);

    for (var k = 0; k < flowLayers.length; k++) {
      var o = 0;
      if (k === base) o = 1 - t;
      else if (k === next) o = t;
      var cur = flowLayers[k].__o;
      if (cur === undefined || Math.abs(cur - o) > 0.004) {
        flowLayers[k].style.opacity = o.toFixed(3);
        flowLayers[k].__o = o;
      }
    }

    /* 底色按 t 连续插值：颜色跟着滚动走，滚多少变多少。
       原来是在 t 跨过 0.5 的那一刻一次性 setProperty ——
       光在慢慢淡、底色却「啪」一下换天，这才是「划一下下就色变」的来源 */
    paintBg(base, next, t);

    /* 强调色仍按章节整段切换：它挂在几十处描边和文字上，
       逐帧改会让整页每帧重排，交给 CSS 的 --accent 过渡即可 */
    var stop = t > 0.5 ? next : base;
    if (stop !== curStop) {
      curStop = stop;
      html.style.setProperty('--accent', STOPS[stop].ac);
    }
  }

  /* ============================================================
     6. 行级揭幕（保留原实现）
     ============================================================ */
  var LINE_SEL = '.about-line, .sec-head .h2, .sub-head, .quote, .lede';
  var WORD = /[0-9A-Za-z\u00C0-\u024F'\u2019.\-_&]/;
  var SPACE = /\s/;

  function tokenize(str) {
    var out = [], i = 0, n = str.length;
    while (i < n) {
      var c = str.charAt(i);
      if (WORD.test(c)) {
        var j = i;
        while (j < n && WORD.test(str.charAt(j))) j++;
        out.push(str.slice(i, j));
        i = j;
      } else if (SPACE.test(c)) {
        var k = i;
        while (k < n && SPACE.test(str.charAt(k))) k++;
        out.push(' ');
        i = k;
      } else {
        out.push(c);
        i++;
      }
    }
    return out;
  }

  function makeCh(text, isSpace) {
    var s = document.createElement('span');
    s.className = 'm-ch' + (isSpace ? ' m-sp' : '');
    s.textContent = text;
    return s;
  }

  function collect(node, out) {
    if (node.nodeType === 3) {
      tokenize(node.textContent).forEach(function (t) { out.push(makeCh(t, t === ' ')); });
    } else if (node.nodeType === 1) {
      var s = document.createElement('span');
      s.className = 'm-ch m-ch-el';
      s.appendChild(node.cloneNode(true));
      out.push(s);
    }
  }

  /* 中文行首禁则：句号 / 逗号 / 破折号这类字符不能单独掉到下一行。
     做法是把它们粘到前一个字上，组成一个不可拆的字块。
     不处理的话「AIGC——模型时代的作品。」会在大字号下把句号甩到第二行，孤零零一个点 */
  var BIND_PREV = /^[。，、；：？！…—）】》」』”’·%,.;:?!)\]}"'~]+$/;

  function bindPunct(seq) {
    var out = [];
    for (var i = 0; i < seq.length; i++) {
      var t = seq[i];
      if (t === 'BR') { out.push(t); continue; }
      var txt = t.textContent || '';
      var bindable = !t.classList.contains('m-ch-el') &&
        !/^\s*$/.test(txt) &&
        BIND_PREV.test(txt);
      if (bindable) {
        /* 往前找一个真正的字块（跳过空格），把标点粘上去。
           遇到 <br> 必须停手 —— 跨行合并会把下一行开头的标点拽到上一行末尾 */
        var j = out.length - 1;
        while (j >= 0 && out[j] !== 'BR' && /^\s*$/.test(out[j].textContent || '')) j--;
        if (j >= 0 && out[j] !== 'BR') {
          out[j].textContent = (out[j].textContent || '').replace(/\s+$/, '') + txt;
          continue;
        }
      }
      out.push(t);
    }
    return out;
  }

  function splitLines(el) {
    if (el.__ml) return;
    var origin = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!origin) return;
    el.__ml = 1;

    var seq = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && n.tagName === 'BR') { seq.push('BR'); return; }
      collect(n, seq);
    });
    seq = bindPunct(seq);
    var plain = seq.filter(function (t) { return t !== 'BR';});
    if (!plain.length) return;

    /* 必须在清空节点之前判定：清空后 <br> 已经被丢弃，childNodes 里查不到 */
    var hasBR = seq.indexOf('BR') >= 0;

    el.setAttribute('aria-label', origin);
    el.textContent = '';
    plain.forEach(function (t) { el.appendChild(t); });

    /* 断点交给浏览器的行平衡算法定，而不是纯按宽度硬断。
       硬断的典型失败：11em 宽度下「AIGC——模型时代的作品。」会切成
       「AIGC——模型时代的作」/「品。」，末行只剩两个字，级联看着像出错。
       balance 会把各行拉匀，之后测 offsetTop 拿到的就是平衡后的分组。
       但已经用 <br> 手写过断行的段落要跳过 —— 平衡算法会给它们再插一次
       软换行，「Product developer. 产品开发」这种就会凭空多出一行 */
    if (!hasBR) el.style.textWrap = 'balance';
    var measureNow = el.offsetHeight;

    var cs = getComputedStyle(el);
    var lh = parseFloat(cs.lineHeight);
    if (!lh || isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.25 || 30;
    var tol = Math.max(8, lh * 0.45);

    var groups = [], cur = [], curTop = null;
    seq.forEach(function (t) {
      if (t === 'BR') {
        if (cur.length) groups.push(cur);
        cur = []; curTop = null;
        return;
      }
      var top = t.offsetTop;
      if (curTop === null || Math.abs(top - curTop) <= tol) {
        if (curTop === null) curTop = top;
        cur.push(t);
      } else {
        if (cur.length) groups.push(cur);
        cur = [t]; curTop = top;
      }
    });
    if (cur.length) groups.push(cur);

    /* 组已定，退掉平衡模式，否则拆出来的 .ln 还会被再平衡一次 */
    el.style.textWrap = '';
    if (!groups.length) return;

    el.textContent = '';
    groups.forEach(function (g, i) {
      var ln = document.createElement('span');
      ln.className = 'ln';
      ln.style.setProperty('--i', i);
      var inner = document.createElement('span');
      inner.className = 'ln-in';
      g.forEach(function (n) { inner.appendChild(n); });
      ln.appendChild(inner);
      el.appendChild(ln);
    });

    el.classList.add('m-line');
    observe(el);
  }

  /* ============================================================
     7. 描边带 / 扫光 / 观察器
     ============================================================ */
  function initIO() {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
  }

  function observe(el) {
    if (!io) initIO();
    io.observe(el);
  }

  function buildBand(head) {
    if (head.__mb) return;
    var eyebrow = head.querySelector('.eyebrow');
    if (!eyebrow) return;
    var parts = (eyebrow.textContent || '').split(/[\u2014\u2013\-]/);
    var label = parts.pop().replace(/\s+/g, ' ').trim();
    if (!label) return;
    head.__mb = 1;

    var band = document.createElement('div');
    band.className = 'm-band';
    band.setAttribute('aria-hidden', 'true');
    var track = document.createElement('div');
    track.className = 'm-band-track';
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('span');
      s.textContent = label;
      track.appendChild(s);
    }
    band.appendChild(track);
    head.parentNode.insertBefore(band, head);
  }

  function indexReveal() {
    var counters = new Map();
    $$('.reveal').forEach(function (el) {
      var p = el.parentNode;
      var n = counters.get(p) || 0;
      el.style.setProperty('--i', Math.min(n, 9));
      counters.set(p, n + 1);
    });
  }

  /* ============================================================
     8. 启动
     ============================================================ */
  function boot() {
    sections = $$('main .section');

    buildFlow();
    buildGhosts();

    sections.forEach(function (sec) {
      var head = sec.querySelector('.sec-head');
      if (head) buildBand(head);
    });

    indexReveal();

    var still = !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) { measure(); return; }

    /* 标题行级揭幕 */
    var narrow = window.matchMedia('(max-width: 860px)').matches;
    var lines = [];
    sections.forEach(function (root) {
      $$(LINE_SEL, root).forEach(function (el) {
        if (lines.indexOf(el) < 0) lines.push(el);
      });
    });
    /* 手机上跳过手写换行的自我介绍：这三句本来就用 <br> 分好了，
       拆成字块后 inline-block 之间的断行规则变了，会多断出两行，
       变成「Product」/「developer. 产品开发」这种半句孤行 */
    if (narrow) {
      lines = lines.filter(function (el) { return !el.classList.contains('about-line'); });
    }
    lines.forEach(splitLines);
    html.classList.add('m-ready');

    /* 兜底：任何原因漏判，1.8s 后把视口内的行块强制点亮 */
    setTimeout(function () {
      lines.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.height > 0 && r.top < VH * 0.98 && r.bottom > 0) el.classList.add('is-in');
      });
    }, 1800);

    /* 扫光：每章头部进入时扫一次 */
    var lit = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('m-lit');
        lit.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    $$('.sec-head').forEach(function (h) { lit.observe(h); });

    /* 匀速描边带 + 色彩流转 */
    var touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (!touch) {
      collectBands();
      measure();
      window.addEventListener('scroll', kick, { passive: true });
      window.addEventListener('resize', function () { measure(); kick(); }, { passive: true });
      if (window.ResizeObserver) {
        var ro = new ResizeObserver(function () { measure(); kick(); });
        ro.observe(document.body);
      }
      window.addEventListener('load', function () { measure(); kick(); });

      /* rAF 常驻（描边带靠它跑），切到后台时停掉省电 */
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          running = false;
        } else {
          lastT = 0;
          running = false;
          kick();
        }
      });

      lastT = 0;
      kick();
    } else {
      measure();
      window.addEventListener('scroll', function () { paintFlow(window.scrollY || 0); }, { passive: true });
      paintFlow(window.scrollY || 0);
    }
  }

  function whenFontsReady(cb) {
    var done = false;
    function go() { if (done) return; done = true; cb(); }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go);
      setTimeout(go, 500);
    } else {
      setTimeout(go, 0);
    }
  }

  function start() {
    indexReveal();
    whenFontsReady(function () {
      requestAnimationFrame(boot);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
