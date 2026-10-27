/* ============================================================
   main.js — 渲染与交互
   动效：载入序列 / 滚动渐显 / 视差 / 进度条 / 数字滚动 / 拖拽长廊
   原则：不阻塞加载，尊重 prefers-reduced-motion，零外部依赖
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1. 产品开发 — PRD 结构（复刻参考站案例卡）
     ========================================================== */
  function renderWorks() {
    const host = $('#workGrid');
    if (!host || !window.WORKS) return;
    host.innerHTML = window.WORKS.map((w, i) => `
      <article class="work reveal" style="--d:${(i % 2) * 0.08 + Math.floor(i / 2) * 0.06}s">
        <header class="work-head">
          <span class="idx">${w.idx}</span>
          <div>
            <p class="eyebrow">${w.tag}</p>
            <h3 class="work-title">${w.title}</h3>
          </div>
        </header>
        <p class="w-label">Background</p>
        <p class="w-bg">${w.background}</p>
        <p class="w-label">Approach</p>
        <p class="w-approach">${w.approach}</p>
        <ul class="metrics">
          ${w.metrics.map(m => `<li><span class="m-label">${m.k}</span><span class="m-value">${m.v}</span></li>`).join('')}
        </ul>
        ${w.note ? `<p class="work-note">${w.note}</p>` : ''}
        <div class="work-meta">
          <span>ROLE<b>${w.meta.role}</b></span>
          <span>STACK<b>${w.meta.stack}</b></span>
          <span>STATUS<b>${w.meta.status}</b></span>
        </div>
        <ul class="tags">${w.tags.map(t => `<li>${t}</li>`).join('')}</ul>
        ${w.link ? `<a class="link-arrow" href="${w.link.url}" target="_blank" rel="noopener">${w.link.label} <span>↗</span></a>` : ''}
      </article>
    `).join('');
  }

  /* ==========================================================
     2. 摄影 — Cover Flow 唱片架
        版式参照 addyosmani/threejs-coverflow：中间一张大图，两侧后退倾斜，
        用 CSS 3D 实现（照片是 DOM 图，清晰度与移动端性能都更好）
     ========================================================== */
  function renderPhotosFallback(host) {
    host.classList.add('photo-grid', 'staggered');
    host.classList.add('photo-grid--fallback');
    host.innerHTML = window.PHOTOS.map((p, gi) => `
      <figure class="photo reveal" data-i="${gi}" tabindex="0" role="button" aria-label="查看 ${p.cn}">
        <img src="assets/photos/${p.f}" alt="${p.cn} · ${p.en}" loading="lazy" decoding="async" />
        <figcaption>
          <span class="p-num">${p.n} / ${p.cat}</span>
          <span class="p-cn">${p.cn}</span>
          <span class="p-en">${p.en}</span>
        </figcaption>
      </figure>`).join('');
    host.addEventListener('click', e => {
      const f = e.target.closest('.photo');
      if (f) lb.open(parseInt(f.dataset.i, 10));
    });
    observe();
  }

  function initCoverflow() {
    const host = $('#coverflow');
    const stage = $('#cfStage');
    if (!host || !stage || !window.PHOTOS) return;

    if (REDUCED) {
      host.classList.add('is-fallback');
      renderPhotosFallback(stage);
      return;
    }

    const countEl = $('#cfCount');
    const nameEl = $('#cfName');
    const hintEl = $('.cf-hint');
    if (hintEl && window.matchMedia('(hover: none)').matches) {
      hintEl.textContent = '左右滑动切换 · 点中间那张看大图';
    }
    const N = window.PHOTOS.length;

    const items = window.PHOTOS.map((p, i) => {
      const fig = document.createElement('figure');
      fig.className = 'cf-item';
      fig.innerHTML = `<div class="cf-card"><img src="assets/photos/${p.f}" alt="${p.cn} · ${p.en}" draggable="false" decoding="async" /></div>`;
      stage.appendChild(fig);
      return { fig, img: fig.querySelector('img'), p, i, w: 0 };
    });

    let pos = 0;
    let target = 0;
    let cardH = 320;
    let step = 200;
    let dragMoved = false;
    let need = true;

    const clamp = v => Math.max(0, Math.min(N - 1, v));

    function measure() {
      const sh = stage.clientHeight;
      const sw = stage.clientWidth;
      cardH = Math.round(Math.min(Math.max(sh * 0.68, 190), sw * 0.98, 430));
      items.forEach(it => {
        const iw = it.img.naturalWidth || 1600;
        const ih = it.img.naturalHeight || 1067;
        const asp = iw / ih;
        let h = cardH;
        let w = Math.round(h * asp);
        const maxW = Math.round(sw * 0.78);
        if (w > maxW) { w = maxW; h = Math.round(w / asp); }
        it.w = w;
        it.h = h;
        it.fig.style.width = (w + 16) + 'px';
        it.fig.style.height = (h + 16) + 'px';
      });
      step = Math.min(cardH * (sw < 700 ? 0.62 : 0.74), sw * (sw < 700 ? 0.42 : 0.2));
      need = true;
    }

    function layout() {
      const narrow = window.innerWidth < 700;
      const ang = narrow ? 28 : 44;
      items.forEach(it => {
        const d = it.i - pos;
        const ad = Math.abs(d);
        const x = d * step;
        const z = -ad * cardH * 0.5;
        const rot = Math.max(-ang, Math.min(ang, -d * ang));
        const sc = Math.max(0.7, 1 - ad * 0.075);
        it.fig.style.transform =
          `translate3d(calc(-50% + ${x.toFixed(1)}px), -50%, ${z.toFixed(0)}px) rotateY(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
        it.fig.style.opacity = ad > 3.4 ? '0' : String(Math.max(0.22, 1 - ad * 0.17));
        it.fig.style.zIndex = String(200 - Math.round(ad * 10));
        it.fig.style.pointerEvents = ad > 3.4 ? 'none' : 'auto';
      });
    }

    function meta() {
      const i = Math.round(pos);
      const p = window.PHOTOS[i];
      if (countEl) countEl.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
      if (nameEl && p) nameEl.textContent = p.cn + ' · ' + p.en;
    }

    function loop() {
      const diff = target - pos;
      if (Math.abs(diff) > 0.0005) { pos += diff * 0.16; need = true; }
      else if (pos !== target) { pos = target; need = true; }
      if (need) { layout(); meta(); need = false; }
      requestAnimationFrame(loop);
    }

    function go(i) { target = clamp(i); }

    /* ---- 拖拽 ---- */
    let down = false, sx = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0, captured = false;

    stage.addEventListener('pointerdown', e => {
      down = true; dragMoved = false; captured = false;
      sx = lastX = e.clientX; startPos = pos; lastT = performance.now(); vel = 0;
      stage.classList.add('is-grabbing');
      // 注意：这里不立刻 setPointerCapture。一旦捕获，click 会派发到 stage 而不是卡片，
      // 中心的「点开大图」和两侧的「点一下归位」都会失效。等真的拖动超过阈值再捕获。
    });

    stage.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 6 && !dragMoved) {
        dragMoved = true;
        if (!captured) { try { stage.setPointerCapture(e.pointerId); captured = true; } catch (_) {} }
      }
      if (!dragMoved) return;
      pos = clamp(startPos - dx / step);
      target = pos;
      need = true;
      const now = performance.now();
      const dt = Math.max(now - lastT, 16);
      vel = (e.clientX - lastX) / dt;
      lastX = e.clientX; lastT = now;
    });

    const endDrag = () => {
      if (!down) return;
      down = false;
      stage.classList.remove('is-grabbing');
      const kick = -vel * 260 / step;
      go(Math.round(clamp(pos + Math.max(-2, Math.min(2, kick)))));
    };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerleave', endDrag);

    /* ---- 滚轮 / 键盘 ---- */
    stage.addEventListener('wheel', e => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(d) < 2) return;
      e.preventDefault();
      go(Math.round(target) + (d > 0 ? 1 : -1));
    }, { passive: false });

    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(target) + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(target) - 1); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lb.open(Math.round(pos)); }
    });

    /* ---- 点击：中间开灯箱，两侧归位 ---- */
    items.forEach(it => {
      it.fig.addEventListener('click', () => {
        if (dragMoved) return;
        if (Math.abs(pos - it.i) < 0.5) lb.open(it.i);
        else go(it.i);
      });
    });

    window.addEventListener('resize', measure);

    let loaded = 0;
    const onImg = () => { if (++loaded >= N) { measure(); layout(); } };
    items.forEach(it => {
      if (it.img.complete && it.img.naturalWidth) onImg();
      else {
        it.img.addEventListener('load', onImg, { once: true });
        it.img.addEventListener('error', onImg, { once: true });
      }
    });

    measure();
    layout();
    meta();
    requestAnimationFrame(loop);
  }

  /* ==========================================================
     3. 灯箱
     ========================================================== */
  const lb = {
    root: null, img: null, cn: null, en: null, num: null, cur: -1,
    init() {
      this.root = $('#lightbox');
      if (!this.root) return;
      this.img = $('#lbImg'); this.cn = $('#lbCn');
      this.en = $('#lbEn');   this.num = $('#lbNum');

      $('#lbClose').addEventListener('click', () => this.close());
      $('#lbPrev').addEventListener('click', () => this.step(-1));
      $('#lbNext').addEventListener('click', () => this.step(1));
      this.root.addEventListener('click', e => {
        if (e.target === this.root) this.close();
      });
      document.addEventListener('keydown', e => {
        if (this.root.hidden) return;
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowLeft') this.step(-1);
        if (e.key === 'ArrowRight') this.step(1);
      });
      // 触屏：左右滑换图，下滑关闭
      let tx = 0, ty = 0;
      this.root.addEventListener('touchstart', e => {
        tx = e.touches[0].clientX; ty = e.touches[0].clientY;
      }, { passive: true });
      this.root.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - tx;
        const dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) this.step(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) this.close();
      }, { passive: true });
    },
    open(i) {
      const p = window.PHOTOS[i]; if (!p) return;
      this.cur = i;
      this.img.src = 'assets/photos/' + p.f;
      this.img.alt = p.cn + ' · ' + p.en;
      this.cn.textContent = p.cn;
      this.en.textContent = p.en;
      this.num.textContent = p.n + ' / ' + window.PHOTOS.length;
      this.root.hidden = false;
      requestAnimationFrame(() => this.root.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    },
    close() {
      this.root.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { this.root.hidden = true; }, 350);
    },
    step(d) {
      const n = window.PHOTOS.length;
      this.open((this.cur + d + n) % n);
    }
  };

  /* ==========================================================
     4. AIGC — 设计语言 + 九屏切换 + 三视图 + 三十四帧
     ========================================================== */
  function renderDesignNotes() {
    const host = $('#designNotes');
    if (!host || !window.DESIGN_NOTES) return;
    host.innerHTML = window.DESIGN_NOTES.map((n, i) => `
      <li class="reveal" style="--d:${i * 0.06}s"><span class="nk">${n.k}</span><span class="nv">${n.v}</span></li>
    `).join('');
  }

  function renderScreens() {
    const host = $('#screens');
    if (!host || !window.SCREENS) return;
    const tabs = window.SCREENS.map((g, i) =>
      `<button class="chip${i === 0 ? ' is-active' : ''}" data-g="${g.key}" aria-pressed="${i === 0}">Style ${g.label}</button>`
    ).join('');
    host.innerHTML = `<div class="screen-tabs">${tabs}</div><div class="screen-body"></div>`;

    const body = $('.screen-body', host);
    const paint = key => {
      const g = window.SCREENS.find(x => x.key === key);
      body.innerHTML = `<div class="screens">${g.files.map((f, i) => `
        <figure class="reveal" style="--d:${Math.min(i, 8) * 0.04}s">
          <img src="assets/${f}" alt="Style ${g.label} · Screen ${i + 1}" decoding="async" />
        </figure>`).join('')}</div>`;
      makeDraggable(body.firstElementChild);
      observe();
    };
    paint(window.SCREENS[0].key);

    $('.screen-tabs', host).addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', $('.screen-tabs', host)).forEach(x => {
        const on = x === b;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-pressed', String(on));
      });
      paint(b.dataset.g);
    });
  }

  function renderChars() {
    const host = $('#charstrip');
    if (!host || !window.CHARACTERS) return;
    host.innerHTML = window.CHARACTERS.slice(0, 4).map((c, i) => `
      <figure class="char-card" style="--d:${i * 0.05}s">
        <img src="assets/char/${c.f}" alt="${c.label}" decoding="async" />
        <figcaption>${c.label}</figcaption>
      </figure>
    `).join('');
  }

  function renderAwaken() {
    const host = $('#awakenGrid');
    if (!host || !window.AWAKEN) return;
    host.innerHTML = window.AWAKEN.map((f, i) => `
      <figure class="reveal" style="--d:${Math.min(i, 11) * 0.03}s">
        <img src="assets/sb/${f.f}" alt="Frame ${f.n} · ${f.cn}" decoding="async" />
        <figcaption>
          <span class="f-num">${f.n}</span>
          <span class="f-cn">${f.cn}</span>
          <span class="f-en">${f.en}</span>
        </figcaption>
      </figure>
    `).join('');
  }

  function renderFilmstrip() {
    const host = $('#filmGrid');
    if (!host || !window.FRAMES) return;
    host.innerHTML = window.FRAMES.map((f, i) => `
      <figure class="reveal" style="--d:${Math.min(i, 11) * 0.04}s">
        <img src="assets/frames-grid/${f.f}" alt="Frame ${f.n} · ${f.cn}" decoding="async" />
        <figcaption>
          <span class="f-num">${f.n}</span>
          <span class="f-cn">${f.cn}</span>
          <span class="f-en">${f.en}</span>
        </figcaption>
      </figure>
    `).join('');
  }

  /* ---------- 横向长廊通用拖拽 / 滚轮 ---------- */
  function makeDraggable(host) {
    if (!host) return;
    let down = false, sx = 0, sl = 0;
    host.addEventListener('pointerdown', e => {
      down = true; sx = e.clientX; sl = host.scrollLeft;
      host.classList.add('is-dragging');
      host.setPointerCapture(e.pointerId);
    });
    host.addEventListener('pointermove', e => {
      if (!down) return;
      host.scrollLeft = sl - (e.clientX - sx);
    });
    const up = () => { down = false; host.classList.remove('is-dragging'); };
    host.addEventListener('pointerup', up);
    host.addEventListener('pointercancel', up);
    host.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      host.scrollLeft += e.deltaY;
      e.preventDefault();
    }, { passive: false });
  }

  /* ==========================================================
     5. SKILL — 《雪域之上》十六页长廊
     ========================================================== */
  function renderAlbum() {
    const host = $('#albumTrack');
    if (!host || !window.ALBUM) return;
    host.innerHTML = window.ALBUM.pages.map((f, i) => `
      <figure class="album-page${i === 0 ? ' is-cover' : ''}" style="--d:${Math.min(i, 10) * 0.04}s">
        <img src="assets/${f}" alt="${window.ALBUM.title} · Page ${i + 1}" decoding="async" />
      </figure>
    `).join('');
  }

  /* ==========================================================
     6. 滚动渐显
     ========================================================== */
  let io = null;
  function observe() {
    if (REDUCED) {
      $$('.reveal').forEach(el => el.classList.add('is-in'));
      return;
    }
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px 12% 0px' });
    }
    $$('.reveal:not(.is-in)').forEach(el => io.observe(el));
  }

  /* ==========================================================
     7. 滚动进度条 + 视差
     ========================================================== */
  function initProgress() {
    const bar = $('#progressBar');
    if (!bar) return;
    const onScroll = () => {
      const h = document.documentElement;
      const p = Math.min(h.scrollTop / Math.max(h.scrollHeight - h.clientHeight, 1), 1);
      bar.style.width = (p * 100).toFixed(2) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==========================================================
     7b. 页底兜底：接近页底时点亮所有残余 reveal
     ========================================================== */
  function initRevealFallback() {
    // 兜底：任何已经进入视口却还没吃到 is-in 的元素，直接放行。
    // 触发场景：图片加载后页面变高、锚点直达、快速滚动、用户中途切标签页。
    const sweep = () => {
      const vh = window.innerHeight;
      $$('.reveal:not(.is-in)').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < vh - 24 && r.bottom > -24) el.classList.add('is-in');
      });
    };
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; sweep(); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', () => { sweep(); setTimeout(sweep, 400); });
    // 首屏与图片解码后会持续变高，前几秒连打几拍
    [1200, 2500, 4000, 6000].forEach(t => setTimeout(sweep, t));
  }

  /* ==========================================================
     8. 导航：吸顶 / 高亮 / 移动菜单
     ========================================================== */
  function initNav() {
    const nav = $('#nav');
    const toggle = $('#navToggle');
    const menu = $('#navMenu');
    const links = $$('[data-nav]');

    const onScroll = () => {
      nav.classList.toggle('is-stuck', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    links.forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));

    const secs = ['about', 'selected-work', 'photography', 'aigc', 'imprint', 'skill', 'studio', 'contact']
      .map(id => document.getElementById(id)).filter(Boolean);
    if (!secs.length || !('IntersectionObserver' in window)) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const id = en.target.id;
        links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => spy.observe(s));
  }

  /* ==========================================================
     10. 首屏打字机
     ========================================================== */
  function initTyping() {
    const el = $('#typed');
    const caret = $('#caret');
    if (!el || !window.TypedLines) return;

    if (REDUCED) {
      el.textContent = window.TypedLines[0];
      if (caret) caret.style.display = 'none';
      return;
    }

    const lines = window.TypedLines;
    let li = 0, ci = 0, del = false;

    function tick() {
      const line = lines[li];
      if (!del) {
        el.textContent = line.slice(0, ++ci);
        if (ci === line.length) { del = true; return setTimeout(tick, 2100); }
      } else {
        el.textContent = line.slice(0, --ci);
        if (ci === 0) { del = false; li = (li + 1) % lines.length; return setTimeout(tick, 420); }
      }
      setTimeout(tick, 82 + Math.random() * 60);
    }
    tick();
  }

  /* ==========================================================
     11. 数字滚动
     ========================================================== */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(e => { e.textContent = e.dataset.count; });
      return;
    }
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const t0 = performance.now();
        const dur = 1100;
        (function run(t) {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(run);
        })(t0);
        ob.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach(e => ob.observe(e));
  }

  /* ==========================================================
     12. 灯箱绑定（3D 照片墙元素自带点击，不需额外委托）
     ========================================================== */

  /* ==========================================================
     9. 黑胶播放器：自动播放，被浏览器拦截则首次交互时播放
     ========================================================== */
  /* 背景音乐：先静音起播（浏览器一律允许），再立刻尝试出声；
     出声被拦时才退到「首次任何交互立即出声」 */
  function initAudio() {
    const vinyl = $('#vinyl');
    const state = $('#vinylState');
    if (!vinyl) return;

    const TARGET = 0.55;
    let audio = document.getElementById('bgm');
    if (!audio) {
      /* 必须用 video 而不是 audio：静音自动播放只有 video 有内核保证，
         audio 元素在 iOS Safari / 微信 WebView 里会被直接拒绝 */
      audio = document.createElement('video');
      audio.className = 'bgm-media';
      audio.src = 'assets/audio/bgm.mp3';
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      document.body.appendChild(audio);
    }
    audio.loop = true;
    audio.preload = 'auto';
    audio.muted = true;
    audio.volume = 0;

    /* iOS Safari 上 audio.volume 是只读的（赋值被静默忽略，恒为 1），
       那里不做渐变，否则会出现「以为在淡入、其实一直满音量」 */
    const VOL_WRITABLE = (() => {
      try {
        const keep = audio.volume;
        audio.volume = 0.42;
        const ok = Math.abs(audio.volume - 0.42) < 0.01;
        audio.volume = keep;
        return ok;
      } catch (_) { return false; }
    })();

    let audible = false;
    let booted = false;          // 静音基线是否已经播起来
    let userPaused = false;      // 用户主动点的暂停，不要自动救回
    let justUnlockedAt = 0;      // 刚被手势解锁的时间，避开同一次点击的开关逻辑
    let swapping = false;        // 正在换元素：这期间旧元素的 pause 事件不算「被掐」
    let fadeTimer = null;
    const wait = ms => new Promise(r => setTimeout(r, ms));

    /* 进入画面还在场时，任何轻触/滑动都不该把声音放出来；
       只有 Enter 按钮那一次点击算数（与 initGate 的判定保持一致） */
    const gateUp = () => !!document.getElementById('gate');
    const gateFirst = gateUp() && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    /* UI 一律从元素真实状态推导，避免「显示在播其实没声」 */
    const refresh = () => {
      const playing = !audio.paused;
      const snd = playing && !audio.muted;
      vinyl.classList.toggle('is-playing', playing);
      vinyl.setAttribute('aria-pressed', String(playing));
      vinyl.dataset.snd = snd ? 'on' : 'off';
      if (state) state.textContent = !playing ? 'PAUSED' : (snd ? 'PLAYING' : 'SOUND OFF');
    };
    /* 事件绑定抽成函数：进入时可能换成一个「全新元素」来出声，
       换了之后要把同一套监听挂到新元素上 */
    const bindMedia = el => {
      ['play', 'playing', 'pause', 'ended', 'volumechange'].forEach(ev => el.addEventListener(ev, refresh));
      el.addEventListener('pause', onPause);
    };

    const fadeTo = to => {
      if (!VOL_WRITABLE) { return; }        // iOS：交给系统音量
      clearInterval(fadeTimer);
      fadeTimer = setInterval(() => {
        const d = to - audio.volume;
        if (Math.abs(d) <= 0.02) { audio.volume = to; clearInterval(fadeTimer); return; }
        audio.volume = Math.min(1, Math.max(0, audio.volume + d * 0.3));
      }, 36);
    };

    /* 提示条：只在确实出不了声时出现，出声后自动消失。
       延迟 1.6s 才出现 —— 页面刚进就弹「点我」很像故障 */
    let nudge = null, nudgeTimer = null;
    const showNudge = () => {
      if (nudge || audible) return;
      clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(() => {
        if (nudge || audible) return;
        if (document.getElementById('gate')) return;   // 还停在进入画面，别弹
        nudge = document.createElement('button');
        nudge.type = 'button';
        nudge.className = 'audio-nudge';
        nudge.innerHTML = '<span class="an-dot"></span>轻触屏幕 · 音乐自动开启';
        nudge.addEventListener('click', e => { e.stopPropagation(); unlock(); });
        document.body.appendChild(nudge);
        requestAnimationFrame(() => { if (nudge) nudge.classList.add('is-on'); });
      }, 1600);
    };
    const hideNudge = () => {
      clearTimeout(nudgeTimer);
      if (!nudge) return;
      const el = nudge; nudge = null;
      el.classList.remove('is-on');
      setTimeout(() => el.remove(), 520);
    };

    const markAudible = () => {
      if (audible) return;
      audible = true;
      booted = true;
      justUnlockedAt = Date.now();      // 记一下，别让同一次点击又把它关掉
      fadeTo(TARGET);
      hideNudge();
      unbindUnlock();
      refresh();
    };

    /* 只有「真正的用户激活」事件才能解除自动播放限制：
       mousemove / scroll 不算激活，加了也没用，反而会误判成已出声。
       移动端的手指滑动一定先来 touchstart，所以「一滑就有声」 */
    const UNLOCK = ['pointerdown', 'pointerup', 'mousedown', 'touchstart', 'touchend', 'keydown', 'click', 'wheel'];
    let lastTry = 0;
    const unbindUnlock = () => {
      UNLOCK.forEach(ev => {
        window.removeEventListener(ev, unlock, true);
        document.removeEventListener(ev, unlock, true);
      });
    };
    const unlock = () => {
      if (audible) return;
      const now = Date.now();
      if (now - lastTry < 250) return;      // 连续触发时别疯跑
      lastTry = now;
      audio.muted = false;                  // 手势栈内同步取消静音，iOS 才认
      if (VOL_WRITABLE) audio.volume = 0;
      let p = null;
      try { p = audio.play(); } catch (_) { p = null; }
      const onOK = () => { markAudible(); };
      const onFail = () => {                // 仍被拦 → 退回静音，继续等下一次手势
        audio.muted = true;
        if (VOL_WRITABLE) audio.volume = 0;
        const rp = audio.play();
        if (rp && rp.catch) rp.catch(() => {});
        refresh();
      };
      if (p && p.then) p.then(onOK, onFail);
      else if (!audio.paused) onOK();
      else onFail();
    };
    const bindUnlock = () => {
      UNLOCK.forEach(ev => {
        window.addEventListener(ev, unlock, { passive: true, capture: true });
        document.addEventListener(ev, unlock, { passive: true, capture: true });
      });
    };

    const playMuted = async () => {
      audio.muted = true;
      if (VOL_WRITABLE) audio.volume = 0;
      try { await audio.play(); } catch (_) { return false; }
      return !audio.paused;
    };

    /* 直接试有声：桌面 Chrome（有 Media Engagement 记录）与部分
       Android 内核会放行；iOS Safari 必然拒绝，拒绝后无副作用。
       判定看「时间有没有在走」，只信 muted 标志会被内核的延迟拦截骗到 */
    const playAudible = async () => {
      audio.muted = false;
      if (VOL_WRITABLE) audio.volume = 0;
      try { await audio.play(); } catch (_) { return false; }
      const t0 = audio.currentTime;
      await wait(420);
      if (!audio.paused && !audio.muted && audio.currentTime > t0 + 0.05) {
        markAudible();
        return true;
      }
      return false;
    };

    /* 静音已经在播时，只取消静音，不重复 play() ——
       重复调用 play() 会被 Chrome 判成 AbortError，误判为失败 */
    const unmuteInPlace = () => new Promise(resolve => {
      if (audio.paused) { resolve(false); return; }
      const t0 = audio.currentTime;
      audio.muted = false;
      if (VOL_WRITABLE) audio.volume = 0;
      setTimeout(() => {
        const live = !audio.paused && !audio.muted && audio.currentTime > t0 + 0.05;
        if (live) { markAudible(); resolve(true); return; }
        /* 被内核掐了 → 把静音基线救回来，否则用户进站后是彻底静音的死状态 */
        audio.muted = true;
        if (VOL_WRITABLE) audio.volume = 0;
        const rp = audio.play();
        if (rp && rp.catch) rp.catch(() => {});
        refresh();
        resolve(false);
      }, 700);
    });

    /* 内核有时会延迟几百毫秒才掐掉「无手势出声」，所以 audible 之后
       继续盯 pause：不是用户点的暂停，就退回静音基线并重新等手势 */
    function onPause() {
      if (swapping) return;                  // 换元素时旧元素被我们主动暂停，不算异常
      if (this && this.__detached) return;   // pause 事件是异步派发的，旧元素要永久豁免
      if (userPaused || !audible) return;
      audible = false;
      booted = false;
      clearInterval(fadeTimer);              // 停掉还在往上爬的淡入
      audio.muted = true;
      if (VOL_WRITABLE) audio.volume = 0;
      playMuted().then(ok => {
        booted = ok;
        if (!ok) showNudge();
      });
      bindUnlock();
      showNudge();
      refresh();
    }
    bindMedia(audio);

    /* ---------- 起播 ----------
       移动端（iOS Safari / 微信内置浏览器 / 大量 X5 内核）一律禁止
       无手势的有声播放，这是内核硬规则，页面侧绕不过去。所以策略是：
       ① 先直接试有声 —— 桌面和已建档站点会过
       ② 过不了就静音起播，让进度条先走起来
       ③ 连静音都被拒时按 150/300/450…ms 退避重试（文档未稳定时会被拒）
       ④ 全程挂着解锁监听：第一次触摸立刻出声，不需要点任何按钮 */
    const startAudio = async () => {
      /* 有进入画面时：只做静音预跑（唱片转起来、进度往前走），
         绝不主动出声，也不挂「随便碰一下就解锁」的监听 ——
         声音必须等用户点「进入」那一下 */
      if (gateFirst) {
        for (let i = 0; i < 8 && !booted; i++) {
          if (await playMuted()) { booted = true; break; }
          await wait(150 * (i + 1));
        }
        refresh();
        return;
      }

      bindUnlock();                                  // 先挂解锁，别等起播结果

      if (await playAudible()) return;               // ①

      for (let i = 0; i < 8 && !booted; i++) {       // ②③
        if (await playMuted()) { booted = true; break; }
        await wait(150 * (i + 1));
      }
      refresh();
      if (!booted) { showNudge(); return; }

      if (await unmuteInPlace()) return;             // ④ 静音已在播，试直接出声
      showNudge();
    };
    startAudio();

    /* 手动开关 */
    vinyl.addEventListener('click', () => {
      /* 刚被这次点击解锁出声，就不要顺手把它关掉 ——
         unlock 的监听是 capture 阶段，会先于这里执行，所以两边都要看 */
      if (!audio.paused && (Date.now() - justUnlockedAt < 450 || Date.now() - lastTry < 450)) return;
      /* 正在静音播放（SOUND OFF）：这一下应该是「我要听声音」，不是暂停 */
      if (!audio.paused && audio.muted) {
        audio.muted = false;
        if (VOL_WRITABLE) audio.volume = 0;
        const p = audio.play();
        if (p && p.then) p.then(markAudible, () => {});
        else markAudible();
        return;
      }
      if (audio.paused) {
        userPaused = false;
        audio.muted = false;
        if (VOL_WRITABLE) audio.volume = 0;
        const p = audio.play();
        if (p && p.then) p.then(markAudible, () => {});
        else markAudible();
      } else {
        userPaused = true;
        audio.pause();
        audible = false;
        refresh();
      }
    });

    /* 切到后台再回来，移动端会把媒体挂起，这里接着播 */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible' || userPaused) return;
      if (!audible || !audio.paused) return;
      audio.muted = false;
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
    });

    /* 点「进入」这一下是真实用户激活。这里不走「先静音播、再取消静音」的老路 ——
       那条路在 iOS Safari / 微信 X5 上经常被内核强制暂停，用户听到的就是没声。
       改成：在手势栈里新建一个从未静音起播过的元素，直接带声 play()。
       这是各端兼容性最稳的一条路（等于「点一下开始放背景音乐」）。 */
    let armed = false;
    const enterAudible = () => new Promise(resolve => {
      armed = true;

      /* 微信 X5：先跟桥打个招呼，部分版本不做这一步解码器不放开 */
      try {
        if (window.WeixinJSBridge && window.WeixinJSBridge.invoke) {
          window.WeixinJSBridge.invoke('getNetworkType', {}, () => {});
        }
      } catch (_) {}

      let el = null;
      try {
        /* 依旧用 video 承载 mp3：移动内核里 video 的播放权限比 audio 宽 */
        el = document.createElement('video');
        el.className = 'bgm-media';
        el.src = 'assets/audio/bgm.mp3';
        el.loop = true;
        el.preload = 'auto';
        el.setAttribute('playsinline', '');
        el.setAttribute('webkit-playsinline', '');
        el.muted = false;
        el.volume = TARGET;                 // iOS 忽略（只读），交给系统音量
        document.body.appendChild(el);
      } catch (_) { el = null; }

      const target = el || audio;            // 新建失败就退回老元素
      target.muted = false;
      if (VOL_WRITABLE) target.volume = TARGET;
      const pull = () => {
        try {
          const p = target.play();
          if (p && p.catch) p.catch(() => {});
        } catch (_) {}
      };
      pull();                                // 手势栈内，同步第一下

      let n = 0;
      const settle = () => {
        if (!target.paused) {                // 在播（哪怕还在缓冲）就是成了
          if (target !== audio) {
            const old = audio;
            audio = target;                  // 换掉旧元素，回收预跑的那个
            audio.id = 'bgm';
            bindMedia(audio);
            markAudible();                   // 先认定成功，再去停旧元素
            swapping = true;                 // 旧元素接下来会因为被暂停而发 pause 事件
            try { old.__detached = true; old.pause(); old.remove(); } catch (_) {}
            swapping = false;
          } else {
            markAudible();
          }
          resolve(true);
          return;
        }
        if (++n >= 3) {                       // 真出不来 → 回静音基线 + 兜底手势
          try { target.pause(); } catch (_) {}
          if (target !== audio) { try { target.remove(); } catch (_) {} }
          audio.muted = true;
          if (VOL_WRITABLE) audio.volume = 0;
          try { const rp = audio.play(); if (rp && rp.catch) rp.catch(() => {}); } catch (_) {}
          refresh();
          resolve(false);
          return;
        }
        pull();
        setTimeout(settle, 240);
      };
      setTimeout(settle, 300);
    });

    /* 供进入画面直接调用：点击回调里第一件事就是它，
       保证仍在用户手势的同一个任务里，不被后续 DOM 操作挤出手势栈 */
    window.__bgmEnter = () => enterAudible().then(ok => {
      if (!ok) { showNudge(); bindUnlock(); }
    });

    /* 没走 __bgmEnter 的旧入口也兜一层；已经出声就不重复建元素 */
    window.addEventListener('site:enter', () => {
      if (audible || armed) return;
      window.__bgmEnter();
    }, { once: true });
  }

  /* ==========================================================
     11. 锚点精确定位：懒加载会改变页面高度，统一 JS 滚动 + 二次校正
     ========================================================== */
  function initAnchors() {
    const go = hash => {
      const target = document.querySelector(hash);
      if (!target) return;
      // 秒跳：不用 smooth，到位后随图片加载快速校正
      const jump = () => {
        const y = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo(0, Math.max(y, 0));
      };
      jump();
      setTimeout(jump, 180);
      setTimeout(jump, 600);
      setTimeout(jump, 1200);
    };
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      e.preventDefault();
      go(hash);
      history.replaceState(null, '', hash);
    });
    if (location.hash.length > 1) setTimeout(() => go(location.hash), 600);
  }

  /* ==========================================================
     0. 进入画面
     移动端内核规定「没有一次真实触摸就不许出声」。与其让用户
     进站后发现没声音再去找按钮，不如把这一次触摸做成一次正经
     的入场：点击进入 → 音乐从 0:00 起播 + 首屏动画才揭幕。
     ========================================================== */
  let heroMotionStarted = false;
  function startHeroMotion() {
    if (heroMotionStarted) return;
    heroMotionStarted = true;
    initTyping();
    initCounters();
  }

  function initGate() {
    const gate = $('#gate');
    /* 只在触屏设备上放进入画面：鼠标环境本来就允许带声自动播放，
       多一步点击只是添堵（桌面/触屏笔记本一律走这条） */
    const touchFirst = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (!gate || !touchFirst) {
      if (gate) {
        document.documentElement.classList.remove('gate-lock');
        gate.remove();
      }
      startHeroMotion();
      return;
    }

    const root = document.documentElement;
    let entered = false;

    const enter = () => {
      if (entered) return;
      entered = true;

      /* 第一件事：在手势栈里把声音放出来（必须在任何 DOM 操作之前，
         否则部分内核会认为手势已经用掉了，直接拒绝播放） */
      if (window.__bgmEnter) window.__bgmEnter();

      root.classList.remove('gate-lock');
      gate.classList.add('is-out');
      setTimeout(() => gate.remove(), 800);
      startHeroMotion();
      window.dispatchEvent(new CustomEvent('site:enter'));

      /* 带锚点进来时，滚动被 gate-lock 挡住了，这里补一次；
         没有锚点就统一回顶部，避免刷新后停在上次的位置 */
      if (location.hash.length > 1) {
        const t = document.querySelector(location.hash);
        if (t) setTimeout(() => {
          const y = t.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo(0, Math.max(y, 0));
        }, 90);
      } else {
        window.scrollTo(0, 0);
      }
    };

    /* 只认「进入」按钮：点画面空白处没有任何反应，
       避免滑动页面时被误当成进站 */
    const enterBtn = $('#gateEnter');
    if (enterBtn) enterBtn.addEventListener('click', e => { e.preventDefault(); enter(); });
    gate.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); }
    });
  }

  /* ==========================================================
     启动
     ========================================================== */
  function boot() {
    renderWorks();
    renderDesignNotes();
    initCoverflow();
    renderScreens();
    renderChars();
    renderFilmstrip();
    renderAwaken();
    renderAlbum();
    makeDraggable($('#albumTrack'));
    lb.init();
    initNav();
    initProgress();
    initAudio();
    initAnchors();
    initRevealFallback();
    initGate();          /* 内部决定首屏动效何时开始（有进入画面就等点击） */
    observe();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
