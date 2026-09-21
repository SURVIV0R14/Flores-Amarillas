// ===========================
// FLOWER PAGE EFFECTS
// ===========================

// -- Canvas de fondo (estrellas + nebulosa) --
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.8 + 0.3,
    alpha: Math.random() * 0.6 + 0.2,
    speed: Math.random() * 0.008 + 0.002,
    phase: Math.random() * Math.PI * 2
  }));

  const glows = Array.from({ length: 30 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 60 + 20,
    alpha: Math.random() * 0.05 + 0.01,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    color: Math.random() > 0.5 ? '249,199,79' : '57,198,214'
  }));

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    glows.forEach(g => {
      g.x += g.vx; g.y += g.vy;
      if (g.x < -g.r) g.x = W + g.r;
      if (g.x > W + g.r) g.x = -g.r;
      if (g.y < -g.r) g.y = H + g.r;
      if (g.y > H + g.r) g.y = -g.r;
      const gr = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
      gr.addColorStop(0, `rgba(${g.color},${g.alpha})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fill();
    });
    t += 0.02;
    stars.forEach(s => {
      const pulse = Math.sin(t * s.speed * 60 + s.phase);
      const a = s.alpha * (0.6 + 0.4 * pulse);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars.forEach(s => { s.x = Math.random() * W; s.y = Math.random() * H; });
  });
})();

// -- Mariposas CSS animadas --
(function createButterflies() {
  const container = document.getElementById('butterflies-container');
  if (!container) return;
  const count = 8;
  for (let i = 0; i < count; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'butterfly-wrapper';
    const butterfly = document.createElement('div');
    butterfly.className = 'butterfly';
    const wingL = document.createElement('div');
    wingL.className = 'wing wing-left';
    const wingR = document.createElement('div');
    wingR.className = 'wing wing-right';
    butterfly.appendChild(wingL);
    butterfly.appendChild(wingR);
    wrapper.appendChild(butterfly);
    const startX = 10 + Math.random() * 80;
    const startY = 10 + Math.random() * 70;
    const duration = 12 + Math.random() * 10;
    const delay = Math.random() * 8;
    const size = 0.4 + Math.random() * 0.6;
    const hue = Math.random() > 0.5 ? '45' : Math.random() > 0.5 ? '300' : '180';
    wrapper.style.cssText = `
      left: ${startX}%;
      top: ${startY}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      transform: scale(${size});
      --hue: ${hue}deg;
    `;
    container.appendChild(wrapper);
  }
})();

// -- Pétalos cayendo --
(function createFlowerPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;
  const emojis = ['🌸', '🌼', '🌺', '✿', '❀', '🤍', '💛'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'flower-petal';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const dur = 8 + Math.random() * 14;
    const delay = Math.random() * 12;
    const drift = (Math.random() - 0.5) * 250;
    const size = 12 + Math.random() * 20;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${dur}s;
      animation-delay: -${delay}s;
      --drift: ${drift}px;
      font-size: ${size}px;
    `;
    container.appendChild(p);
  }
})();

// ===================================================
// AUDIO + PLAY OVERLAY (FIX PARA AUTOPLAY BLOQUEADO)
// ===================================================
(function initAudioAndOverlay() {
  const audio = document.getElementById('main-audio');
  const overlay = document.getElementById('play-overlay');
  const playBtn = document.getElementById('play-btn');

  if (!audio || !overlay || !playBtn) return;

  // AudioContext para el visualizador
  let audioCtx = null;
  let analyser = null;
  let dataArray = null;
  let useRealData = false;

  function setupAudioContext() {
    // Para archivos locales (file://), la Web Audio API silencia el audio 
    // por restricciones de CORS. Desactivamos el visualizador real y 
    // usamos la simulación para que la música siempre se escuche.
    useRealData = false;
  }

  async function startEverything() {
    setupAudioContext();

    // Reanudar contexto si estaba suspendido
    if (audioCtx && audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // Ocultar overlay inmediatamente (incluso si la música falla)
    overlay.classList.add('hidden');
    setTimeout(() => { overlay.style.display = 'none'; }, 1100);

    // Iniciar la animación de crecimiento de las flores
    document.body.classList.remove('container');

    try {
      console.log('Intentando reproducir audio... src=', audio.src);
      try { audio.muted = false; } catch (e) {}
      try { audio.volume = 1; } catch (e) {}

      // Información diagnóstica
      console.log('readyState=', audio.readyState, 'paused=', audio.paused, 'duration=', audio.duration);

      // Evento para el mensaje final al terminar la canción
      audio.onended = () => {
        const finalMsg = document.getElementById('final-message');
        const lyricsDiv = document.getElementById('lyrics');
        const tituloDiv = document.querySelector('.titulo');
        const visualizer = document.getElementById('music-visualizer');
        
        if(lyricsDiv) lyricsDiv.style.opacity = '0';
        if(tituloDiv) tituloDiv.style.opacity = '0';
        if(visualizer) visualizer.style.opacity = '0';
        
        if(finalMsg) {
          finalMsg.classList.remove('hidden-message');
          setTimeout(() => finalMsg.classList.add('show-message'), 100);
        }
      };

      await audio.play();
      console.log('Reproducción iniciada');
    } catch (err) {
      console.warn('Error al reproducir audio (posible restricción CORS al abrir localmente):', err);
      if (audio && audio.error) {
        console.error('Audio element error:', audio.error);
      }
    }
  }

  // Click en el botón de play
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startEverything();
  });

  // Click en cualquier parte del overlay también funciona
  overlay.addEventListener('click', () => {
    startEverything();
  });

  // Exponer analyser para el visualizador
  window._audioAnalyser = {
    get analyser() { return analyser; },
    get dataArray() { return dataArray; },
    get useRealData() { return useRealData; }
  };
})();

