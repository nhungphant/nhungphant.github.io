/* Nhung Phan portfolio. Plain JavaScript, no libraries.
   Everything here is an enhancement: without it, every link and every piece of text still works. */
(function () {
  'use strict';
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---- Say hello: the address is put together here, so it isn't sitting in the page for scrapers */
  var addr = ['nhungphant16', 'gmail.com'].join('@');
  $$('[data-mail]').forEach(function (a) { a.href = 'mailto:' + addr + '?subject=' + encodeURIComponent('Hello Nhung'); });

  /* ---- Pictures are for viewing: no right-click save, no dragging them out of the page */
  var pictures = 'img, svg, .n-mark, .dd, .spot, .cover, .desk, .stage, .cert__img';
  document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest(pictures)) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target.closest && e.target.closest(pictures)) e.preventDefault(); });
  $$('img').forEach(function (img) { img.draggable = false; });

  /* ---- Page loader: shows long enough for the doodle to draw and its line to be read, then lifts once the page
     has loaded (never later than 2.5s). Leaving for another page of the site only fades to ink; the next page draws. */
  var ld = $('.ld');
  if (ld) {
    var ldDone = false;
    var hideLd = function () { if (ldDone) return; ldDone = true; ld.classList.remove('ld--leave'); ld.classList.add('ld--done'); };
    var ldReady = function () { setTimeout(hideLd, Math.max(0, (calm ? 0 : 1300) - performance.now())); };
    if (document.readyState === 'complete') ldReady(); else window.addEventListener('load', ldReady);
    setTimeout(hideLd, 2500);
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (calm || !a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;   // other sites, mail, same-page links
      e.preventDefault();
      ld.classList.remove('ld--done'); ld.classList.add('ld--leave');   // fade to ink; the next page draws its own doodle
      ldDone = false;
      setTimeout(function () { location.href = url.href; }, 260);
    });
    // Coming back with the browser's Back button can restore this page as it was left: lift the loader again
    window.addEventListener('pageshow', function (e) { if (e.persisted) { ldDone = false; hideLd(); } });
  }

  /* ---- Mobile menu */
  var menu = $('#menu');
  var menuBtns = $$('[data-menu]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    menuBtns.forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    $$('[data-menu-label]').forEach(function (l) { l.textContent = open ? 'Close' : 'Menu'; });
    if (open) {
      // The floating Menu/Close only shows when the header's own button has scrolled out of view, so there is never two
      var hb = $('.top .menu-btn');
      if (fab && !(hb && hb.getBoundingClientRect().bottom > 0)) fab.classList.remove('fab--off');
      var sh = $('.sheet', menu); sh && sh.focus({ preventScroll: true }); }
    else scrollWork();
  }
  menuBtns.forEach(function (b) { b.addEventListener('click', function () { setMenu(menu.hidden); }); });
  if (menu) {
    $$('[data-menu-close], a', menu).forEach(function (el) { el.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtns[0] && menuBtns[0].focus(); } });
  }

  /* ---- Phone menu: the current section is marked like the side index, with the hand-drawn underline.
     Opening the menu moves focus to the sheet itself, so no link shows a focus ring until you use the keyboard. */
  var sheetLinks = menu ? $$('.n-sheet__list a', menu) : [];
  var sheetEl = menu && $('.sheet', menu);
  if (sheetEl) sheetEl.setAttribute('tabindex', '-1');
  sheetLinks.forEach(function (a) {
    var txt = a.lastChild;
    if (!txt || txt.nodeType !== 3) return;
    var t = document.createElement('span'); t.className = 't'; t.textContent = txt.textContent;
    t.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M4 15 C 46 8, 98 5, 152 9 S 246 17, 296 7"></path></svg>');
    a.replaceChild(t, txt);
  });

  /* ---- Scroll: floating Menu word, side index, About story */
  var fab = $('.fab');
  var idx = $('.idx');
  var idxLinks = idx ? $$('a', idx) : [];
  var ids = idxLinks.map(function (a) { return a.getAttribute('href').slice(1); });
  var startId = document.body.getAttribute('data-start');
  var story = $('#story');
  var words = story ? $$('.w', story) : [];
  var lastY = window.scrollY || 0, idxTimer = null, hovering = false, zoneOk = false, current = -1;

  function showIdx() {
    if (!idx || !zoneOk) return;
    idx.classList.remove('idx--off');
    clearTimeout(idxTimer);
    if (!hovering) idxTimer = setTimeout(function () { idx.classList.add('idx--off'); idx.classList.remove('idx--full'); }, 1600);
  }
  function scrollWork() {
    var vh = window.innerHeight || 800, y = window.scrollY || 0;
    if (fab) {
      var menuOpen = menu && !menu.hidden;
      if (!menuOpen) {
        if (y < 400 || y - lastY > 6) fab.classList.add('fab--off');
        else if (lastY - y > 6) fab.classList.remove('fab--off');
      }
    }
    lastY = y;
    if (idx) {
      var start = startId && document.getElementById(startId), foot = document.getElementById('footer');
      var startEnd = start ? start.getBoundingClientRect().bottom : 0;
      var footTop = foot ? foot.getBoundingClientRect().top : 99999;
      zoneOk = startEnd < vh * 0.4 && footTop > vh * 0.85;
      var cur = 0;
      ids.forEach(function (id, i) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= vh * 0.4) cur = i; });
      if (cur !== current) {
        current = cur;
        idxLinks.forEach(function (a, i) { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        sheetLinks.forEach(function (a) { if (a.getAttribute('href') === '#' + ids[cur]) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      }
      if (zoneOk) showIdx();
      else { clearTimeout(idxTimer); idx.classList.add('idx--off'); idx.classList.remove('idx--full'); }
    }
    if (story && !calm) {
      var r = story.getBoundingClientRect();
      var p = (vh * 0.8 - r.top) / Math.max(1, r.height + vh * 0.2);
      var lit = Math.ceil(Math.max(0, Math.min(1, p)) * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; scrollWork(); });
  }, { passive: true });
  window.addEventListener('resize', scrollWork);
  if (idx) {
    var zone = $('.idx-zone');
    zone && zone.addEventListener('mouseenter', function () { scrollWork(); showIdx(); });
    idx.addEventListener('mouseenter', function () { hovering = true; clearTimeout(idxTimer); idx.classList.remove('idx--off'); idx.classList.add('idx--full'); });
    idx.addEventListener('mouseleave', function () { hovering = false; idx.classList.remove('idx--full'); showIdx(); });
  }
  scrollWork();

  /* ---- Endless carousels (Kind words, certificates).
     The track scrolls natively, so it follows a finger, a trackpad (with its momentum) or a mouse drag,
     and snaps to the nearest item. A copy of the items sits on each side; when the scroll settles on a copy,
     it jumps by one set to the matching original, so it loops forever without a visible seam. */
  $$('[data-carousel]').forEach(function (track) {
    var key = track.getAttribute('data-carousel');
    var originals = $$('[data-item]', track);
    var n = originals.length;
    if (!n) return;
    var dimCls = originals[0].classList.contains('q') ? 'q--dim' : 'cert--dim';
    function copy(it) {
      var c = it.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.removeAttribute('aria-label');
      $$('a, button', c).forEach(function (el) { el.tabIndex = -1; });
      return c;
    }
    originals.forEach(function (it) { track.appendChild(copy(it)); });
    originals.slice().reverse().forEach(function (it) { track.insertBefore(copy(it), track.firstChild); });
    var all = $$('[data-item]', track);           // copies, originals, copies
    var num = $('[data-num="' + key + '"]');
    var cur = -1;

    function step() { return all[1].offsetLeft - all[0].offsetLeft; }
    function nearest() {
      var left = track.getBoundingClientRect().left, best = 0, bd = Infinity;
      all.forEach(function (it, i) { var d = Math.abs(it.getBoundingClientRect().left - left); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function mark() {
      var i = nearest();
      if (i === cur) return;
      cur = i;
      all.forEach(function (it, k) { it.classList.toggle(dimCls, k !== i); });
      originals.forEach(function (it, k) {
        var on = k === i % n;
        it.setAttribute('aria-hidden', on ? 'false' : 'true');
        $$('a', it).forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      });
      if (num) num.textContent = pad(i % n + 1);
    }
    function jump(by) {                            // move instantly, without snapping or smooth scrolling
      track.style.scrollSnapType = 'none'; track.style.scrollBehavior = 'auto';
      track.scrollLeft += by;
      track.style.scrollSnapType = ''; track.style.scrollBehavior = '';
    }
    function settle() {                            // when a scroll ends on a copy, swap to the original
      if (dragX !== null) return;
      var i = nearest();
      if (i < n) jump(n * step());
      else if (i >= 2 * n) jump(-n * step());
      mark();
    }
    function home() { jump(all[n + Math.max(0, cur) % n].offsetLeft - all[0].offsetLeft - track.scrollLeft); }

    var rafOn = false, idle = null, dragX = null, startLeft = 0, moved = false;
    home(); mark();
    track.addEventListener('scroll', function () {
      if (!rafOn) { rafOn = true; requestAnimationFrame(function () { rafOn = false; mark(); }); }
      clearTimeout(idle); idle = setTimeout(settle, 160);   // fallback for browsers without scrollend
    }, { passive: true });
    track.addEventListener('scrollend', function () { clearTimeout(idle); settle(); });

    function toItem(el) { track.scrollBy({ left: el.getBoundingClientRect().left - track.getBoundingClientRect().left, behavior: calm ? 'auto' : 'smooth' }); }
    function go(d) { toItem(all[Math.max(0, Math.min(all.length - 1, nearest() + d))]); }
    var prev = $('[data-prev="' + key + '"]'), next = $('[data-next="' + key + '"]');
    prev && prev.addEventListener('click', function () { go(-1); });
    next && next.addEventListener('click', function () { go(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
    });

    // Mouse drag (touch and trackpads already scroll natively). It only counts as a drag after 4px;
    // snapping pauses while dragging, and on release the track glides to the nearest item.
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragX = e.clientX; startLeft = track.scrollLeft; moved = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (dragX === null) return;
      var dx = e.clientX - dragX;
      if (!moved && Math.abs(dx) > 4) { moved = true; track.style.scrollSnapType = 'none'; track.classList.add('loop--drag'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (dragX === null) return;
      dragX = null;
      if (!moved) return;                          // a plain click: the click handler below takes it
      track.classList.remove('loop--drag');
      track.style.scrollSnapType = '';
      toItem(all[nearest()]);
    });
    // Clicking or tapping a dimmed item brings it forward (its links wait until it is the current item)
    track.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
      var hit = e.target.closest && e.target.closest('[data-item]');
      if (!hit || all.indexOf(hit) === nearest()) return;
      e.preventDefault(); e.stopPropagation();
      toItem(hit);
    }, true);
    $$('img', track).forEach(function (img) { img.draggable = false; });
    window.addEventListener('resize', home);
  });

  /* ---- Flow demos: play on their own while on screen, pause on hover or focus, any step can be picked */
  $$('[data-demo]').forEach(function (demo) {
    var k = demo.getAttribute('data-demo');
    var btns = $$('[data-step]', demo);
    var shot = $('[data-shot]', demo), tap = $('[data-tap]', demo);
    var n = btns.length, i = 0, a = 0, paused = false, visible = false, timer = null;
    btns.forEach(function (b) { var im = new Image(); im.src = b.getAttribute('data-src'); }); // warm the cache
    function show(j) {
      i = (j + n) % n; a++;
      btns.forEach(function (b, x) {
        var bar = $('.bar', b);
        if (x === i) { b.setAttribute('aria-current', 'step'); bar.className = 'bar ' + (a % 2 ? 'fill-a' : 'fill-b'); }
        else { b.removeAttribute('aria-current'); bar.className = 'bar'; }
      });
      shot.src = btns[i].getAttribute('data-src'); shot.alt = btns[i].getAttribute('data-alt');
      if (!calm) { shot.classList.remove('slide-a', 'slide-b'); void shot.offsetWidth; shot.classList.add(a % 2 ? 'slide-a' : 'slide-b'); }
      tap.className = 'tap tap--' + k + '-' + i;
    }
    function tick() { if (!paused && visible) show(i + 1); }
    function play() {
      clearInterval(timer);
      if (calm) return;
      timer = setInterval(tick, 2800);
    }
    btns.forEach(function (b, x) { b.addEventListener('click', function () { show(x); play(); }); });
    demo.addEventListener('mouseenter', function () { paused = true; demo.classList.add('demo--paused'); });
    demo.addEventListener('mouseleave', function () { paused = false; demo.classList.remove('demo--paused'); });
    demo.addEventListener('focusin', function () { paused = true; demo.classList.add('demo--paused'); });
    demo.addEventListener('focusout', function () { paused = false; demo.classList.remove('demo--paused'); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var was = visible; visible = e.isIntersecting;
          if (visible && !was) { show(i); play(); }       // restart the bar when it comes into view
        });
      }, { threshold: 0.35 }).observe(demo);
    } else { visible = true; play(); }
    if (calm) btns[0] && $('.bar', btns[0]) && ($('.bar', btns[0]).className = 'bar');
  });
})();
