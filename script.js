// 1. Initialize Lenis (Smooth Scroll)
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

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{
lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// 2. Custom Magnetic Cursor Logic (Disable on Touch Devices)
const cursor = document.getElementById('custom-cursor');
const interactables = document.querySelectorAll('.cursor-interact');
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

if (!isTouchDevice) {
  const xTo = gsap.quickTo(cursor, "x", {duration: 0.2, ease: "power3"});
  const yTo = gsap.quickTo(cursor, "y", {duration: 0.2, ease: "power3"});

  window.addEventListener('mousemove', (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
  });

  interactables.forEach(el => {
      el.addEventListener('mouseenter', () => {
          gsap.to(cursor, { scale: 2, duration: 0.3, ease: "power2.out" });
          cursor.classList.add('hover-glow'); 
      });
      el.addEventListener('mouseleave', () => {
          gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" });
          cursor.classList.remove('hover-glow');
      });
  });
} else {
  if(cursor) cursor.style.display = 'none';
}

// 3. Drawer Toggle Logic
const drawer = document.getElementById('partner-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const openBtns = document.querySelectorAll('.open-drawer-trigger, #open-drawer-btn');
const closeBtn = document.getElementById('close-drawer-btn');

const toggleDrawer = (force) => {
  const isOpen = drawer.classList.contains('translate-x-0');
  const shouldOpen = force !== undefined ? force : !isOpen;

  if (shouldOpen) {
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

// 4. Hero Animations & Parallax
gsap.from(".hero-title", { yPercent: 100, duration: 1.2, ease: "power4.out", stagger: 0.1, delay: 0.2 });
gsap.to(".hero-fade-in", { opacity: 1, duration: 1, delay: 1, ease: "power2.out" });
gsap.to(".parallax-img", { opacity: 1, y: -20, duration: 1.5, stagger: 0.2, ease: "power3.out", delay: 0.5 });

if (!isTouchDevice) {
  const heroSection = document.getElementById('hero');
  const pImages = document.querySelectorAll('.parallax-img');
  
  if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
          const x = (window.innerWidth / 2 - e.clientX) / 50;
          const y = (window.innerHeight / 2 - e.clientY) / 50;
          
          pImages.forEach((img, index) => {
              const depth = index + 1;
              gsap.to(img, { x: x * depth, y: y * depth, duration: 1, ease: "power1.out" });
          });
      });
  }
}

// 5. Scroll Velocity Marquee
const track = document.querySelector('.marquee-track');
if (track) {
  let marqueeTween = gsap.to(track, { xPercent: -50, ease: "none", duration: 20, repeat: -1 });

  ScrollTrigger.create({
      onUpdate: (self) => {
          let velocity = Math.abs(self.getVelocity()) / 150;
          let scale = 1 + velocity;
          scale = gsap.utils.clamp(1, 8, scale);
          gsap.to(marqueeTween, { timeScale: scale, duration: 0.2, overwrite: true });
          gsap.to(marqueeTween, { timeScale: 1, duration: 1, delay: 0.2, overwrite: "auto" });
      }
  });
}

// 6. Self-Drawing Pitch SVG
const paths = gsap.utils.toArray('.draw-path');
paths.forEach(path => {
  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  
  gsap.to(path, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: {
          trigger: ".mission-section", start: "top 70%", end: "bottom 30%", scrub: 1.5
      }
  });
});

gsap.from(".manifesto-text", {
  y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out",
  scrollTrigger: { trigger: ".mission-section", start: "top 70%" }
});

// Wait until images load before calculating layout for the Vault Pin
window.addEventListener('load', () => {
  // 7. Vault Horizontal Scroll Pin
  const vaultContainer = document.querySelector('.vault-container');
  if (vaultContainer) {
      const getScrollAmount = () => -(vaultContainer.scrollWidth - window.innerWidth);
      
      gsap.to(vaultContainer, {
          x: getScrollAmount,
          ease: "none",
          scrollTrigger: {
              trigger: ".vault-section",
              pin: true,
              scrub: 1,
              end: () => "+=" + (vaultContainer.scrollWidth - window.innerWidth),
              invalidateOnRefresh: true
          }
      });
  }
  ScrollTrigger.refresh();
});

// 8. 3D Tilt Card Logic (Desktop only)
if (!isTouchDevice) {
  const tiltCards = document.querySelectorAll('.tilt-card');
  
  tiltCards.forEach(card => {
      const inner = card.querySelector('.tilt-inner');
      
      card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -12;
          const rotateY = ((x - centerX) / centerX) * 12;
          
          gsap.to(inner, { rotateX: rotateX, rotateY: rotateY, duration: 0.5, ease: 'power2.out' });
      });
      
      card.addEventListener('mouseleave', () => {
          gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power3.out' });
      });
  });
}

// 9. Charity Impact Counter Animations
const counters = document.querySelectorAll('.impact-counter');
counters.forEach(counter => {
  let target = parseInt(counter.getAttribute('data-target'), 10);
  let obj = { val: 0 };
  
  gsap.to(obj, {
      val: target, duration: 2.5, ease: "power4.out",
      scrollTrigger: { trigger: counter.closest('section'), start: "top 75%" },
      onUpdate: () => { counter.innerHTML = Math.floor(obj.val).toLocaleString('en-US'); }
  });
});