// -- Visualizador de música --
(function initVisualizer() {
  const barsContainer = document.getElementById('visualizer-bars');
  if (!barsContainer) return;

  const BAR_COUNT = 32;
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement('div');
    bar.className = 'viz-bar';
    barsContainer.appendChild(bar);
    bars.push(bar);
  }

  // Obtener referencia al audio
  const audio = document.getElementById('main-audio');

  let phase = 0;
  function animateVisualizer() {
    const aa = window._audioAnalyser;
    
    // Si el audio está pausado o no ha empezado, aplanar las barras
    if (!audio || audio.paused || audio.currentTime === 0) {
      bars.forEach(bar => {
        bar.style.height = '4%';
      });
      requestAnimationFrame(animateVisualizer);
      return;
    }

    // Tiempo actual de la canción
    const t = audio.currentTime;

    bars.forEach((bar, i) => {
      let height;
      if (aa && aa.useRealData && aa.analyser && aa.dataArray) {
        aa.analyser.getByteFrequencyData(aa.dataArray);
        const dataIndex = Math.floor(i * aa.dataArray.length / BAR_COUNT);
        height = (aa.dataArray[dataIndex] / 255) * 100;
      } else {
        // Simulación sincronizada con la canción (Until I Found You - ~102 BPM)
        // 102 BPM = 1.7 beats por segundo
        const bps = 1.7;
        
        // Pulso principal basado en el tempo de la canción
        const beatPulse = Math.pow(Math.abs(Math.sin(t * Math.PI * bps)), 2) * 25;
        
        // Hacer que las flores latan con el ritmo musical
        const flowersContainer = document.querySelector('.flowers');
        if (flowersContainer) {
          const glow = 1 + (beatPulse / 150); // brillo sutil
          flowersContainer.style.filter = `brightness(${glow}) drop-shadow(0 0 ${beatPulse/2}px rgba(249,199,79,0.4))`;
        }
        
        // Movimiento de onda para dar variedad a cada barra
        const wave1 = Math.sin(t * 3 + i * 0.4) * 20 + 30;
        const wave2 = Math.sin(t * 1.7 + i * 0.6) * 15;
        const wave3 = Math.sin(t * 5 + i * 0.2) * 10;
        
        // Combinamos el pulso del ritmo con las ondas, añadiendo varianza por barra
        height = Math.max(4, wave1 + wave2 + wave3 + beatPulse * (i % 3 === 0 ? 1.5 : 0.8));
      }
      bar.style.height = `${Math.min(height, 100)}%`;
    });
    requestAnimationFrame(animateVisualizer);
  }
  animateVisualizer();
})();

// ===========================
// EFECTOS PREMIUM ADICIONALES
// ===========================

// -- Estrellas Fugaces --
(function initShootingStars() {
  const container = document.getElementById('shooting-stars');
  if (!container) return;

  function spawnShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.top = `${Math.random() * 50}%`;
    star.style.left = `${50 + Math.random() * 50}%`; // Empieza desde la derecha
    container.appendChild(star);

    setTimeout(() => {
      if (star.parentNode) star.parentNode.removeChild(star);
    }, 2000);

    // Siguiente estrella fugaz entre 10 y 25 segundos
    setTimeout(spawnShootingStar, 500 + Math.random() * 800);
  }
  
  // Iniciar primera estrella fugaz en 5 segundos
  setTimeout(spawnShootingStar, 1000);
})();

// -- Luciérnagas Interactivas --
(function initFireflies() {
  const canvas = document.getElementById('fireflies-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const fireflies = [];
  const count = 1000; // Aumentado para mayor interacción
  let mouse = { x: -1000, y: -1000 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  // Si el mouse sale, alejarlo para que no moleste a las luciérnagas
  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  class Firefly {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = (Math.random() - 0.5) * 1;
      this.size = Math.random() * 2 + 1;
      this.baseAlpha = Math.random() * 0.5 + 0.3;
      this.blinkPhase = Math.random() * Math.PI * 2;
      this.blinkSpeed = Math.random() * 0.05 + 0.02;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Rebote suave en los bordes
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      // Interacción con el mouse (se alejan)
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 150) {
        const force = (150 - dist) / 150;
        this.vx += (dx / dist) * force * 0.5;
        this.vy += (dy / dist) * force * 0.5;
      }

      // Fricción para que no vuelen tan rápido después de asustarse
      this.vx *= 0.98;
      this.vy *= 0.98;
      
      // Velocidad mínima de flote
      if(Math.abs(this.vx) < 0.2) this.vx += (Math.random() - 0.5) * 0.1;
      if(Math.abs(this.vy) < 0.2) this.vy += (Math.random() - 0.5) * 0.1;
      
      this.blinkPhase += this.blinkSpeed;
    }
    draw() {
      const alpha = this.baseAlpha + Math.sin(this.blinkPhase) * 0.3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(249, 219, 79, ${Math.max(0, alpha)})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(249, 219, 79, 0.8)';
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) {
    fireflies.push(new Firefly());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireflies.forEach(f => {
      f.update();
      f.draw();
    });
    requestAnimationFrame(animate);
  }
  
  animate();
})();

// -- Efecto parallax con el ratón --
(function mouseMoveGlow() {
  const flowers = document.querySelector('.flowers');
  if (!flowers) return;
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 15;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    flowers.style.transform = `scale(0.9) rotateX(${-y}deg) rotateY(${x}deg)`;
  });
})();
