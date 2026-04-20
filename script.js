/* ═══════════════════════════════════════════════════════════════
   DANIEL KISHAM — NEWS ANCHOR PORTAL
   script.js
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Utility ── */
const qs  = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

/* ══════════════════════════════════════════════════
   1. CUSTOM CURSOR
══════════════════════════════════════════════════ */
(function initCursor() {
  const cursor = qs('#cursor');
  const ring   = qs('#cursorRing');
  if (!cursor || !ring) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state via body class
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .vault-card, .skill-chip, .service-row')) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .vault-card, .skill-chip, .service-row')) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Hide on mobile
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    ring.style.display   = 'none';
    document.body.style.cursor = 'auto';
    cancelAnimationFrame(rafId);
  }
})();

/* ══════════════════════════════════════════════════
   2. STICKY NAV + SCROLL HIGHLIGHT
══════════════════════════════════════════════════ */
(function initNav() {
  const header  = qs('#navHeader');
  const burger  = qs('#navBurger');
  const links   = qs('#navLinks');

  if (!header) return;

  // Scrolled class
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile burger
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    qsa('[data-nav]', links).forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!header.contains(e.target) && links.classList.contains('open')) {
        links.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Active nav link on scroll
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--text-white)'
            : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ══════════════════════════════════════════════════
   3. SCROLL REVEAL
══════════════════════════════════════════════════ */
(function initReveal() {
  // [data-reveal] elements
  const items = qsa('[data-reveal]');

  items.forEach(el => {
    const delay = el.dataset.revealDelay;
    if (delay) el.style.setProperty('--rd', delay + 's');
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => revealObserver.observe(el));
})();

/* ══════════════════════════════════════════════════
   4. COUNTER ANIMATION
══════════════════════════════════════════════════ */
(function initCounters() {
  const counters = qsa('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = target >= 100 ? '+' : '+';
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const ease = 1 - Math.pow(2, -10 * progress);
      const value = Math.floor(ease * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));
})();

/* ══════════════════════════════════════════════════
   5. SMOOTH ANCHOR SCROLL
══════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 76; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ══════════════════════════════════════════════════
   6. VAULT CARD MOUSE-GLOW EFFECT
══════════════════════════════════════════════════ */
(function initVaultGlow() {
  const cards = qsa('.vault-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      const glow = qs('.vault-card-glow', card);
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,112,243,0.15) 0%, transparent 60%)`;
      }
    });
  });
})();

/* ══════════════════════════════════════════════════
   7. SERVICE ROW HOVER LINE EFFECT
══════════════════════════════════════════════════ */
(function initServiceRows() {
  const rows = qsa('.service-row');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      const h3 = qs('h3', row);
      if (h3) h3.style.letterSpacing = '2px';
    });
    row.addEventListener('mouseleave', () => {
      const h3 = qs('h3', row);
      if (h3) h3.style.letterSpacing = '1px';
    });
  });
})();

/* ══════════════════════════════════════════════════
   8. HERO PARALLAX (subtle)
══════════════════════════════════════════════════ */
(function initParallax() {
  const glow1 = qs('.hero-glow-1');
  const glow2 = qs('.hero-glow-2');
  if (!glow1 || !glow2) return;

  // Only on desktop
  if (window.innerWidth < 768) return;

  window.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    glow1.style.transform = `translate(calc(-50% + ${cx * 20}px), calc(-55% + ${cy * 20}px))`;
    glow2.style.transform = `translate(${cx * -12}px, ${cy * -12}px)`;
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════
   9. GLITCH ON-DEMAND (random interval)
══════════════════════════════════════════════════ */
(function initGlitchPulse() {
  const wrap = qs('.glitch-wrap');
  if (!wrap) return;

  // Occasionally trigger a stronger glitch via class
  function glitchPulse() {
    wrap.classList.add('glitch-active');
    setTimeout(() => wrap.classList.remove('glitch-active'), 300);
    setTimeout(glitchPulse, 4000 + Math.random() * 5000);
  }
  setTimeout(glitchPulse, 3000);
})();

/* ══════════════════════════════════════════════════
   10. TICKER PAUSE ON HOVER
══════════════════════════════════════════════════ */
(function initTickerPause() {
  const track = qs('#tickerTrack');
  if (!track) return;
  track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
})();

/* ══════════════════════════════════════════════════
   11. PAGE LOAD ANIMATION KICKOFF
══════════════════════════════════════════════════ */
(function initPageLoad() {
  // Immediately trigger hero reveals (above the fold)
  document.querySelectorAll('.hero [data-reveal]').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 100);
  });
})();

/* ══════════════════════════════════════════════════
   12. FOOTER YEAR
══════════════════════════════════════════════════ */
(function initYear() {
  const yr = qs('.footer-bottom span');
  if (yr) {
    yr.textContent = yr.textContent.replace('2025', new Date().getFullYear());
  }
})();
