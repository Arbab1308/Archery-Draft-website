// ─── Lenis Smooth Scroll ──────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ─── GSAP Initialization ──────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─── Scroll Progress Bar ──────────────────────────────────────────────────
const scrollProgressBar = document.getElementById('scroll-progress');

lenis.on('scroll', ({ progress }) => {
  const pct = Math.round(progress * 100);
  scrollProgressBar.style.width = pct + '%';
  scrollProgressBar.setAttribute('aria-valuenow', pct);
});

// ─── Custom Cursor ────────────────────────────────────────────────────────
const cursorWrapper = document.getElementById('cursor');
const cursorRing    = document.getElementById('cursor-ring');
const cursorDot     = document.getElementById('cursor-dot');

if (cursorWrapper && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot follows instantly
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
  });

  // Ring lags behind with GSAP ticker
  gsap.ticker.add(() => {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    gsap.set(cursorRing, { x: ringX, y: ringY });
  });

  // Hover state on interactive elements
  const interactiveEls = document.querySelectorAll('a, button, [role="button"], .accordion-header, .cta-btn, .reserve-btn');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursorWrapper.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorWrapper.classList.remove('hovering'));
  });

  document.addEventListener('mousedown', () => cursorWrapper.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursorWrapper.classList.remove('clicking'));
}

// ─── Mobile Hamburger Navigation ─────────────────────────────────────────
const hamburger    = document.getElementById('hamburger');
const mobileOverlay = document.getElementById('mobile-overlay');

function openMobileNav() {
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileOverlay.classList.add('open');
  mobileOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lenis.stop();
}

function closeMobileNav() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileOverlay.classList.remove('open');
  mobileOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lenis.start();
}

hamburger.addEventListener('click', () => {
  hamburger.classList.contains('open') ? closeMobileNav() : openMobileNav();
});

// Populate mobile overlay with the same nav links
const navAnchors = ['#scrollytelling', '#anatomy', '#brand-story', '#cta'];
const navLabels  = ['THE COLLECTOR', 'THE CRAFT', 'GALLERY', 'INVESTMENT'];
navAnchors.forEach((href, i) => {
  const link = document.createElement('a');
  link.href        = href;
  link.textContent = navLabels[i];
  mobileOverlay.appendChild(link);
  link.addEventListener('click', (e) => {
    e.preventDefault();
    closeMobileNav();
    const target = document.querySelector(href);
    if (target) lenis.scrollTo(target, { offset: -80, duration: 1.5 });
  });
});

// ─── Back To Top Button ───────────────────────────────────────────────────
const backToTopBtn = document.getElementById('back-to-top');

lenis.on('scroll', ({ scroll }) => {
  if (scroll > 600) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
});

