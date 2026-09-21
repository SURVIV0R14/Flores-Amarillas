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

    const audioEl = document.getElementById('main-audio');
    const currTrack = window.getCurrentTrack ? window.getCurrentTrack() : null;
    const isEdm = currTrack && currTrack.isEdm && audioEl && !audioEl.paused;
    let edmFlash = 0;
    if (isEdm) {
      const bPhase = (audioEl.currentTime % (60 / 128)) / (60 / 128);
      if (bPhase < 0.22) {
        edmFlash = (1 - bPhase / 0.22) * 0.45;
      }
    }

    stars.forEach(s => {
      const pulse = Math.sin(t * s.speed * 60 + s.phase);
      const a = Math.min(1, s.alpha * (0.6 + 0.4 * pulse) + edmFlash);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (1 + edmFlash * 0.8), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();

  function handleResize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars.forEach(s => { s.x = Math.random() * W; s.y = Math.random() * H; });
  }
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => setTimeout(handleResize, 100));
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

      // Evento para el mensaje final al terminar la canción — efecto typewriter
      audio.onended = () => {
        // Si hay una siguiente canción en la playlist, reproducirla automáticamente
        if (window.playlist && window.loadTrack && typeof window.getCurrentTrackIndex === 'function') {
          const idx = window.getCurrentTrackIndex();
          if (idx < window.playlist.length - 1) {
            window.loadTrack(idx + 1, true);
            return;
          }
        }

        const finalMsg   = document.getElementById('final-message');
        const lyricsDiv  = document.getElementById('lyrics');
        const tituloDiv  = document.querySelector('.titulo');
        const visualizer = document.getElementById('music-visualizer');
        const volCtrl    = document.getElementById('volume-control');

        // Fade out de elementos de música
        if (lyricsDiv)  { lyricsDiv.style.transition  = 'opacity 1s'; lyricsDiv.style.opacity  = '0'; }
        if (tituloDiv)  { tituloDiv.style.transition  = 'opacity 1s'; tituloDiv.style.opacity  = '0'; }
        if (visualizer) { visualizer.style.transition = 'opacity 1s'; visualizer.style.opacity = '0'; }
        if (volCtrl)    { volCtrl.style.transition    = 'opacity 1s'; volCtrl.style.opacity    = '0'; }

        if (!finalMsg) return;

        // Contenido a escribir
        const lines = [
          { selector: 'p:first-child', text: 'Este es un pequeño presente para ti, Karinita. Sé que no es mucho, pero es con bastante aprecio. 🌸' },
          { selector: '.signature',    text: 'Atte: Stevens ✨' }
        ];

        // Limpiar el HTML interno para escribirlo desde cero
        finalMsg.innerHTML = '<p></p><p class="signature"></p>';
        finalMsg.classList.remove('hidden-message');

        setTimeout(() => {
          finalMsg.classList.add('show-message');

          // Función typewriter para un elemento
          function typeInto(el, text, speed, onDone) {
            let i = 0;
            const cursor = document.createElement('span');
            cursor.className = 'tw-cursor';
            cursor.textContent = '|';
            el.appendChild(cursor);

            const interval = setInterval(() => {
              cursor.before(text[i]);
              i++;
              if (i >= text.length) {
                clearInterval(interval);
                // Quitar cursor al terminar
                setTimeout(() => { if (cursor.parentNode) cursor.remove(); }, 600);
                if (onDone) setTimeout(onDone, 800);
              }
            }, speed);
          }

          // Escribir primera línea, luego la firma
          const p1 = finalMsg.querySelector('p:first-child');
          const p2 = finalMsg.querySelector('.signature');
          typeInto(p1, lines[0].text, 45, () => {
            typeInto(p2, lines[1].text, 80, null);
          });
        }, 1500);
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
    // En iOS 13+ Safari se requiere solicitar permiso dentro de un gesto del usuario
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            window.dispatchEvent(new CustomEvent('gyro-granted'));
          }
        })
        .catch(() => {});
    }
    startEverything();
  });

  // Click en cualquier parte del overlay también funciona
  overlay.addEventListener('click', () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            window.dispatchEvent(new CustomEvent('gyro-granted'));
          }
        })
        .catch(() => {});
    }
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

    const currentTrack = window.getCurrentTrack ? window.getCurrentTrack() : null;
    const isEdm = currentTrack && currentTrack.isEdm;

    bars.forEach((bar, i) => {
      let height;
      if (isEdm) {
        if (!bar.classList.contains('viz-bar--rave')) {
          bar.classList.add('viz-bar--rave');
        }

        // Sincronización milimétrica para Reload (128 BPM = cada 0.46875s)
        const isDropSection = (t >= 74.53 && t < 114.53) || (t >= 179.53 && t < 220.53);
        const isBuildupSection = (t >= 59.53 && t < 74.53) || (t >= 164.53 && t < 179.53);
        const beatPhase = ((t - 74.53) % 0.46875) / 0.46875;
        const kickSnap = Math.max(0, 1 - beatPhase * 3.0); // Ataque seco de bombo

        if (isDropSection) {
          // Graves a la izquierda rebotan contundentes con el bombo
          if (i < 10) {
            height = 25 + kickSnap * 70 + Math.random() * 8;
          } else if (i < 22) {
            // Medios vibran con los acordes de sintetizador
            height = 20 + Math.sin(t * 8 + i * 0.4) * 25 + kickSnap * 45;
          } else {
            // Agudos centellean con los hi-hats
            height = 15 + Math.sin(t * 16 + i * 0.7) * 20 + kickSnap * 55;
          }
        } else if (isBuildupSection) {
          const progress = (t >= 59.53 && t < 74.53) ? (t - 59.53) / 15 : (t - 164.53) / 15;
          height = 15 + progress * 60 + Math.sin(t * (10 + progress * 20) + i * 0.5) * 25;
        } else if (t >= 22.5) {
          // Arpegio "tin tin tin": ondas dinámicas melódicas
          height = 12 + Math.sin(t * 8.5 + i * 0.5) * 25 + Math.sin(t * 17 + i * 0.8) * 15;
        } else {
          height = 6 + Math.sin(t * 2 + i * 0.3) * 10;
        }
      } else {
        if (bar.classList.contains('viz-bar--rave')) {
          bar.classList.remove('viz-bar--rave');
        }

        const bpm = (currentTrack && currentTrack.bpm) ? currentTrack.bpm : 102;
        const bps = bpm / 60;
        const beatPulse = Math.pow(Math.abs(Math.sin(t * Math.PI * bps)), 2) * 25;
        
        const flowersContainer = document.querySelector('.flowers');
        if (flowersContainer) {
          const glow = 1 + (beatPulse / 150);
          flowersContainer.style.filter = `brightness(${glow}) drop-shadow(0 0 ${beatPulse/2}px rgba(249,199,79,0.4))`;
        }
        
        const wave1 = Math.sin(t * 3 + i * 0.4) * 20 + 30;
        const wave2 = Math.sin(t * 1.7 + i * 0.6) * 15;
        const wave3 = Math.sin(t * 5 + i * 0.2) * 10;
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

    // Siguiente estrella fugaz entre 8 y 25 segundos (espaciadas para ser especiales)
    setTimeout(spawnShootingStar, 8000 + Math.random() * 17000);
  }
  
  // Iniciar primera estrella fugaz en 5 segundos
  setTimeout(spawnShootingStar, 5000);
})();

