const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 🔄 Canvas responsive (clave para móvil)
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const badtz = document.getElementById("badtz");
const kuromi = document.getElementById("kuromi");
const hint = document.getElementById("hint");
const message = document.getElementById("message");
const pianoIntro = document.getElementById("pianoIntro");
const startScreen = document.getElementById("startScreen");

// 🎵 Piano
pianoIntro.volume = 0.35;
pianoIntro.loop = false;

// Pausa / reanuda si se cambia de pestaña
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pianoIntro.pause();
  } else {
    if (pianoIntro.currentTime > 0 && !pianoIntro.ended) {
      pianoIntro.play().catch(() => {});
    }
  }
});

// 🚶 Sprites de Badtz
const walkFrames = [
  "img/badtz_walk1.png",
  "img/badtz_walk2.png",
  "img/badtz_walk3.png"
];

let frame = 0;
let fireworks = [];
let startedFireworks = false;
let canClickBadtz = false;
let lastSpriteTime = 0;
let introStarted = false;
const spriteInterval = 260;

// ⭐ Estrellas
const stars = Array.from({ length: 160 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.5 + 0.5
}));

function drawStars() {
  ctx.fillStyle = "#4da6ff";
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 🚶‍♂️ Caminata de Badtz
let x = -150;
const targetX = canvas.width / 2 - 180;

function walk(time) {
  if (x < targetX) {
    x += 3;
    badtz.style.left = x + "px";

    if (!lastSpriteTime || time - lastSpriteTime > spriteInterval) {
      frame = (frame + 1) % walkFrames.length;
      badtz.src = walkFrames[frame];
      lastSpriteTime = time;
    }
    requestAnimationFrame(walk);
  } else {
    badtz.src = walkFrames[0];
    hint.style.opacity = 1;
    canClickBadtz = true;
  }
}

// 🎇 Fuegos artificiales
class Firework {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height;
    this.targetY = Math.random() * canvas.height * 0.5;
    this.speed = Math.random() * 4 + 5;
    this.exploded = false;
    this.particles = [];
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.pattern = Math.random() < 0.35 ? "circle" : "normal";
  }

  update() {
    if (!this.exploded) {
      this.y -= this.speed;
      if (this.y <= this.targetY) this.explode();
    } else {
      this.particles.forEach(p => p.update());
    }
  }

  draw() {
    if (!this.exploded) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      this.particles.forEach(p => p.draw());
    }
  }

  explode() {
    this.exploded = true;

    for (let i = 0; i < 80; i++) {
      this.particles.push(
        new Particle(this.x, this.y, this.color, this.pattern, i)
      );
    }

    // 🔊 sonido por explosión (completo, no cortado)
    const boom = new Audio("sounds/fireworks.mp3");
    boom.volume = 0.6;
    boom.play().catch(() => {});
  }
}

class Particle {
  constructor(x, y, color, pattern, index) {
    this.x = x;
    this.y = y;
    this.life = 60;
    this.color = color;
    this.speed = Math.random() * 6 + 2;
    this.angle =
      pattern === "circle"
        ? index * (Math.PI * 2 / 80)
        : Math.random() * Math.PI * 2;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life--;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 🖱️ Pantalla de inicio
startScreen.addEventListener("click", () => {
  if (introStarted) return;
  introStarted = true;

  startScreen.style.display = "none";

  pianoIntro.currentTime = 0;
  pianoIntro.play().catch(() => {});

  requestAnimationFrame(walk);
});

// 🖱️ Click en Badtz → fuegos
badtz.addEventListener("click", () => {
  if (!canClickBadtz || startedFireworks) return;

  startedFireworks = true;
  hint.style.opacity = 0;
  message.style.opacity = 1;

  kuromi.src = "img/kuromi_happy.png";

  // 💥 Límite para no trabar móviles
  setInterval(() => {
    if (fireworks.length < 25) {
      for (let i = 0; i < 3; i++) {
        fireworks.push(new Firework());
      }
    }
  }, 650);
});

// 🎬 Loop principal
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStars();

  fireworks.forEach((fw, i) => {
    fw.update();
    fw.draw();
    if (fw.exploded && fw.particles.every(p => p.life <= 0)) {
      fireworks.splice(i, 1);
    }
  });

  requestAnimationFrame(animate);
}

animate();