backToTopBtn.addEventListener('click', () => {
  lenis.scrollTo(0, { duration: 1.8, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
});

// ─── Loading Screen & Asset Preloading ───────────────────────────────────
const loader     = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
const loaderBar  = document.getElementById('loader-bar');
const loaderPerc = document.getElementById('loader-perc');

const frameCount   = 240;
const currentFrame = (index) => (
  `Assets/Jpeg_files/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const archerySequence = { frame: 0 };

// Preload images, tracking real load progress
let loadedCount = 0;

function preloadImages() {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.onload  = img.onerror = () => {
      loadedCount++;
      const realProgress = (loadedCount / frameCount) * 40; // maps to 0–40% of bar
      if (realProgress > parseFloat(loaderBar.style.width || '0')) {
        updateLoader(realProgress);
      }
    };
    img.src = currentFrame(i);
    images.push(img);
  }
}

preloadImages();

// ─── Loader character-reveal animation ───────────────────────────────────
const loaderLetters = 'IMPERATOR'.split('');
loaderText.textContent = '';
loaderLetters.forEach((ch, i) => {
  const span = document.createElement('span');
  span.textContent = ch;
  span.style.cssText = `
    display: inline-block;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s;
  `;
  loaderText.appendChild(span);
});

// Trigger letter reveal on next frame
requestAnimationFrame(() => {
  loaderText.querySelectorAll('span').forEach(s => {
    s.style.opacity   = '1';
    s.style.transform = 'translateY(0)';
  });
});

const loadingTimeline = gsap.timeline({
  onComplete: () => {
    gsap.to(loader, {
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        animateHero();
        initScrollytelling();
      }
    });
  }
});

// Phase 1: 0 → 90% (fast UI feel)
loadingTimeline.to({ val: 0 }, {
  val: 90,
  duration: 1,
  ease: 'power1.inOut',
  onUpdate: function() { updateLoader(this.targets()[0].val); }
});

// Phase 2: 90 → 100% (slower buffer feel)
loadingTimeline.to({ val: 90 }, {
  val: 100,
  duration: 2,
  ease: 'linear',
  onUpdate: function() { updateLoader(this.targets()[0].val); }
});

function updateLoader(val) {
  const p = Math.floor(val);
  loaderPerc.innerText    = p + '%';
  loaderBar.style.width   = p + '%';
  loader.style.backgroundColor = gsap.utils.interpolate('#1a1a1a', '#050505', val / 100);
  loaderText.style.color       = gsap.utils.interpolate('#333',    '#fff',    val / 100);
}

// ─── Hero Animations ──────────────────────────────────────────────────────
function animateHero() {
  const tagline      = document.getElementById('tagline');
  const taglineSpans = tagline.querySelectorAll('span');

  gsap.to(tagline, { opacity: 1, x: 0, duration: 1.5, ease: 'power3.out' });

  gsap.from(taglineSpans, {
    y: 50,
    opacity: 0,
    stagger: 0.2,
    duration: 1.2,
    ease: 'expo.out',
    delay: 0.2
  });

  // Parallax on scroll
  gsap.to('#hero', {
    backgroundPositionY: '30%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Nav entrance
  gsap.from('nav', { y: -100, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.5 });

  // Mouse-parallax on hero decorative layer
  const parallaxLayer = document.getElementById('hero-parallax');
  if (parallaxLayer) {
    document.addEventListener('mousemove', (e) => {
      const xPct = (e.clientX / window.innerWidth  - 0.5) * 30;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 20;
      gsap.to(parallaxLayer, {
        x: xPct,
        y: yPct,
        duration: 1.2,
        ease: 'power2.out'
      });
    });
  }
}

// ─── Phase 2: Scrollytelling ──────────────────────────────────────────────
function initScrollytelling() {
  const canvas  = document.getElementById('archery-canvas');
  const context = canvas.getContext('2d');

  // 4K internal resolution for maximum sharpness
  canvas.width  = 3840;
  canvas.height = 2160;

  context.imageSmoothingEnabled  = true;
  context.imageSmoothingQuality  = 'high';

  const render = () => {
    if (images[archerySequence.frame]) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const scale = 0.95;
      const w = canvas.width  * scale;
      const h = canvas.height * scale;
      const x = (canvas.width  - w) / 2;
      const y = (canvas.height - h) / 2;
      context.drawImage(images[archerySequence.frame], x, y, w, h);
    }
  };

  if (images[0].complete) { render(); } else { images[0].onload = render; }

  gsap.to(archerySequence, {
    frame: frameCount - 1,
    snap: 'frame',
    ease: 'none',
    scrollTrigger: {
      trigger: '#scrollytelling',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
    },
    onUpdate: render,
  });

  gsap.to('#hero', {
    opacity: 0,
    y: -100,
    scrollTrigger: {
      trigger: '#scrollytelling',
      start: 'top bottom',
      end: 'top top',
      scrub: true
    }
  });

  // Background gradient transitions
  const scrollytellingSection = document.getElementById('scrollytelling');

  ScrollTrigger.create({
    trigger: '#scrollytelling', start: 'top center', end: '33% top',
    onEnter:     () => scrollytellingSection.setAttribute('class', 'forest-green'),
    onLeaveBack: () => scrollytellingSection.setAttribute('class', ''),
  });

  ScrollTrigger.create({
    trigger: '#scrollytelling', start: '33% top', end: '66% top',
    onEnter:     () => scrollytellingSection.setAttribute('class', 'deep-bronze'),
    onLeaveBack: () => scrollytellingSection.setAttribute('class', 'forest-green'),
  });

  ScrollTrigger.create({
    trigger: '#scrollytelling', start: '66% top',
    onEnter:     () => scrollytellingSection.setAttribute('class', 'charcoal'),
    onLeaveBack: () => scrollytellingSection.setAttribute('class', 'deep-bronze'),
  });

  // ─── Phase 3: Anatomy labels ──────────────────────────────────────────
  const labels = ['riser', 'limbs', 'string', 'nock', 'rest'];

  labels.forEach((part, index) => {
    const label = document.getElementById(`label-${part}`);
    gsap.to(label, {
      opacity: 1,
      x: 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#anatomy',
        start: `${index * 15}% center`,
        end:   `${(index + 1) * 15}% center`,
        scrub: 1,
      }
    });
  });

  // ─── Phase 4: Brand Story ─────────────────────────────────────────────
  gsap.from('#story-tagline span', {
    y: 100,
    opacity: 0,
    stagger: 0.3,
    duration: 1.5,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '#brand-story',
      start: 'top center',
      toggleActions: 'play none none reverse'
    }
  });

  gsap.to('.story-bg', {
    y: '20%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#brand-story',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  // ─── Phase 5: FAQ Accordion ───────────────────────────────────────────
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header  = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');

    // Accessibility: keyboard support
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');

    const toggle = () => {
      const isActive = item.classList.contains('active');
      accordionItems.forEach(other => {
        other.classList.remove('active');
        other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  gsap.from('.section-title', {
    opacity: 0,
    letterSpacing: '20px',
    duration: 1.5,
    scrollTrigger: { trigger: '#faq', start: 'top 80%', toggleActions: 'play none none reverse' }
  });

  // ─── Phase 6: CTA & Footer ────────────────────────────────────────────
  gsap.from('.cta-title', {
    y: 50, opacity: 0, duration: 1.2,
    scrollTrigger: { trigger: '#cta', start: 'top 70%' }
  });

  gsap.from('.cta-feature', {
    y: 30, opacity: 0, stagger: 0.2, duration: 1,
    scrollTrigger: { trigger: '.cta-features', start: 'top 80%' }
  });

  // Magnetic effect on main CTA button
  const ctaBtn = document.querySelector('.cta-btn');
  if (ctaBtn && window.matchMedia('(pointer: fine)').matches) {
    ctaBtn.addEventListener('mousemove', (e) => {
      const rect    = ctaBtn.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const deltaX  = (e.clientX - centerX) * 0.35;
      const deltaY  = (e.clientY - centerY) * 0.35;
      gsap.to(ctaBtn, { x: deltaX, y: deltaY, duration: 0.4, ease: 'power2.out' });
    });
    ctaBtn.addEventListener('mouseleave', () => {
      gsap.to(ctaBtn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  }

  gsap.from('.footer-col', {
    y: 20, opacity: 0, stagger: 0.1, duration: 0.8,
    scrollTrigger: { trigger: 'footer', start: 'top 90%' }
  });

  // ─── Smooth Scroll for Nav Links ──────────────────────────────────────
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) lenis.scrollTo(target, { offset: -80, duration: 1.5 });
    });
  });
}
