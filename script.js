(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Footer year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // Active nav link
  var links = document.querySelectorAll('.nav-wrap a');
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          var a = map[e.target.id];
          if (a) {
            a.setAttribute('aria-current', 'true');
            var nav = a.closest('nav');
            if (nav && nav.scrollWidth > nav.clientWidth) {
              nav.scrollLeft = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
            }
          }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  // Hover tilt on project cards
  if (!reduce && finePointer) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var max = 4;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * max * 2).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * max * 2).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  // Lightbox
  var dlg = document.getElementById('lightbox');
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  if (dlg && typeof dlg.showModal === 'function' && items.length) {
    var img = document.getElementById('lb-img');
    var cap = document.getElementById('lb-cap');
    var current = 0;
    var opener = null;

    function show(i) {
      current = (i + items.length) % items.length;
      var src = items[current].querySelector('img');
      img.src = src.currentSrc || src.src;
      img.alt = src.alt;
      cap.textContent = items[current].getAttribute('data-caption') || '';
    }
    function open(i) {
      opener = items[i];
      show(i);
      dlg.showModal();
      document.body.classList.add('lb-open');
    }
    function close() { dlg.close(); }

    items.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    dlg.querySelector('.lb-close').addEventListener('click', close);
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('close', function () {
      document.body.classList.remove('lb-open');
      if (opener) opener.focus();
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(current - 1); }
      else if (e.key === 'ArrowRight') { show(current + 1); }
    });
  }
})();
