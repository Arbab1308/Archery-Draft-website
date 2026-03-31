// --- Lenis Smooth Scroll ---
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

// --- GSAP Initialization ---
gsap.registerPlugin(ScrollTrigger);

// --- Loading Screen & Asset Preloading ---
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
const loaderBar = document.getElementById('loader-bar');
const loaderPerc = document.getElementById('loader-perc');

const frameCount = 240;
const currentFrame = (index) => (
  `Assets/Jpeg_files/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const archerySequence = {
  frame: 0
};

// Preload Images
function preloadImages() {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }
}

preloadImages();

let progress = 0;
const loadingTimeline = gsap.timeline({
  onComplete: () => {
    // Reveal Hero Section
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

// Phase 1: 0 to 90% (Fast for UI loader)
loadingTimeline.to({ val: 0 }, {
  val: 90,
  duration: 1,
  ease: 'power1.inOut',
  onUpdate: function() {
    updateLoader(this.targets()[0].val);
  }
});

// Phase 2: 90 to 100% (Slower for asset buffer feeling)
loadingTimeline.to({ val: 90 }, {
  val: 100,
  duration: 2,
  ease: 'linear',
  onUpdate: function() {
    updateLoader(this.targets()[0].val);
  }
});

function updateLoader(val) {
  const p = Math.floor(val);
  loaderPerc.innerText = p + '%';
  loaderBar.style.width = p + '%';
  
  const darkenAmount = val / 100;
  const bgColor = gsap.utils.interpolate('#1a1a1a', '#050505', darkenAmount);
  loader.style.backgroundColor = bgColor;
  
  const textColor = gsap.utils.interpolate('#333', '#fff', darkenAmount);
  loaderText.style.color = textColor;
}

// --- Hero Animations ---
function animateHero() {
  const tagline = document.getElementById('tagline');
  const taglineSpans = tagline.querySelectorAll('span');
  
  gsap.to(tagline, {
    opacity: 1,
    x: 0,
    duration: 1.5,
    ease: 'power3.out'
  });

  gsap.from(taglineSpans, {
    y: 50,
    opacity: 0,
    stagger: 0.2,
    duration: 1.2,
    ease: 'expo.out',
    delay: 0.2
  });

  // Parallax effect on background
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

  // Subtle nav reveal
  gsap.from('nav', {
    y: -100,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.5
  });
}

// --- Phase 2: Scrollytelling ---
function initScrollytelling() {
  const canvas = document.getElementById('archery-canvas');
  const context = canvas.getContext('2d');

  // Set internal resolution higher (2x super-sampling) for sharper image
  canvas.width = 3840; 
  canvas.height = 2160;
  
  // Enable high-quality image smoothing
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  const render = () => {
    if (images[archerySequence.frame]) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Balanced Zoom: Middle of previous (1.0) and current (0.75)
      const scale = 0.875;
      const w = canvas.width * scale;
      const h = canvas.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      
      context.drawImage(images[archerySequence.frame], x, y, w, h);
    }
  };

  // Initial render
  if (images[0].complete) {
    render();
  } else {
    images[0].onload = render;
  }

  // Animate Frame Change
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

  // Hero to Scrollytelling Transition (Proper fade/move)
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

  // Background Gradient Transition based on scroll depth
  const scrollytellingSection = document.getElementById('scrollytelling');

  ScrollTrigger.create({
    trigger: '#scrollytelling',
    start: 'top center',
    end: '33% top',
    onEnter: () => scrollytellingSection.setAttribute('class', 'forest-green'),
    onLeaveBack: () => scrollytellingSection.setAttribute('class', ''),
  });

  ScrollTrigger.create({
    trigger: '#scrollytelling',
    start: '33% top',
    end: '66% top',
    onEnter: () => scrollytellingSection.setAttribute('class', 'deep-bronze'),
    onLeaveBack: () => scrollytellingSection.setAttribute('class', 'forest-green'),
  });

  ScrollTrigger.create({
    trigger: '#scrollytelling',
    start: '66% top',
    onEnter: () => scrollytellingSection.setAttribute('class', 'charcoal'),
    onLeaveBack: () => scrollytellingSection.setAttribute('class', 'deep-bronze'),
  });

  // --- Phase 3: Anatomy Logic ---
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
        end: `${(index + 1) * 15}% center`,
        scrub: 1,
      }
    });
  });

  // --- Phase 4: Brand Story ---
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

  // --- Phase 5: FAQ Accordion ---
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      // Close others
      accordionItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });
      // Toggle current
      item.classList.toggle('active');
    });
  });

  // Reveal FAQ section title
  gsap.from('.section-title', {
    opacity: 0,
    letterSpacing: '20px',
    duration: 1.5,
    scrollTrigger: {
      trigger: '#faq',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    }
  });
}
