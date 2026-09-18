// Lenis Smooth Scroll Setup
const lenis = new Lenis({ 
    duration: 1.2, 
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
});

function raf(time) { 
    lenis.raf(time); 
    requestAnimationFrame(raf); 
}
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0, 0);

// Drawer Toggle Logic
const drawer = document.getElementById('partner-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const toggleDrawer = (force) => {
    const isOpen = !drawer.classList.contains('translate-x-full');
    const shouldOpen = force !== undefined ? force : !isOpen;
    
    if (shouldOpen) {
        drawer.classList.remove('translate-x-full'); 
        drawerOverlay.classList.add('active'); 
        lenis.stop();
    } else {
        drawer.classList.add('translate-x-full'); 
        drawerOverlay.classList.remove('active'); 
        lenis.start();
    }
};

document.querySelectorAll('.open-drawer-trigger, #open-drawer-btn').forEach(b => 
    b.addEventListener('click', (e) => { e.preventDefault(); toggleDrawer(true); })
);
document.getElementById('close-drawer-btn').addEventListener('click', () => toggleDrawer(false));
drawerOverlay.addEventListener('click', () => toggleDrawer(false));

// Charity Impact Counter
document.querySelectorAll('.impact-counter').forEach(counter => {
    let obj = { val: 0 };
    gsap.to(obj, {
        val: parseInt(counter.getAttribute('data-target')), 
        duration: 2.5, 
        ease: "power4.out",
        scrollTrigger: { 
            trigger: counter.closest('section'), 
            start: "top 75%" 
        },
        onUpdate: () => { counter.innerHTML = Math.floor(obj.val).toLocaleString('en-US'); }
    });
});

// Vault Horizontal Scroll Pinning
const vaultContainer = document.querySelector('.vault-container');
if (vaultContainer) {
    gsap.to(vaultContainer, {
        x: () => -(vaultContainer.scrollWidth - window.innerWidth), 
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

// Custom Cursor Logic
const cursor = document.getElementById('custom-cursor');
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

if (!isTouchDevice && cursor) {
    const xTo = gsap.quickTo(cursor, "x", {duration: 0.15, ease: "power3"});
    const yTo = gsap.quickTo(cursor, "y", {duration: 0.15, ease: "power3"});
    
    window.addEventListener('mousemove', (e) => { 
        xTo(e.clientX); 
        yTo(e.clientY); 
    });

    document.querySelectorAll('.cursor-interact').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover-glow'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover-glow'));
    });
} else if (cursor) {
    cursor.style.display = 'none';
}

// --------------------------------------------------------
// THE FIX: Restored v2.0 Immersive 3D GSAP Physics
// --------------------------------------------------------
if (!isTouchDevice) {
    document.querySelectorAll('.tilt-card').forEach(card => {
        const inner = card.querySelector('.tilt-inner');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Increased multiplier to 15 for slightly more pronounced, immersive movement
            const rotateX = (((e.clientY - rect.top) - rect.height/2) / (rect.height/2)) * -15;
            const rotateY = (((e.clientX - rect.left) - rect.width/2) / (rect.width/2)) * 15;
            
            // GSAP handles the easing perfectly, removing CSS rubber-banding
            gsap.to(inner, { 
                rotateX: rotateX, 
                rotateY: rotateY, 
                scale: 1.05, 
                duration: 0.5, 
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            // Smoothly returns to origin state
            gsap.to(inner, { 
                rotateX: 0, 
                rotateY: 0, 
                scale: 1, 
                duration: 0.7, 
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    });
}

// Continuous Gallery Scrolling (GSAP)
const trackLeft = document.getElementById('track-left');
const trackRight = document.getElementById('track-right');

if (trackLeft) {
    gsap.to(trackLeft, {
        xPercent: -50,
        ease: "none",
        duration: 25,
        repeat: -1
    });
}
if (trackRight) {
    // Start offset so it loops cleanly in reverse
    gsap.set(trackRight, { xPercent: -50 });
    gsap.to(trackRight, {
        xPercent: 0,
        ease: "none",
        duration: 25,
        repeat: -1
    });
}
