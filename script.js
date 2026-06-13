/* ===== GEOTECH — interactions ===== */
(function () {
  'use strict';

  /* --- Année dans le footer --- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Nav : fond au scroll --- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Menu mobile --- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', function () {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* --- Révélation au défilement --- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('visible'); });
  }

  /* --- Compteurs animés --- */
  var counters = document.querySelectorAll('.stat__num');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* --- Formulaire (démo, sans backend) --- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();
    if (!name || !email || !message) {
      status.textContent = 'Merci de remplir tous les champs requis.';
      status.className = 'form__status err';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = 'Adresse email invalide.';
      status.className = 'form__status err';
      return;
    }
    // Ouvre le client mail avec le message pré-rempli (remplacez l'adresse).
    var subject = encodeURIComponent('Demande de devis — ' + form.subject.value);
    var body = encodeURIComponent('Nom : ' + name + '\nEmail : ' + email + '\n\n' + message);
    window.location.href = 'mailto:contact@gtec-sarlu.com?subject=' + subject + '&body=' + body;
    status.textContent = 'Merci ' + name + ' ! Votre logiciel de messagerie va s’ouvrir pour finaliser l’envoi.';
    status.className = 'form__status ok';
    form.reset();
  });

  /* --- Fond animé : réseau de particules --- */
  var canvas = document.getElementById('bg-canvas');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var w, h, dpr;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  function initParticles() {
    particles = [];
    var area = (window.innerWidth * window.innerHeight);
    var count = Math.min(90, Math.max(36, Math.round(area / 16000)));
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
        r: (Math.random() * 1.6 + 0.6) * dpr
      });
    }
  }
  initParticles();

  var mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
  });
  window.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var linkDist = 130 * dpr;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // attraction douce vers la souris
      var dxm = mouse.x - p.x, dym = mouse.y - p.y;
      var dm = Math.sqrt(dxm * dxm + dym * dym);
      if (dm < 160 * dpr && dm > 0) {
        p.x += (dxm / dm) * 0.4;
        p.y += (dym / dm) * 0.4;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(52, 169, 224, 0.55)';
      ctx.fill();

      for (var j = i + 1; j < particles.length; j++) {
        var q = particles[j];
        var dx = p.x - q.x, dy = p.y - q.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < linkDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          var alpha = (1 - d / linkDist) * 0.16;
          ctx.strokeStyle = 'rgba(247, 148, 30, ' + alpha + ')';
          ctx.lineWidth = dpr;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  if (!prefersReduced) {
    draw();
  } else {
    // rendu statique léger
    ctx.fillStyle = 'rgba(42,212,255,0.4)';
    particles.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
  }
})();
