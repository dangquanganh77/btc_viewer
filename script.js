// 1. Initialize Lenis (Smooth Scroll)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0, 0);

// 2. Custom Magnetic Cursor
const cursor = document.getElementById('custom-cursor');
const interactables = document.querySelectorAll('.cursor-interact');
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

if (!isTouchDevice) {
  const xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3"});
  const yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3"});

  window.addEventListener('mousemove', (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
  });

  interactables.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover-glow'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover-glow'));
  });
} else if (cursor) {
  cursor.style.display = 'none';
}

// 3. Drawer Toggle
const drawer = document.getElementById('partner-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const openBtns = document.querySelectorAll('.open-drawer-trigger, #open-drawer-btn');
const closeBtn = document.getElementById('close-drawer-btn');

const toggleDrawer = (open) => {
  if (open) {
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
      drawerOverlay.classList.add('active');
      lenis.stop();
  } else {
      drawer.classList.add('translate-x-full');
      drawer.classList.remove('translate-x-0');
      drawerOverlay.classList.remove('active');
      lenis.start();
  }
};

openBtns.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); toggleDrawer(true); }));
if(closeBtn) closeBtn.addEventListener('click', () => toggleDrawer(false));
if(drawerOverlay) drawerOverlay.addEventListener('click', () => toggleDrawer(false));

// 4. Hero Reveal
gsap.from(".hero-title", { yPercent: 100, duration: 1, ease: "power4.out", stagger: 0.1, delay: 0.1 });
gsap.to(".hero-fade-in", { opacity: 1, duration: 0.8, delay: 0.8, ease: "power2.out" });
gsap.to(".parallax-img", { opacity: 1, duration: 1.2, stagger: 0.2, ease: "power3.out", delay: 0.4 });

if (!isTouchDevice) {
  const heroSection = document.getElementById('hero');
  const pImages = document.querySelectorAll('.parallax-img');
  if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
          const x = (window.innerWidth / 2 - e.clientX) / 45;
          const y = (window.innerHeight / 2 - e.clientY) / 45;
          pImages.forEach((img, idx) => {
              gsap.to(img, { x: x * (idx + 1), y: y * (idx + 1), duration: 0.8, ease: "power1.out" });
          });
      });
  }
}

// 5. Scroll Velocity Top Marquees
const track1 = document.querySelector('.marquee-track');
const track2 = document.querySelector('.marquee-track-reverse');

if (track1) {
  let m1 = gsap.to(track1, { xPercent: -50, ease: "none", duration: 18, repeat: -1 });
  ScrollTrigger.create({
      onUpdate: (self) => {
          let scale = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 120);
          gsap.to(m1, { timeScale: scale, duration: 0.2, overwrite: true });
          gsap.to(m1, { timeScale: 1, duration: 1, delay: 0.2, overwrite: "auto" });
      }
  });
}

if (track2) {
  let m2 = gsap.fromTo(track2, { xPercent: -50 }, { xPercent: 0, ease: "none", duration: 22, repeat: -1 });
  ScrollTrigger.create({
      onUpdate: (self) => {
          let scale = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 120);
          gsap.to(m2, { timeScale: scale, duration: 0.2, overwrite: true });
          gsap.to(m2, { timeScale: 1, duration: 1, delay: 0.2, overwrite: "auto" });
      }
  });
}

// 6. Manifesto Text Reveal
gsap.from(".manifesto-text", {
  y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
  scrollTrigger: { trigger: ".mission-section", start: "top 75%" }
});

// 7. Dynamic Setup After Asset Load (Vault & Moving Galleries)
window.addEventListener('load', () => {
  // A. Vault Horizontal Scroll Pin
  const vault = document.querySelector('.vault-container');
  if (vault) {
      gsap.to(vault, {
          x: () => -(vault.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
              trigger: ".vault-section",
              pin: true,
              scrub: 1,
              end: () => "+=" + (vault.scrollWidth - window.innerWidth),
              invalidateOnRefresh: true
          }
      });
  }

  // B. Gallery Moving Tracks (Reliable Auto-Scroll with Pause on Hover)
  const trackLeft = document.getElementById('track-left');
  const trackRight = document.getElementById('track-right');

  if (trackLeft && trackRight) {
      // Calculate exact half width for seamless infinite looping
      const halfWidthLeft = trackLeft.scrollWidth / 2;
      const loopLeft = gsap.to(trackLeft, {
          x: -halfWidthLeft,
          duration: 30,
          ease: "none",
          repeat: -1,
          modifiers: {
              x: gsap.utils.unitize(x => parseFloat(x) % halfWidthLeft)
          }
      });

      const halfWidthRight = trackRight.scrollWidth / 2;
      gsap.set(trackRight, { x: -halfWidthRight });
      const loopRight = gsap.to(trackRight, {
          x: 0,
          duration: 32,
          ease: "none",
          repeat: -1,
          modifiers: {
              x: gsap.utils.unitize(x => {
                  let val = parseFloat(x);
                  return val > 0 ? (val % halfWidthRight) - halfWidthRight : val;
              })
          }
      });

      // Pause tracks when cursor enters the gallery container
      const gallerySection = document.getElementById('gallery');
      if (gallerySection) {
          gallerySection.addEventListener('mouseenter', () => {
              loopLeft.pause();
              loopRight.pause();
          });
          gallerySection.addEventListener('mouseleave', () => {
              loopLeft.play();
              loopRight.play();
          });
      }
  }

  // C. Footer Background Text (Moving Forward / Left to Right)
  const footerTrack = document.querySelector('.footer-marquee-track');
  if (footerTrack) {
      gsap.fromTo(footerTrack, 
          { xPercent: -50 }, 
          { xPercent: 0, duration: 40, ease: "none", repeat: -1 }
      );
  }

  ScrollTrigger.refresh();
});

// 8. Kinetic Pan & 3D Tilt for all Cards
if (!isTouchDevice) {
  document.querySelectorAll('.img-hover').forEach(container => {
      const img = container.querySelector('img');
      if (!img) return;

      container.addEventListener('mouseenter', () => {
          gsap.to(img, { scale: 1.12, duration: 0.6, ease: "power2.out", filter: "grayscale(0%)", opacity: 1 });
      });
      container.addEventListener('mousemove', (e) => {
          const rect = container.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(img, { x: x * 18, y: y * 18, duration: 0.35, ease: "power1.out" });
      });
      container.addEventListener('mouseleave', () => {
          gsap.to(img, { scale: 1, x: 0, y: 0, duration: 0.6, ease: "power2.out", filter: "grayscale(100%)", opacity: 0.7 });
      });
  });

  document.querySelectorAll('.tilt-card').forEach(card => {
      const inner = card.querySelector('.tilt-inner');
      if (!inner) return;

      card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(inner, { rotateX: -y * 10, rotateY: x * 10, duration: 0.35, ease: "power1.out" });
      });
      card.addEventListener('mouseleave', () => {
          gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
      });
  });
}

// 9. Impact Counters
document.querySelectorAll('.impact-counter').forEach(counter => {
  let target = parseInt(counter.getAttribute('data-target'), 10);
  let obj = { val: 0 };
  gsap.to(obj, {
      val: target, duration: 2.2, ease: "power4.out",
      scrollTrigger: { trigger: counter.closest('section'), start: "top 75%" },
      onUpdate: () => { counter.innerHTML = Math.floor(obj.val).toLocaleString('en-US'); }
  });
});