// ============================================
// SUITE FIESTA ELECTRÓNICA DE FESTIVAL (TOMORROWLAND / ULTRA)
// ============================================
(function initFireflies() {
  const canvas = document.getElementById('fireflies-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const fireflies = [];
  const count = 650; // Densidad ideal distribuida por toda la pantalla a 60 FPS fijos
  const shockwaves = [];
  const beatSparks = [];
  const fireworks = [];
  const confettiList = [];
  let mouse = { x: -1000, y: -1000 };

  const audio = document.getElementById('main-audio');
  const auroraEl = document.getElementById('aurora-container');

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (spotCanvas) {
      spotCanvas.width = window.innerWidth;
      spotCanvas.height = window.innerHeight;
    }
    fireflies.forEach(f => {
      f.homeX = Math.random() * canvas.width;
      f.homeY = Math.random() * canvas.height;
    });
  }
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => setTimeout(handleResize, 100));

  // Paleta neón de Festival (Rave Edition)
  const edmColors = [
    { r: 0,   g: 240, b: 255, name: 'cyan' },     // Cian láser
    { r: 255, g: 0,   b: 140, name: 'magenta' },  // Magenta eléctrico
    { r: 168, g: 85,  b: 247, name: 'purple' },   // Violeta rave
    { r: 255, g: 230, b: 0,   name: 'yellow' },   // Oro neón
    { r: 57,  g: 255, b: 20,  name: 'green' },    // Verde radioactivo
    { r: 255, g: 255, b: 255, name: 'white' }     // Blanco diamante
  ];

  const spotCanvas = document.getElementById('spotlights-canvas');
  const spotCtx = spotCanvas ? spotCanvas.getContext('2d') : null;
  if (spotCanvas) {
    spotCanvas.width = window.innerWidth;
    spotCanvas.height = window.innerHeight;
  }

  // 1. REFLECTORES DE FESTIVAL (Spotlights que barren el cielo POR DETRÁS de las flores y del texto)
  class LaserBeam {
    constructor(index, total) {
      this.index = index;
      this.total = total;
      this.baseAngle = -Math.PI / 2 + (index - (total - 1) / 2) * 0.26;
      this.color = index % 2 === 0 ? '0, 240, 255' : '255, 0, 140';
      this.phase = index * 1.25;
    }
    draw(sCtx, width, height, isDrop, energy, t) {
      if (!sCtx || energy < 0.1) return;
      // Origen en la base del suelo, oculto 100% por detrás de la tarjeta y las flores
      const originX = width / 2;
      const originY = height * 0.94;
      const sweepSpeed = isDrop ? 3.8 : 1.3;
      const sweepAmount = isDrop ? 0.38 : 0.20;
      const currentAngle = this.baseAngle + Math.sin(t * sweepSpeed + this.phase) * sweepAmount;

      // El haz se proyecta hacia arriba atravesando todo el cielo
      const length = Math.max(width, height) * 1.6;
      const targetX = originX + Math.cos(currentAngle) * length;
      const targetY = originY + Math.sin(currentAngle) * length;

      // Cono de haz de reflector de festival
      const perpAngle = currentAngle + Math.PI / 2;
      const beamEndWidth = isDrop ? 48 : 32;
      const leftX = targetX + Math.cos(perpAngle) * beamEndWidth;
      const leftY = targetY + Math.sin(perpAngle) * beamEndWidth;
      const rightX = targetX - Math.cos(perpAngle) * beamEndWidth;
      const rightY = targetY - Math.sin(perpAngle) * beamEndWidth;

      const alpha = (isDrop ? 0.42 : 0.22) * energy;

      // Gradiente suave que se difumina hacia arriba en el cielo nocturno
      const grad = sCtx.createLinearGradient(originX, originY, targetX, targetY);
      grad.addColorStop(0, `rgba(${this.color}, ${alpha * 0.7})`);
      grad.addColorStop(0.35, `rgba(${this.color}, ${alpha * 0.45})`);
      grad.addColorStop(1, `rgba(${this.color}, 0)`);

      sCtx.beginPath();
      sCtx.moveTo(originX, originY);
      sCtx.lineTo(leftX, leftY);
      sCtx.lineTo(rightX, rightY);
      sCtx.closePath();
      sCtx.fillStyle = grad;
      sCtx.fill();

      // Centro fino y luminoso del reflector
      sCtx.beginPath();
      sCtx.moveTo(originX, originY);
      sCtx.lineTo(targetX, targetY);
      sCtx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.55})`;
      sCtx.lineWidth = 1.6;
      sCtx.stroke();
    }
  }

  const laserBeams = [];
  const laserCount = 6;
  for (let l = 0; l < laserCount; l++) {
    laserBeams.push(new LaserBeam(l, laserCount));
  }

  // 2. PIROTECNIA DE ESCENARIO EN EL DROP (Fireworks)
  function launchDropFireworks(width, height) {
    const burstPositions = [
      { x: width * 0.22, y: height * 0.28 },
      { x: width * 0.50, y: height * 0.20 },
      { x: width * 0.78, y: height * 0.28 }
    ];

    burstPositions.forEach(pos => {
      const pCount = 26;
      for (let p = 0; p < pCount; p++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 4;
        const c = edmColors[Math.floor(Math.random() * edmColors.length)];
        fireworks.push({
          x: pos.x,
          y: pos.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: Math.random() * 3 + 2,
          color: `rgba(${c.r}, ${c.g}, ${c.b}, `,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.018
        });
      }
    });
  }

  // 2.1 CAÑÓN DE CONFETI NEÓN EN EL DROP (Tomorrowland CO2 Confetti Blast)
  function launchConfettiBlast(width, height) {
    const confCount = 80;
    const colors = ['#00f0ff', '#ff008c', '#ffee00', '#a855f7', '#39ff14', '#ffffff'];
    for (let i = 0; i < confCount; i++) {
      const fromLeft = i % 2 === 0;
      const startX = fromLeft ? Math.random() * (width * 0.22) : width - Math.random() * (width * 0.22);
      const startY = height * 0.90;
      const angle = fromLeft
        ? -Math.PI * 0.45 + (Math.random() - 0.2) * 0.7
        : -Math.PI * 0.55 - (Math.random() - 0.2) * 0.7;
      const speed = Math.random() * 15 + 9;
      confettiList.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        width: Math.random() * 8 + 5,
        height: Math.random() * 14 + 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.22,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.12 + 0.06,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.003 + 0.002 // Flotan durante 8-10 segundos
      });
    }
  }

  // 3. CLASE LUCIÉRNAGA / PARTÍCULA RAVE
  class Firefly {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.homeX = this.x;
      this.homeY = this.y;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.size = Math.random() * 2.2 + 1.2;
      this.baseAlpha = Math.random() * 0.5 + 0.35;
      this.blinkPhase = Math.random() * Math.PI * 2;
      this.blinkSpeed = Math.random() * 0.05 + 0.02;
      this.flash = 0;
      this.tinJump = 0; // Para el rebote saltarín del "tin tin tin"
      this.colorIndex = Math.floor(Math.random() * edmColors.length);
    }
    update(isEdmActive, section, energy, isSuspense) {
      // Tensión previa al Drop: las partículas se congelan en el aire
      if (isSuspense) {
        this.vx *= 0.5;
        this.vy *= 0.5;
        this.x += this.vx;
        this.y += this.vy;
        this.flash *= 0.8;
        return;
      }

      this.x += this.vx;
      this.y += this.vy;

      if (isEdmActive) {
        // Resorte elástico hacia su propia coordenada en toda la pantalla
        const dxHome = this.homeX - this.x;
        const dyHome = this.homeY - this.y;
        
        const spring = section === 'drop' ? 0.038 : (section === 'breakdown' ? 0.012 : 0.022);
        this.vx += dxHome * spring;
        this.vy += dyHome * spring;

        // Fricción adaptativa
        this.vx *= 0.915;
        this.vy *= 0.915;

        // En el build-up: vibración acelerada con la energía
        if (section === 'buildup') {
          this.vx += (Math.random() - 0.5) * (energy * 3.8);
          this.vy += (Math.random() - 0.5) * (energy * 3.8);
        } else if (section === 'breakdown') {
          // Post-drop: partículas se asientan como brasas enfriándose
          this.vx *= 0.97;
          this.vy *= 0.97;
        }

        // Deriva suave
        this.homeX += (Math.random() - 0.5) * 0.5;
        this.homeY += (Math.random() - 0.5) * 0.5;
        if (this.homeX < 20) this.homeX = 20;
        else if (this.homeX > canvas.width - 20) this.homeX = canvas.width - 20;
        if (this.homeY < 20) this.homeY = 20;
        else if (this.homeY > canvas.height - 20) this.homeY = canvas.height - 20;
      } else {
        // Balada suave
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        this.vx *= 0.985;
        this.vy *= 0.985;
        if (Math.abs(this.vx) < 0.15) this.vx += (Math.random() - 0.5) * 0.1;
        if (Math.abs(this.vy) < 0.15) this.vy += (Math.random() - 0.5) * 0.1;
      }

      // Repulsión con el mouse
      const dxMouse = this.x - mouse.x;
      const dyMouse = this.y - mouse.y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
      if (distMouse < 140) {
        const force = (140 - distMouse) / 140;
        this.vx += (dxMouse / distMouse) * force * 0.7;
        this.vy += (dyMouse / distMouse) * force * 0.7;
      }

      if (this.flash > 0) this.flash *= 0.88;
      if (this.tinJump > 0) this.tinJump *= 0.82;

      this.blinkPhase += this.blinkSpeed * (section === 'drop' ? 2.5 : 1);
    }
    draw(isEdmActive, section, energy) {
      const alpha = Math.min(1, this.baseAlpha + Math.sin(this.blinkPhase) * 0.3 + this.flash * 0.7);
      const currentSize = (this.size + this.tinJump * 1.4) * (1 + this.flash * (section === 'drop' ? 1.6 : 0.8));

      // Si suena electro: paleta neón brillante para TODAS las partículas
      const c = isEdmActive 
        ? edmColors[this.colorIndex] 
        : { r: 249, g: 219, b: 79 };

      // Halo neón translúcido
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentSize * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha * 0.38})`;
      ctx.fill();

      // Núcleo brillante
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
      if (this.flash > 0.35) {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
      }
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) {
    fireflies.push(new Firefly());
  }

  let lastBeatIndex = -1;
  let lastTinIndex = -1;
  let flowerBounce = 0;
  let currentEnergy = 0;
  let strobeAlpha = 0;
  let dropFired = false;
  let lastConfettiBurst = -1;

  // 4. BOMBO 4X4 (PUM PUM PAM PAM)
  function triggerKick(section, isDrop) {
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.62;

    // Shockwave masiva
    shockwaves.push({
      x: cx,
      y: cy,
      radius: 20,
      maxRadius: Math.max(canvas.width, canvas.height) * 0.95,
      alpha: isDrop ? 0.92 : 0.45,
      speed: isDrop ? 28 : 16,
      width: isDrop ? 4 : 2,
      color: isDrop ? (Math.random() > 0.5 ? '0, 240, 255' : '255, 0, 140') : '249, 199, 79'
    });

    // Chispas del corazón de las flores
    const sparkCount = isDrop ? 18 : 6;
    for (let s = 0; s < sparkCount; s++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 2.2;
      const speed = Math.random() * (isDrop ? 14 : 7) + 4;
      beatSparks.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.04 + 0.02,
        color: isDrop ? (Math.random() > 0.5 ? '#00f0ff' : '#ff008c') : '#ffe082'
      });
    }

    // EXPLOSIÓN MULTIDIRECCIONAL EN TODA LA PANTALLA
    const kickForce = isDrop ? 13.5 : 6.0;
    fireflies.forEach(f => {
      const angle = Math.random() * Math.PI * 2;
      const force = (Math.random() * 0.6 + 0.5) * kickForce;
      f.vx += Math.cos(angle) * force;
      f.vy += Math.sin(angle) * force;
      f.flash = 1.0;
      if (isDrop) {
        f.colorIndex = Math.floor(Math.random() * edmColors.length);
      }
    });

    // Flash estroboscópico de festival
    if (isDrop) {
      strobeAlpha = 0.16;
    }

    // Rebote de subwoofer en flores
    flowerBounce = isDrop ? 1.0 : 0.5;
  }

  // 5. MOVIMIENTO SALTÍ PUM AL SON DEL "TIN TIN TIN TIN"
  function triggerTin() {
    // Al ritmo de cada nota aguda del arpegio (tin-tin-tin-tin):
    // Las partículas dan un saltito ágil y destellan como notas de sinte
    fireflies.forEach(f => {
      // 35% de las partículas responden a cada nota para un efecto de olas de notas
      if (Math.random() < 0.4) {
        f.vy -= (Math.random() * 2.8 + 1.2); // Salto hacia arriba
        f.vx += (Math.random() - 0.5) * 2.0;
        f.tinJump = 1.0;
        f.flash = Math.max(f.flash, 0.45);
      }
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const track = window.getCurrentTrack ? window.getCurrentTrack() : null;
    const isEdmActive = track && track.isEdm && audio && !audio.paused;

    let section = 'ambient';
    let targetEnergy = 0;
    let isDrop = false;
    let isSuspense = false;

    // Activar o desactivar la clase aurora-rave según el modo EDM
    if (auroraEl) {
      if (isEdmActive && !auroraEl.classList.contains('aurora-rave')) {
        auroraEl.classList.add('aurora-rave');
      } else if (!isEdmActive && auroraEl.classList.contains('aurora-rave')) {
        auroraEl.classList.remove('aurora-rave');
      }
    }

    if (isEdmActive) {
      const t = audio.currentTime;

      // ===== MAPA TEMPORAL PRECISO DE "RELOAD" (128 BPM) =====
      // Beat = 0.46875s | Compás (4 beats) = 1.875s | 8 compases = 15s
      const isDrop1     = t >= 74.3  && t < 114.5;
      const isDrop2     = t >= 179.0 && t < 220.0;
      const isBuild1    = t >= 59.5  && t < 74.3;
      const isBuild2    = t >= 158.0 && t < 179.0;
      const isBreakdown = t >= 114.5 && t < 130.0;
      const isVerse2    = t >= 130.0 && t < 158.0;
      const isGroove    = t >= 44.5  && t < 59.5;
      const isVerse1    = t >= 22.5  && t < 44.5;

      if (isDrop1 || isDrop2) {
        section = 'drop';
        isDrop = true;
        // Impacto máximo al inicio del drop, pulso sostenido después
        const dropStart = isDrop1 ? 74.3 : 179.0;
        const dropProgress = t - dropStart;
        targetEnergy = dropProgress < 1.5 ? 1.0 : 0.92 + Math.sin(dropProgress * 2) * 0.08;

        // Pirotecnia + confeti al inicio exacto de cada drop
        if (!dropFired) {
          dropFired = true;
          launchDropFireworks(canvas.width, canvas.height);
          launchConfettiBlast(canvas.width, canvas.height);
        }
      } else if (isBuild1 || isBuild2) {
        section = 'buildup';
        dropFired = false;
        const buildStart = isBuild1 ? 59.5 : 158.0;
        const buildDuration = isBuild1 ? 14.8 : 21.0;
        const buildProgress = Math.min(1, (t - buildStart) / buildDuration);
        // Curva exponencial: crece despacio y se dispara al final
        targetEnergy = 0.25 + Math.pow(buildProgress, 1.8) * 0.75;

        // Micro-suspensión previa al drop (~0.8s de tensión pura)
        if ((t >= 73.5 && t < 74.3) || (t >= 178.2 && t < 179.0)) {
          isSuspense = true;
          targetEnergy = 0.05; // Congelamiento casi total
        }
      } else if (isBreakdown) {
        // Post-drop 1: energía desciende como brasas enfriándose
        section = 'breakdown';
        dropFired = false;
        const breakProgress = (t - 114.5) / 15.5;
        targetEnergy = 0.68 - breakProgress * 0.43; // 0.68 → 0.25
      } else if (isVerse2) {
        // Arpeggio regresa con más presencia (ya vivimos el primer drop)
        section = 'verse2';
        dropFired = false;
        targetEnergy = 0.32 + Math.sin((t - 130.0) * 0.4) * 0.08;
      } else if (isGroove) {
        section = 'groove';
        targetEnergy = 0.45;
        dropFired = false;
      } else if (isVerse1) {
        section = 'verse';
        targetEnergy = 0.25;
        dropFired = false;
      } else if (t < 22.5) {
        section = 'ambient';
        targetEnergy = 0.08;
        dropFired = false;
      } else {
        // Outro (t >= 220)
        section = 'ambient';
        targetEnergy = 0.12;
        dropFired = false;
      }

      // Interpolación suave — más rápida en drops para impacto inmediato
      const lerpSpeed = isDrop ? 0.15 : (section === 'buildup' ? 0.06 : 0.08);
      currentEnergy += (targetEnergy - currentEnergy) * lerpSpeed;

      // 2. DETECCIÓN DEL "TIN TIN TIN TIN" (Arpegio a corcheas: cada 0.234s)
      const tinInterval = (60 / 128) / 2; // 0.234375s
      if (t >= 22.5 && !isSuspense) {
        const currentTin = Math.floor((t - 22.5) / tinInterval);
        if (currentTin !== lastTinIndex) {
          lastTinIndex = currentTin;
          // El arpegio suena en ambos versos, groove y buildup
          if (section === 'verse' || section === 'verse2' || section === 'groove' || section === 'buildup') {
            triggerTin();
          }
        }
      }

      // 3. DETECCIÓN DEL BOMBO 4X4 (PUM PUM a 128 BPM = cada 0.46875s)
      const beatInterval = 60 / 128;
      if (t >= 44.5 && !isSuspense) {
        // Referencia de beat alineada al inicio de cada sección clave
        let refTime;
        if (t >= 179.0) refTime = t - 179.0;
        else if (t >= 74.3) refTime = t - 74.3;
        else refTime = t - 44.5;
        const currentBeat = Math.floor(refTime / beatInterval);

        if (currentBeat !== lastBeatIndex) {
          lastBeatIndex = currentBeat;
          if (section === 'drop' || section === 'groove') {
            triggerKick(section, isDrop);
          }
          // Ráfaga de confeti cada 32 beats (~15s) durante los drops
          if (isDrop && currentBeat > 0 && currentBeat % 32 === 0 && currentBeat !== lastConfettiBurst) {
            lastConfettiBurst = currentBeat;
            launchConfettiBlast(canvas.width, canvas.height);
          }
        }
      }
    } else {
      currentEnergy += (0 - currentEnergy) * 0.05;
      dropFired = false;
    }

    // Dibujar REFLECTORES DE FESTIVAL en su canvas de fondo (POR DETRÁS de las flores y del texto)
    if (spotCtx && spotCanvas) {
      spotCtx.clearRect(0, 0, spotCanvas.width, spotCanvas.height);
      if (isEdmActive && currentEnergy > 0.1) {
        spotCtx.globalCompositeOperation = 'lighter';
        const audioTime = audio ? audio.currentTime : 0;
        laserBeams.forEach(lb => {
          lb.draw(spotCtx, spotCanvas.width, spotCanvas.height, isDrop, currentEnergy, audioTime);
        });
      }
    }

    // Modo aditivo GPU para partículas frontales: brillo neón ultra nítido a 60 FPS
    ctx.globalCompositeOperation = 'lighter';

    // 1. Dibujar y expandir shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha *= 0.93;

      if (sw.alpha < 0.02 || sw.radius > sw.maxRadius) {
        shockwaves.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha})`;
      ctx.lineWidth = sw.width;
      ctx.stroke();
    }

    // 3. Dibujar chispas de bombo
    for (let i = beatSparks.length - 1; i >= 0; i--) {
      const sp = beatSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 0.25;
      sp.alpha -= sp.decay;

      if (sp.alpha <= 0) {
        beatSparks.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = Math.max(0, sp.alpha);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 4. Dibujar PIROTECNIA DE ESCENARIO
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const fw = fireworks[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += 0.18; // Gravedad pirotécnica
      fw.vx *= 0.96;
      fw.alpha -= fw.decay;

      if (fw.alpha <= 0) {
        fireworks.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2);
      ctx.fillStyle = fw.color + Math.max(0, fw.alpha) + ')';
      ctx.fill();
    }

    // 4.5 Renderizar CONFETI DE FESTIVAL (papelitos neón volando)
    for (let i = confettiList.length - 1; i >= 0; i--) {
      const cf = confettiList[i];
      cf.x += cf.vx;
      cf.y += cf.vy;
      cf.vy += 0.12;                          // Gravedad suave
      cf.vx *= 0.993;                         // Resistencia del aire
      cf.vx += Math.sin(cf.wobble) * 0.35;    // Vaivén de papelito al viento
      cf.wobble += cf.wobbleSpeed;
      cf.rotation += cf.rotationSpeed;
      cf.alpha -= cf.decay;

      if (cf.alpha <= 0 || cf.y > canvas.height + 20) {
        confettiList.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(cf.x, cf.y);
      ctx.rotate(cf.rotation);
      ctx.globalAlpha = Math.max(0, cf.alpha);
      ctx.fillStyle = cf.color;
      // Efecto 3D: el ancho varía con la rotación para simular giro de papel
      const scaleX = Math.abs(Math.cos(cf.rotation * 2.5));
      ctx.fillRect(-cf.width * scaleX / 2, -cf.height / 2, cf.width * scaleX, cf.height);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // 5. Actualizar y renderizar las 650 partículas en TODA la pantalla
    fireflies.forEach(f => {
      f.update(isEdmActive, section, currentEnergy, isSuspense);
      f.draw(isEdmActive, section, currentEnergy);
    });

    // 6. Flash Estroboscópico Suave de Festival
    if (strobeAlpha > 0.01) {
      ctx.fillStyle = `rgba(255, 255, 255, ${strobeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      strobeAlpha *= 0.72; // Decaimiento en 2 frames
    }

    ctx.globalCompositeOperation = 'source-over';

    // 7. Rebote subwoofer de las flores con suavizado
    const flowersEl = document.querySelector('.flowers');
    if (flowersEl) {
      if (flowerBounce > 0.01) {
        const baseScale = window.innerWidth <= 360 ? 0.95 : (window.innerWidth <= 680 ? 1.12 : 0.9);
        const bounceScale = 1 + flowerBounce * (isDrop ? 0.075 : 0.035);
        flowersEl.style.transform = `scale(${baseScale * bounceScale})`;
        const glowColor = isDrop ? 'rgba(0, 240, 255, 0.75)' : 'rgba(249, 199, 79, 0.55)';
        flowersEl.style.filter = `drop-shadow(0 0 ${flowerBounce * 32}px ${glowColor})`;
        flowerBounce *= 0.88;
      } else {
        flowerBounce = 0;
      }
    }

    requestAnimationFrame(animate);
  }
  
  animate();
})();

