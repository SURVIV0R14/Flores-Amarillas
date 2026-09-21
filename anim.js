// ============================================
// PLAYLIST CON LETRAS SINCRONIZADAS
// ============================================
var audio = document.querySelector("audio");
var lyrics = document.querySelector("#lyrics");
var songTitleEl = document.querySelector("#song-title");

var playlist = [
  {
    id: "until-i-found-you",
    title: "♫ Stephen Sanchez - Until I Found You",
    src: "sound/nueva-cancion.mp3",
    bpm: 102,
    lyrics: [
      { text: "Georgia, wrap me up in all your-", time: 10.44 },
      { text: "I want you in my arms", time: 16.81 },
      { text: "Oh, let me hold you", time: 22.05 },
      { text: "I'll never let you go again like I did", time: 27.48 },
      { text: "Oh, I used to say", time: 33.53 },
      { text: "I would never fall in love again until I found her", time: 36.97 },
      { text: "I said, I would never fall unless it's you I fall into", time: 44.05 },
      { text: "I was lost within the darkness, but then I found her", time: 51.19 },
      { text: "I found you", time: 58.02 },

      { text: "Heaven, when I held you again", time: 67.37 },
      { text: "How could we ever just be friends?", time: 74.38 },
      { text: "I would rather die than let you go", time: 81.45 },
      { text: "Juliet to your Romeo, how I heard you say", time: 86.96 },

      { text: "I would never fall in love again until I found her", time: 93.80 },
      { text: "I said, I would never fall unless it's you I fall into", time: 101.17 },
      { text: "I was lost within the darkness, but then I found her", time: 108.23 },
      { text: "I found you", time: 115.00 },

      { text: "I would never fall in love again until I found her", time: 136.67 },
      { text: "I said, I would never fall unless it's you I fall into", time: 144.05 },
      { text: "I was lost within the darkness, but then I found her", time: 150.93 },
      { text: "I found you", time: 157.61 }
    ]
  },
  {
    id: "reload",
    title: "♫ Sebastian Ingrosso, Tommy Trash - Reload",
    src: "sound/reload.mp3",
    bpm: 128,
    isEdm: true,
    lyrics: [] // Sin letras para Reload a pedido del usuario (modo visual EDM puro)
  }
];

var currentTrackIndex = 0;

// Exponer la canción actual globalmente
window.getCurrentTrack = function() {
  return playlist[currentTrackIndex];
};

// Cambiar de pista
function loadTrack(index, autoPlay) {
  if (index < 0) index = playlist.length - 1;
  if (index >= playlist.length) index = 0;
  currentTrackIndex = index;

  var track = playlist[currentTrackIndex];
  
  // Limpiar lyrics actuales
  if (lyrics) {
    lyrics.style.opacity = 0;
    lyrics.innerHTML = "";
    if (!track.lyrics || track.lyrics.length === 0) {
      lyrics.style.display = "none";
    } else {
      lyrics.style.display = "block";
    }
  }

  // Actualizar título
  if (songTitleEl) {
    songTitleEl.style.opacity = 0;
    setTimeout(function() {
      songTitleEl.innerText = track.title;
      songTitleEl.style.opacity = 1;
    }, 200);
  }

  // Cambiar fuente del audio
  if (audio) {
    var wasPlaying = !audio.paused;
    audio.src = track.src;
    audio.currentTime = 0;
    
    // Si ya comenzó la experiencia o si se pidió autoPlay
    var overlay = document.getElementById("play-overlay");
    var isStarted = overlay && (overlay.classList.contains("hidden") || overlay.style.display === "none");
    
    if (autoPlay || wasPlaying || isStarted) {
      var playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(function(err) {
          console.log("Reproducción automática evitada o en espera:", err);
        });
      }
    }
  }
}

window.loadTrack = loadTrack;
window.playlist = playlist;
window.getCurrentTrackIndex = function() { return currentTrackIndex; };

// Inicializar controles de canciones
document.addEventListener("DOMContentLoaded", function() {
  var prevBtn = document.getElementById("prev-track-btn");
  var nextBtn = document.getElementById("next-track-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      loadTrack(currentTrackIndex - 1, true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      loadTrack(currentTrackIndex + 1, true);
    });
  }
});

// Animar las letras en tiempo real sincronizadas con la canción actual
function updateLyrics() {
  if (!audio || !lyrics) return;
  var track = playlist[currentTrackIndex];
  if (!track || !track.lyrics || track.lyrics.length === 0) {
    lyrics.style.opacity = 0;
    lyrics.innerHTML = "";
    lyrics.style.display = "none";
    return;
  }
  lyrics.style.display = "block";

  var time = audio.currentTime;
  var currentLine = track.lyrics.find(function(line, idx, arr) {
    var nextLine = arr[idx + 1];
    var maxDuration = nextLine ? Math.min(6.5, nextLine.time - line.time) : 6.5;
    return time >= line.time && time < line.time + maxDuration;
  });

  if (currentLine) {
    var fadeInDuration = 0.4;
    var opacity = Math.min(1, (time - currentLine.time) / fadeInDuration);
    lyrics.style.opacity = opacity;
    lyrics.innerHTML = currentLine.text;
  } else {
    lyrics.style.opacity = 0;
    lyrics.innerHTML = "";
  }
}

// Actualizar cada 80ms para precisión milimétrica
setInterval(updateLyrics, 80);

// Función para ocultar el título después de 216 segundos
function ocultarTitulo() {
  var titulo = document.querySelector(".titulo");
  if (!titulo) return;
  titulo.style.animation = "fadeOut 3s ease-in-out forwards";
  setTimeout(function() {
    titulo.style.display = "none";
  }, 3000);
}
setTimeout(ocultarTitulo, 216000);