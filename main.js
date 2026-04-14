// IMAGE SEQUENCE SCROLL ANIMATION
(function () {
  'use strict';

  // CONFIG
  const TOTAL_FRAMES = 96;
  const FRAME_FOLDER = 'frames/';
  const FRAME_PREFIX = 'ezgif-frame-';
  const FRAME_EXT = '.jpg';

  // UTILS
  function padNum(n) {
    return String(n).padStart(3, '0');
  }

  function frameSrc(index) {
    // index: 1-based
    return FRAME_FOLDER + FRAME_PREFIX + padNum(index) + FRAME_EXT;
  }

  // ELEMENTS
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderPct = document.getElementById('loader-percent');
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');

  // CANVAS SIZING
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    renderFrame(currentFrameIndex);
  });

  // IMAGE PRELOADING
  const images = new Array(TOTAL_FRAMES + 1); // 1-indexed, [0] unused
  let loadedCount = 0;
  let currentFrameIndex = 1;

  function updateLoader(count) {
    const pct = Math.round((count / TOTAL_FRAMES) * 100);
    loaderFill.style.width = pct + '%';
    loaderPct.textContent = pct + '%';
  }

  function preloadImages() {
    return new Promise((resolve) => {
      let settled = 0;

      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        images[i] = img;

        img.onload = img.onerror = () => {
          settled++;
          loadedCount = settled;
          updateLoader(settled);
          if (settled === TOTAL_FRAMES) resolve();
        };

        img.src = frameSrc(i);
      }
    });
  }

  // CANVAS RENDERING
  function renderFrame(index) {
    const img = images[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Cover-fit: scale to fill canvas, centre
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const ox = (cw - sw) / 2;
    const oy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, ox, oy, sw, sh);
  }

  // SCROLL → FRAME MAPPING
  function onScroll() {
    const heroSection = document.getElementById('hero');
    const scrollTop = window.scrollY;
    const maxScroll = heroSection.offsetHeight - window.innerHeight;

    const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    // Frame index: 1 at progress=0, TOTAL_FRAMES at progress=1
    const frameIndex = Math.round(1 + progress * (TOTAL_FRAMES - 1));

    if (frameIndex !== currentFrameIndex) {
      currentFrameIndex = frameIndex;
      renderFrame(currentFrameIndex);
    }
  }

  // NAVBAR SCROLL EFFECT
  function onScrollNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  // REVEAL ON SCROLL (Intersection Observer)
  function initReveal() {
    const targets = document.querySelectorAll(
      '.menu-card, .about-content, .about-image-wrap, .cta-inner, .section-eyebrow, .section-title, .section-sub'
    );
    targets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  // HAMBURGER MENU
  const hamburgerIcon = document.getElementById('hamburger-icon');

  hamburger.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    if (isOpen) {
      hamburgerIcon.classList.remove('fa-bars');
      hamburgerIcon.classList.add('fa-xmark');
    } else {
      hamburgerIcon.classList.remove('fa-xmark');
      hamburgerIcon.classList.add('fa-bars');
    }
  });

  // Close mobile nav on link click
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMobile.classList.remove('open');
      hamburgerIcon.classList.remove('fa-xmark');
      hamburgerIcon.classList.add('fa-bars');
    });
  });

  // INIT
  async function init() {
    // Lock scroll during load
    document.body.style.overflow = 'hidden';

    await preloadImages();

    // Short pause so 100% flash is visible
    await new Promise(r => setTimeout(r, 400));

    // Hide loader
    loader.classList.add('hidden');
    document.body.style.overflow = '';

    // Draw first frame immediately
    renderFrame(1);

    // Attach listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScrollNavbar, { passive: true });

    // Initial states
    onScrollNavbar();
    onScroll();
    initReveal();
  }

  init();

})();