// -- Efecto parallax: mouse en desktop, giroscopio en mobile --
(function mouseMoveGlow() {
  const flowers = document.querySelector('.flowers');
  if (!flowers) return;

  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      flowers.style.transform = `scale(0.9) rotateX(${-y}deg) rotateY(${x}deg)`;
    });
  } else {
    // Mobile: Gyroscope parallax para iOS & Android
    let gyroAttached = false;
    function attachGyro() {
      if (gyroAttached) return;
      gyroAttached = true;
      window.addEventListener('deviceorientation', (e) => {
        const tiltX = Math.max(-15, Math.min(15, (e.beta || 0) - 45)) / 15 * 6;
        const tiltY = Math.max(-15, Math.min(15, e.gamma || 0)) / 15 * 8;
        const scale = window.innerWidth <= 360 ? 0.95 : (window.innerWidth <= 680 ? 1.12 : 0.9);
        flowers.style.transform = `scale(${scale}) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
      }, true);
    }

    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
        // Android / Navegadores sin permiso estricto
        attachGyro();
      } else {
        // iOS 13+ cuando el usuario presiona play
        window.addEventListener('gyro-granted', attachGyro);
      }
    }

    // Touchmove suave para inclinar las flores al deslizar el dedo en pantalla
    document.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0];
        const x = (t.clientX / window.innerWidth - 0.5) * 10;
        const y = (t.clientY / window.innerHeight - 0.5) * 6;
        const scale = window.innerWidth <= 360 ? 0.95 : (window.innerWidth <= 680 ? 1.12 : 0.9);
        flowers.style.transform = `scale(${scale}) rotateX(${-y}deg) rotateY(${x}deg)`;
      }
    }, { passive: true });
  }
})();


// ===========================
// CONTROL DE VOLUMEN
// ===========================
(function initVolumeControl() {
  const audio    = document.getElementById('main-audio');
  const slider   = document.getElementById('volume-slider');
  const fill     = document.getElementById('vol-fill');
  const btnDown  = document.getElementById('vol-down');
  const btnUp    = document.getElementById('vol-up');

  if (!audio || !slider || !fill || !btnDown || !btnUp) return;

  // Volumen inicial: 50% para que no sea tan fuerte al arrancar
  audio.volume = 0.5;
  slider.value = 0.5;

  function updateFill(val) {
    // val va de 0 a 1; mapeamos al ancho del slider-wrap (100px o 72px)
    fill.style.width = (val * 100) + '%';
  }

  // Inicializar barra de relleno
  updateFill(slider.value);

  // Al mover el slider
  slider.addEventListener('input', () => {
    const vol = parseFloat(slider.value);
    audio.volume = vol;
    updateFill(vol);
  });

  // Botón bajar (-10%)
  btnDown.addEventListener('click', () => {
    const vol = Math.max(0, parseFloat(slider.value) - 0.1);
    audio.volume = vol;
    slider.value = vol;
    updateFill(vol);
  });

  // Botón subir (+10%)
  btnUp.addEventListener('click', () => {
    const vol = Math.min(1, parseFloat(slider.value) + 0.1);
    audio.volume = vol;
    slider.value = vol;
    updateFill(vol);
  });
})();

// ===========================
// TOUCH SPARKLES ✨ (mobile)
// ===========================
(function initTouchSparkles() {
  const container = document.getElementById('touch-sparkles');
  if (!container) return;

  // Colores del proyecto
  const colors = [
    'rgba(249,199,79,1)',   // dorado
    'rgba(255,235,120,1)',  // dorado claro
    'rgba(57,198,214,1)',   // teal
    'rgba(255,107,157,1)',  // rosa
    'rgba(255,255,255,0.9)' // blanco
  ];

  function spawnSparkles(x, y) {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'sparkle-particle';

      const size   = 4 + Math.random() * 8;
      const angle  = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.8;
      const dist   = 30 + Math.random() * 70;
      const dx     = Math.cos(angle) * dist;
      const dy     = Math.sin(angle) * dist - 20; // sesgo hacia arriba
      const color  = colors[Math.floor(Math.random() * colors.length)];
      const delay  = Math.random() * 0.12;
      const dur    = 0.8 + Math.random() * 0.5;

      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        background: ${color};
        box-shadow: 0 0 ${size * 2}px ${color};
        --dx: ${dx}px;
        --dy: ${dy}px;
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
      `;

      container.appendChild(p);
      // Limpiar después de la animación
      setTimeout(() => { if (p.parentNode) p.remove(); }, (dur + delay + 0.1) * 1000);
    }
  }

  // Touch events
  document.addEventListener('touchstart', (e) => {
    Array.from(e.changedTouches).forEach(touch => {
      spawnSparkles(touch.clientX, touch.clientY);
    });
  }, { passive: true });

  // También en click para desktop (bonito efecto de prueba)
  document.addEventListener('click', (e) => {
    // Solo si no es en botones UI
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'button' || tag === 'input') return;
    spawnSparkles(e.clientX, e.clientY);
  });
})();

// ===========================
// LYRIC POP — animación al cambiar línea
// ===========================
(function initLyricPop() {
  const lyricsEl = document.getElementById('lyrics');
  if (!lyricsEl) return;

  // Observar cambios de texto con MutationObserver
  let lastText = '';
  const observer = new MutationObserver(() => {
    const newText = lyricsEl.textContent.trim();
    if (newText && newText !== lastText) {
      lastText = newText;
      // Reiniciar animación de pop
      lyricsEl.classList.remove('lyric-in');
      void lyricsEl.offsetWidth; // forzar reflow
      lyricsEl.classList.add('lyric-in');
    }
  });
  observer.observe(lyricsEl, { childList: true, subtree: true, characterData: true });
})();
