// ===========================
// PÁGINA DE INICIO - JS
// ===========================

// -- Estrellas de fondo --
(function createStars() {
  const container = document.getElementById('stars-bg');
  const count = 120;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 0.5;
    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      --duration: ${2 + Math.random() * 4}s;
      --delay: ${Math.random() * 5}s;
      opacity: ${Math.random() * 0.5 + 0.1};
    `;
    container.appendChild(star);
  }
})();

// -- Partículas en canvas --
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const PARTICLE_COUNT = 60;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 2.5 + 0.5;
      this.alpha = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.5 ? '249,199,79' : '57,198,214';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(249,199,79,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
})();

// -- Pétalos cayendo --
(function createPetals() {
  const container = document.getElementById('floating-petals');
  const petalEmojis = ['🌸', '🌼', '✿', '❀', '🌺', '💛', '🤍'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
    const duration = 8 + Math.random() * 12;
    const delay = Math.random() * 10;
    const drift = (Math.random() - 0.5) * 200;
    petal.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --drift: ${drift}px;
      font-size: ${14 + Math.random() * 18}px;
    `;
    container.appendChild(petal);
  }
})();

// -- Efecto Typewriter --
(function typewriterEffect() {
  const el = document.getElementById('typewriter-text');
  const messages = [
    'Para Karinita ✨',
    'Porque eres alguien increíble...',
    'Y muy importante para mí 💛',
  ];
  let msgIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseTimer = null;

  function type() {
    const current = messages[msgIndex];
    if (!isDeleting) {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        msgIndex = (msgIndex + 1) % messages.length;
      }
    }
    setTimeout(type, isDeleting ? 45 : 85);
  }

  setTimeout(type, 800);
})();

// -- Entrada de página animada --
(function pageEntrance() {
  const content = document.querySelector('.main-content');
  content.style.opacity = '0';
  content.style.transform = 'translateY(30px)';
  content.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
  setTimeout(() => {
    content.style.opacity = '1';
    content.style.transform = 'translateY(0)';
  }, 100);
})();

// -- Efecto hover en botón con sonido visual --
document.getElementById('btn-enter').addEventListener('mouseenter', function() {
  this.style.letterSpacing = '3px';
});
document.getElementById('btn-enter').addEventListener('mouseleave', function() {
  this.style.letterSpacing = '2px';
});
