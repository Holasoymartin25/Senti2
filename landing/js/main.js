(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.body.classList.add('page-transition');

  function inlineLogo() {
    var img = document.querySelector('img.header__logo');
    if (!img) return Promise.resolve();

    return fetch(img.getAttribute('src'))
      .then(function (r) { return r.text(); })
      .then(function (markup) {
        var box = document.createElement('div');
        box.innerHTML = markup.trim();
        var svg = box.querySelector('svg');
        if (!svg) return;
        svg.classList.add('header__logo', 'logo-svg');
        svg.setAttribute('width', '36');
        svg.setAttribute('height', '36');
        svg.setAttribute('aria-hidden', 'true');
        img.replaceWith(svg);
      })
      .catch(function () {});
  }

  function animateLogo() {
    if (typeof anime === 'undefined') return;

    var ring = document.querySelector('.logo-svg__ring');
    var leaf = document.querySelector('.logo-svg__leaf');

    if (ring) {
      anime({
        targets: ring,
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 1500,
        easing: 'easeInOutSine'
      });
    }

    if (leaf) {
      anime({
        targets: leaf,
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 900,
        easing: 'easeOutQuad'
      });
    }
  }

  function initParallax() {
    var layers = document.querySelectorAll('.parallax-layer');
    if (!layers.length || reducedMotion.matches) return;

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      layers.forEach(function (el) {
        var speed = parseFloat(el.dataset.speed || '0.2');
        el.style.transform = 'translate3d(0, ' + (y * speed) + 'px, 0)';
      });
    }, { passive: true });
  }

  function initCanvas() {
    var canvas = document.getElementById('wellness-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function draw() {
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(135, 169, 107, 0.06)';
      ctx.fillRect(0, 0, w, h);
    }

    resize();
    draw();
    window.addEventListener('resize', function () {
      resize();
      draw();
    });
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var feedback = document.getElementById('contact-feedback');
    var btn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      btn.disabled = true;
      if (feedback) feedback.hidden = true;

      fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.value.trim(),
          apellidos: form.apellidos.value.trim(),
          email: form.email.value.trim(),
          mensaje: form.mensaje.value.trim()
        })
      })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw d; return d; }); })
        .then(function () {
          if (!feedback) return;
          feedback.textContent = 'Mensaje enviado.';
          feedback.className = 'form__feedback form__feedback--ok';
          feedback.hidden = false;
          form.reset();
        })
        .catch(function () {
          if (!feedback) return;
          feedback.textContent = 'No se pudo enviar. Inténtalo más tarde.';
          feedback.className = 'form__feedback form__feedback--error';
          feedback.hidden = false;
        })
        .finally(function () { btn.disabled = false; });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    inlineLogo().then(function () {
      animateLogo();
      initParallax();
      initCanvas();
      initContactForm();
    });
  });
})();
