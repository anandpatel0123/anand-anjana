(function () {
  'use strict';

  var S = window.SETTINGS || {};
  var P = window.PHOTOS || {};
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  var LABELS = {
    ring: 'Ring Ceremony', lagun: 'Lagun', matapujan: 'Mata Pujan', haldi: 'Haldi',
    sangeet: 'Sangeet', wedding: 'Wedding', us: 'Just Us'
  };
  var ORDER = ['ring', 'lagun', 'matapujan', 'haldi', 'sangeet', 'wedding', 'us'];
  var ALL = ORDER.reduce(function (list, c) { return list.concat(P[c] || []); }, []);

  var VOWS = [
    ['पहला वचन', 'सहयोग', 'Support', 'Whatever you take on, you will never carry it alone.'],
    ['दूसरा वचन', 'सुरक्षा', 'Safety', 'With me you will always be safe, in every way a person can be.'],
    ['तीसरा वचन', 'एकता', 'Togetherness', 'We decide things together, and we stay on the same side, even on the days we disagree.'],
    ['चौथा वचन', 'सुख', 'Happiness', 'I will keep noticing the small things that make you smile, and keep doing them.'],
    ['पांचवा वचन', 'सम्मान', 'Respect', 'I will respect you, your family and your dreams, in front of everyone and when nobody is watching.'],
    ['छठवां वचन', 'देखभाल', 'Care', 'On the tired days and the sick days and the bad days, I will look after you.'],
    ['सातवां वचन', 'प्रेम', 'Love', 'And I will love you. It was the last sign on the path, and it holds up the other six.']
  ];

  /* ---------- Personalisation ---------- */
  var wife = (S.wifeName || '').trim();
  var me = (S.yourName || 'Anand').trim();
  if (wife) {
    $('introFor').textContent = 'For ' + wife;
    $('salute').textContent = 'My dearest ' + wife + ',';
    $('heroTitle').innerHTML = '';
    $('heroTitle').append(me + ' ');
    var amp = document.createElement('span');
    amp.className = 'amp';
    amp.textContent = '&';
    $('heroTitle').append(amp, ' ' + wife);
  }
  if (wife) document.title = me + ' & ' + wife + ' · 24 June 2026';
  $('signName').textContent = me;
  $('lastSign').textContent = me;

  /* ---------- Photo helpers ---------- */
  function thumb(p) { return 'images/' + p.f.replace(/([^/]+)$/, 'thumbs/$1') + '.webp'; }
  function full(p) { return 'images/' + p.f + '.jpg'; }

  function makeImg(p, sizes) {
    var img = document.createElement('img');
    var long = Math.max(p.w, p.h);
    var tw = Math.round(p.w * 760 / long);
    img.src = thumb(p);
    img.srcset = thumb(p) + ' ' + tw + 'w, ' + full(p) + ' ' + p.w + 'w';
    img.sizes = sizes;
    img.width = p.w;
    img.height = p.h;
    img.alt = p.t;
    img.loading = 'lazy';
    img.decoding = 'async';
    return img;
  }

  function tile(p, set, index) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ph';
    b.style.setProperty('--r', (p.w / p.h).toFixed(3));
    b.style.setProperty('--c', p.c);
    b.setAttribute('aria-label', 'Open photo: ' + p.t);
    b.appendChild(makeImg(p, '(max-width: 600px) 50vw, (max-width: 1000px) 34vw, 26vw'));
    b.addEventListener('click', function () { openBox(set, index); });
    return b;
  }

  /* ---------- Chapter mosaics ---------- */
  var showObserver = 'IntersectionObserver' in window && !calm
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); showObserver.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px' })
    : null;

  function watch(el) {
    if (showObserver) showObserver.observe(el); else el.classList.add('in');
  }

  document.querySelectorAll('.mosaic[data-cat]').forEach(function (box) {
    var set = P[box.dataset.cat] || [];
    box.dataset.show.split(',').forEach(function (n) {
      var i = Number(n);
      if (!set[i]) return;
      var t = tile(set[i], set, i);
      box.appendChild(t);
      watch(t);
    });
  });

  document.querySelectorAll('.see-all').forEach(function (b) {
    var set = P[b.dataset.cat] || [];
    b.textContent = 'See all ' + set.length + ' photos';
    b.addEventListener('click', function () { openBox(set, 0); });
  });

  document.querySelectorAll('.reveal').forEach(watch);

  /* ---------- Seven promises ---------- */
  VOWS.forEach(function (v) {
    var li = document.createElement('li');
    li.className = 'vow reveal';
    [['vow-ord', v[0], 'hi'], ['vow-word', v[1], 'hi'], ['vow-en', v[2]], ['vow-text', v[3]]].forEach(function (part) {
      var p = document.createElement('p');
      p.className = part[0];
      p.textContent = part[1];
      if (part[2]) p.lang = part[2];
      li.appendChild(p);
    });
    $('vows').appendChild(li);
    watch(li);
  });

  /* ---------- Just us reel ---------- */
  var reel = $('reel');
  (P.us || []).slice(0, 14).forEach(function (p, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'slide';
    b.setAttribute('aria-label', 'Open photo: ' + p.t);
    var frame = document.createElement('span');
    frame.className = 'ph-frame';
    frame.style.setProperty('--c', p.c);
    frame.appendChild(makeImg(p, '(max-width: 600px) 76vw, 380px'));
    var cap = document.createElement('span');
    cap.className = 'cap';
    cap.textContent = p.t;
    b.append(frame, cap);
    b.addEventListener('click', function () { openBox(P.us, i); });
    reel.appendChild(b);
  });
  function reelStep(dir) {
    var slide = reel.querySelector('.slide');
    if (slide) reel.scrollBy({ left: dir * (slide.offsetWidth + 24) * 2, behavior: calm ? 'auto' : 'smooth' });
  }
  $('reelPrev').addEventListener('click', function () { reelStep(-1); });
  $('reelNext').addEventListener('click', function () { reelStep(1); });

  /* ---------- Album ---------- */
  var grid = $('albumGrid');
  var chips = $('chips');
  $('albumCount').textContent = ALL.length + ' photographs, from the first ring to the last light.';

  var FIRST = 24;
  var more = $('albumMore');

  function showAlbum(cat, everything) {
    var set = cat === 'all' ? ALL : P[cat];
    var limit = everything || cat !== 'all' ? set.length : FIRST;
    grid.textContent = '';
    set.slice(0, limit).forEach(function (p, i) {
      var t = tile(p, set, i);
      t.classList.add('in');
      grid.appendChild(t);
    });
    more.hidden = limit >= set.length;
    more.textContent = 'Show all ' + set.length + ' photos';
    chips.querySelectorAll('.chip').forEach(function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.cat === cat));
    });
  }
  more.addEventListener('click', function () { showAlbum('all', true); });
  ['all'].concat(ORDER).forEach(function (cat) {
    var c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.dataset.cat = cat;
    c.textContent = cat === 'all' ? 'All' : LABELS[cat];
    var n = document.createElement('small');
    n.textContent = cat === 'all' ? ALL.length : P[cat].length;
    c.appendChild(n);
    c.addEventListener('click', function () { showAlbum(cat); });
    chips.appendChild(c);
  });
  showAlbum('all');

  /* ---------- Lightbox ---------- */
  var lb = $('lb'), lbImg = $('lbImg'), lbSet = [], lbI = 0, lastFocus = null, loadToken = 0;

  function paint() {
    var p = lbSet[lbI];
    var token = ++loadToken;
    var pre = new Image();
    lbImg.classList.add('swap');
    pre.onload = pre.onerror = function () {
      if (token !== loadToken) return;
      lbImg.src = pre.src;
      lbImg.alt = p.t;
      lbImg.classList.remove('swap');
    };
    pre.src = full(p);
    $('lbCap').textContent = p.t;
    $('lbCount').textContent = (lbI + 1) + ' of ' + lbSet.length;
    $('lbSave').href = full(p);
    [1, -1].forEach(function (d) {
      var n = lbSet[(lbI + d + lbSet.length) % lbSet.length];
      if (n) new Image().src = full(n);
    });
  }
  function step(d) {
    lbI = (lbI + d + lbSet.length) % lbSet.length;
    paint();
  }
  function openBox(set, i) {
    if (!set || !set.length) return;
    lbSet = set;
    lbI = i;
    lastFocus = document.activeElement;
    paint();
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    document.body.classList.add('locked');
  }
  function closeBox() { if (lb.close) lb.close(); else lb.removeAttribute('open'); }
  lb.addEventListener('close', function () {
    document.body.classList.remove('locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  });
  $('lbClose').addEventListener('click', closeBox);
  $('lbPrev').addEventListener('click', function () { step(-1); });
  $('lbNext').addEventListener('click', function () { step(1); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  var startX = null, startY = null;
  $('lbStage').addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; } else { startX = null; }
  }, { passive: true });
  $('lbStage').addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    startX = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------- Counters ---------- */
  var parts = (S.weddingDate || '2026-06-24').split('-').map(Number);
  var wed = new Date(parts[0], parts[1] - 1, parts[2]);
  var DAY = 86400000;
  function wholeDays(a, b) {
    var x = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var y = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((y - x) / DAY);
  }
  var today = new Date();
  var married = Math.max(0, wholeDays(wed, today));
  $('daysLabel').textContent = (married === 1 ? 'day' : 'days') + ' of being your husband';

  var yearsDone = today.getFullYear() - wed.getFullYear();
  var next = new Date(wed.getFullYear() + yearsDone, wed.getMonth(), wed.getDate());
  if (wholeDays(today, next) < 0) { yearsDone += 1; next = new Date(wed.getFullYear() + yearsDone, wed.getMonth(), wed.getDate()); }
  var toGo = wholeDays(today, next);
  var nth = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'][yearsDone] || (yearsDone + 'th');
  $('anniv').textContent = toGo === 0
    ? (yearsDone > 0 ? 'Happy ' + nth + ' anniversary, my love.' : 'Today is the day.')
    : toGo + (toGo === 1 ? ' day' : ' days') + ' until our ' + nth + ' anniversary.';

  var daysEl = $('days');
  daysEl.textContent = married.toLocaleString('en-IN');
  if ('IntersectionObserver' in window && !calm && married > 0) {
    var counted = false;
    new IntersectionObserver(function (entries, o) {
      if (!entries[0].isIntersecting || counted) return;
      counted = true;
      o.disconnect();
      var t0 = performance.now();
      (function tick(t) {
        var k = Math.min(1, (t - t0) / 1600);
        var eased = 1 - Math.pow(1 - k, 3);
        daysEl.textContent = Math.round(married * eased).toLocaleString('en-IN');
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: .5 }).observe(daysEl);
  }

  /* ---------- Falling petals, rising hearts ---------- */
  var PETALS = ['#e0457b', '#b3124f', '#f4a6c0', '#e8c37e', '#c91e62'];
  function petals(count) {
    if (calm) return;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('i');
      var size = 10 + Math.random() * 14;
      el.className = 'fall';
      el.style.cssText = 'left:' + (Math.random() * 100) + 'vw;width:' + size + 'px;height:' + (size * .78) + 'px;' +
        'background:' + PETALS[i % PETALS.length] + ';border-radius:100% 8% 100% 8%;opacity:' + (.65 + Math.random() * .35) + ';' +
        '--d:' + (5 + Math.random() * 5) + 's;--w:' + (Math.random() * 2.6) + 's;' +
        '--x:' + (Math.random() * 180 - 90) + 'px;--rot:' + (Math.random() * 720 - 360) + 'deg';
      el.addEventListener('animationend', function () { this.remove(); });
      document.body.appendChild(el);
    }
  }
  function hearts(count) {
    if (calm) return;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('i');
      el.className = 'rise';
      el.textContent = '♥';
      el.style.cssText = 'left:' + (8 + Math.random() * 84) + 'vw;font-style:normal;font-size:' + (16 + Math.random() * 26) + 'px;' +
        'color:' + PETALS[i % PETALS.length] + ';--d:' + (2.4 + Math.random() * 2) + 's;--w:' + (Math.random() * .8) + 's;' +
        '--x:' + (Math.random() * 120 - 60) + 'px';
      el.addEventListener('animationend', function () { this.remove(); });
      document.body.appendChild(el);
    }
  }
  $('hearts').addEventListener('click', function () { hearts(26); });
  $('surprise').addEventListener('click', function () {
    openBox(ALL, Math.floor(Math.random() * ALL.length));
  });

  /* ---------- Fairy lights ---------- */
  function fairyLights(canvas) {
    if (calm) return;
    var ctx = canvas.getContext('2d');
    var dots = [], w = 0, h = 0, raf = 0, visible = false;
    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(110, Math.max(36, w * h / 11000)));
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({ x: Math.random() * w, y: Math.random() * h, r: .8 + Math.random() * 1.8, s: .4 + Math.random() * 1.3, o: Math.random() * 6.28 });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var a = .25 + .6 * (.5 + .5 * Math.sin(t / 1000 * d.s + d.o));
        ctx.globalAlpha = a * .22;
        ctx.fillStyle = '#ffd98f';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 3.4, 0, 6.29); ctx.fill();
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.29); ctx.fill();
      }
      raf = visible ? requestAnimationFrame(draw) : 0;
    }
    size();
    window.addEventListener('resize', size);
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    }).observe(canvas);
  }
  document.querySelectorAll('canvas.lights').forEach(fairyLights);

  /* ---------- Music (only if a song is set) ---------- */
  var audio = null;
  if (S.music) {
    audio = new Audio(S.music);
    audio.loop = true;
    audio.volume = .55;
    var soundBtn = $('sound');
    soundBtn.addEventListener('click', function () {
      if (audio.paused) { audio.play(); soundBtn.classList.remove('off'); soundBtn.setAttribute('aria-label', 'Pause music'); }
      else { audio.pause(); soundBtn.classList.add('off'); soundBtn.setAttribute('aria-label', 'Play music'); }
    });
  }

  /* ---------- Envelope ---------- */
  var intro = $('intro');
  function seen(set) {
    try {
      if (set) sessionStorage.setItem('opened', '1');
      return sessionStorage.getItem('opened') === '1';
    } catch (e) { return false; }
  }
  function startMusic() {
    if (!audio) return;
    $('sound').hidden = false;
    var play = audio.play();
    if (play && play.catch) play.catch(function () { $('sound').classList.add('off'); });
  }
  if (seen()) {
    intro.classList.add('skip');
    if (audio) { $('sound').hidden = false; $('sound').classList.add('off'); audio.pause(); }
  } else {
    document.body.classList.add('locked');
    $('envelope').addEventListener('click', function open() {
      $('envelope').removeEventListener('click', open);
      intro.classList.add('opening');
      seen(true);
      startMusic();
      setTimeout(function () { petals(46); }, 900);
      setTimeout(function () {
        document.body.classList.remove('locked');
        intro.classList.add('skip');
      }, calm ? 200 : 1950);
    });
  }

  /* ---------- Top nav ---------- */
  var top = $('top');
  var links = Array.prototype.slice.call(top.querySelectorAll('a'));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      top.classList.toggle('show', !entries[0].isIntersecting);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe($('hero'));
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) spy.observe(target);
    });
  } else {
    top.classList.add('show');
  }
})();
