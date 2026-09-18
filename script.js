// script.js
gsap.registerPlugin(ScrollTrigger);

// 1. Lenis Smooth Scroll Setup & GSAP Sync
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 2. Differential Magnetic Cursor
const cursor = document.getElementById('cursor');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function updateCursor() {
    // Interpolation for smooth trailing effect
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    
    // Scale up & shift color on interactive elements
    const hoveredEl = document.elementFromPoint(mouseX, mouseY);
    if (hoveredEl && (hoveredEl.closest('a') || hoveredEl.closest('.gallery-item'))) {
        cursor.style.width = '3.5rem';
        cursor.style.height = '3.5rem';
        cursor.style.backgroundColor = '#172554'; 
        cursor.style.mixBlendMode = 'normal';
    } else {
        cursor.style.width = '1rem';
        cursor.style.height = '1rem';
        cursor.style.backgroundColor = 'white';
        cursor.style.mixBlendMode = 'difference';
    }
    
    requestAnimationFrame(updateCursor);
}
updateCursor();

// 3. SVG Kinetic Self-Drawing
gsap.to('.svg-line', {
    strokeDashoffset: 0,
    duration: 2.5,
    ease: "power3.inOut",
    scrollTrigger: {
        trigger: ".svg-line",
        start: "top 85%",
    }
});

// 4. Horizontal Vault Pinning System
const vaultWrapper = document.getElementById('vault-wrapper');
const vaultTrack = document.getElementById('vault-track');

function initVault() {
    // Purge existing triggers for clean resize recalculation
    ScrollTrigger.getAll().forEach(t => {
        if(t.vars.id === "vaultScroll") t.kill();
    });

    // Dynamic travel distance
    const getScrollAmount = () => -(vaultTrack.scrollWidth - window.innerWidth);

    gsap.to(vaultTrack, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
            id: "vaultScroll",
            trigger: vaultWrapper,
            start: "top top",
            end: () => `+=${vaultTrack.scrollWidth}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
        }
    });
}

// 5. Infinite Marquee Auto-Duplicator
const marqueeTracks = document.querySelectorAll('.marquee-track');
marqueeTracks.forEach(track => {
    const items = Array.from(track.children);
    // Clone nodes once to bridge the loop
    items.forEach(item => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
    });
    // Clone nodes twice to safeguard ultra-wide monitors
    items.forEach(item => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
    });
});

// 6. Recalculation Resiliency (The Failsafe)
window.addEventListener('load', () => {
    initVault();
    ScrollTrigger.refresh();
});

const layoutObserver = new ResizeObserver(() => {
    initVault();
    ScrollTrigger.refresh();
});
layoutObserver.observe(document.body);
