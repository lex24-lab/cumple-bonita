const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const badtz = document.getElementById("badtz");
const kuromi = document.getElementById("kuromi");
const hint = document.getElementById("hint");
const message = document.getElementById("message");
const pianoIntro = document.getElementById("pianoIntro");
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pianoIntro.pause();
  } else {
    // si NO ha terminado, continúa
    if (pianoIntro.currentTime > 0 && !pianoIntro.ended) {
      pianoIntro.play().catch(() => {});
    }
  }
});

const walkFrames = [
  "img/badtz_walk1.png",
  "img/badtz_walk2.png",
  "img/badtz_walk3.png"
];

let frame = 0;
let fireworks = [];
let started = false;
let canClick = false;
let lastSpriteTime = 0;
const spriteInterval = 250; // más lento para caminar natural

// ⭐ Estrellas
const stars = Array.from({ length: 150 }, () => ({
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

// 🚶 Badtz camina
let x = -150;
const targetX = canvas.width / 2 - 160;

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
    canClick = true;
  }
}

requestAnimationFrame(walk);

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
    this.pattern = Math.random() < 0.3 ? "circle" : "normal"; // algunos patrones
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
      this.particles.push(new Particle(this.x, this.y, this.color, this.pattern, i));
    }

    // sonido por cada explosión usando clones para que se reproduzca completo
    const sound = new Audio("sounds/fireworks.mp3");
    sound.volume = 0.7;
    sound.play();
  }
}

class Particle {
  constructor(x, y, color, pattern, index) {
    this.x = x;
    this.y = y;
    this.life = 60;
    this.color = color;
    this.speed = Math.random() * 6 + 2;
    this.angle = pattern === "circle" ? (index * (Math.PI * 2 / 80)) : Math.random() * Math.PI * 2;
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

// Activación
badtz.addEventListener("click", () => {
  if (!canClick || started) return;

  started = true;
  hint.style.opacity = 0;
  message.style.opacity = 1;

  // Cambiar Kuromi a Feliz
  kuromi.src = "img/kuromi_happy.png";

  // varios fuegos artificiales a la vez
  setInterval(() => {
    for (let i = 0; i < 3; i++) {
      fireworks.push(new Firework());
    }
  }, 600);
});

// Loop principal
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

window.addEventListener("load", () => {
  pianoIntro.volume = 0.35;
  pianoIntro.play().catch(() => {});
});

animate();
