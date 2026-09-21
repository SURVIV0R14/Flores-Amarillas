// Sincronizar las letras con la canción
var audio = document.querySelector("audio");
var lyrics = document.querySelector("#lyrics");

// Array de objetos que contiene cada línea y su tiempo de aparición en segundos
var lyricsData = [
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
];

// Animar las letras
function updateLyrics() {
  var time = audio.currentTime; // Usar el tiempo exacto, sin redondear
  var currentLine = lyricsData.find(
    (line) => time >= line.time && time < line.time + 6
  );

  if (currentLine) {
    // Calcula la opacidad basada en el tiempo exacto en la línea actual
    var fadeInDuration = 0.5; // Duración del efecto de aparición en segundos
    var opacity = Math.min(1, (time - currentLine.time) / fadeInDuration);

    // Aplica el efecto de aparición
    lyrics.style.opacity = opacity;
    lyrics.innerHTML = currentLine.text;
  } else {
    // Restablece la opacidad y el contenido si no hay una línea actual
    lyrics.style.opacity = 0;
    lyrics.innerHTML = "";
  }
}

// Usar 100ms en lugar de 1000ms para una sincronización mucho más precisa
setInterval(updateLyrics, 100);

//funcion titulo
// Función para ocultar el título después de 216 segundos
function ocultarTitulo() {
  var titulo = document.querySelector(".titulo");
  titulo.style.animation =
    "fadeOut 3s ease-in-out forwards"; /* Duración y función de temporización de la desaparición */
  setTimeout(function () {
    titulo.style.display = "none";
  }, 3000); // Espera 3 segundos antes de ocultar completamente
}

// Llama a la función después de 216 segundos (216,000 milisegundos)
setTimeout(ocultarTitulo, 216000);