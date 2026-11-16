// --- ELEMENTS ---
const openBtn = document.getElementById('openCardBtn');
const closeBtn = document.getElementById('closeCardBtn');
const modal = document.getElementById('ecardModal');
const canvas = document.getElementById('confetti-canvas');
const snowBox = document.getElementById('snow');
const ctx = canvas ? canvas.getContext('2d') : null;
const reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : true;

function makeSnow() {
  if (!snowBox || reduceMotion) return;
  for (let i = 0; i < 45; i++) {
    const flake = document.createElement('span');
    const size = Math.random() * 4 + 2;
    flake.className = 'snowflake';
    flake.style.left = Math.random() * 100 + '%';
    flake.style.width = flake.style.height = size + 'px';
    flake.style.opacity = (Math.random() * 0.5 + 0.4).toFixed(2);
    flake.style.animationDuration = (Math.random() * 8 + 8) + 's';
    flake.style.animationDelay = (-Math.random() * 12) + 's';
    snowBox.appendChild(flake);
  }
}

function initApp() {
  if (!openBtn || !closeBtn || !modal) return;

  makeSnow();
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');

  function openModal() {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus({ preventScroll: true });
    if (!reduceMotion && ctx) fireConfetti();
  }

  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    openBtn.focus({ preventScroll: true });
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });

  // --- CONFETTI (gold, red, green, white) ---
  let particles = [];
  let animationId = null;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function fireConfetti() {
    if (!ctx) return;
    if (animationId) cancelAnimationFrame(animationId);

    const colors = ['#fde68a', '#d4a94f', '#e0373f', '#2f7d4f', '#ffffff'];
    const w = window.innerWidth;
    const h = window.innerHeight;

    particles = Array.from({ length: 130 }, () => ({
      x: w / 2,
      y: h / 2 + 100,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 1) * 15,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() > 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life: 100 + Math.random() * 50
    }));

    animateConfetti();
  }

  function animateConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let active = 0;

    for (const p of particles) {
      if (p.life <= 0) continue;
      active++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.rotation += p.rotationSpeed;
      p.life -= 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 100));
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }

    if (active > 0) {
      animationId = requestAnimationFrame(animateConfetti);
    } else {
      animationId = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
