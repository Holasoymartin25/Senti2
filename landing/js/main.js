(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.body.classList.add('page-transition');

  function inlineLogo() {
    return new Promise(function (resolve) {
      var img = document.querySelector('img.header__logo');
      if (!img) {
        resolve();
        return;
      }

      fetch(img.getAttribute('src'))
        .then(function (response) { return response.text(); })
        .then(function (markup) {
          var box = document.createElement('div');
          box.innerHTML = markup.trim();
          var svg = box.querySelector('svg');
          if (!svg) {
            resolve();
            return;
          }
          svg.classList.add('header__logo', 'logo-svg');
          svg.setAttribute('width', '40');
          svg.setAttribute('height', '40');
          svg.setAttribute('aria-hidden', 'true');
          img.replaceWith(svg);
          resolve();
        })
        .catch(function () {
          resolve();
        });
    });
  }

  function animateLogo() {
    if (typeof anime === 'undefined') return;

    var ring = document.querySelector('.logo-svg__ring');
    var leaf = document.querySelector('.logo-svg__leaf');
    var heart = document.querySelector('.logo-svg__heart');
    if (!leaf) return;

    if (ring) {
      anime({
        targets: ring,
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 1800,
        easing: 'easeInOutSine'
      });
    }

    anime({
      targets: leaf,
      scale: [0.85, 1],
      opacity: [0, 1],
      duration: 1200,
      easing: 'easeOutElastic(1, .6)'
    });

    if (heart) {
      anime({
        targets: heart,
        scale: [0, 1],
        opacity: [0, 1],
        delay: 600,
        duration: 900,
        easing: 'easeOutBack'
      });
    }
  }

  function initParallax() {
    var layers = document.querySelectorAll('.parallax-layer');
    if (!layers.length || reducedMotion.matches) return;

    var ticking = false;

    function update() {
      var scrollY = window.scrollY;
      layers.forEach(function (el) {
        var speed = parseFloat(el.dataset.speed || '0.3');
        el.style.transform = 'translate3d(0, ' + (scrollY * speed) + 'px, 0)';
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      window.requestAnimationFrame(update);
      ticking = true;
    }, { passive: true });
  }

  function initCanvas() {
    var canvas = document.getElementById('wellness-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var w = 0;
    var h = 0;
    var t = 0;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function draw() {
      if (reducedMotion.matches) {
        ctx.fillStyle = 'rgba(135, 169, 107, 0.08)';
        ctx.fillRect(0, 0, w, h);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * 0.5);
        for (var x = 0; x <= w; x += 8) {
          ctx.lineTo(x, h * 0.5 + Math.sin(x * 0.008 + t + i) * (30 + i * 15));
        }
        ctx.strokeStyle = 'rgba(135, 169, 107, ' + (0.15 - i * 0.03) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      t += 0.02;
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('reveal--visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initCardTilt() {
    if (reducedMotion.matches) return;

    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(600px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    inlineLogo().then(function () {
      animateLogo();
      initParallax();
      initCanvas();
      initReveal();
      initCardTilt();
    });
  });
})();
