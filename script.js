const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');

const GROUND_Y = 250;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;

let mejorPuntaje = localStorage.getItem('mejorPuntaje') || 0;

// ===== Pollo (jugador) =====
const pollo = {
    x: 50,
    y: GROUND_Y,
    width: 40,
    height: 40,
    velocidadY: 0,
    saltando: false,
    frame: 0
};

// ===== Obstáculos =====
let obstaculos = [];
let velocidadJuego = 6;
let puntos = 0;
let juegoActivo = true;
let animFrame = 0;

// ===== Dibujar el pollo (con "aleteo") =====
function dibujarPollo() {
    ctx.save();
    ctx.translate(pollo.x, pollo.y);

    // Cuerpo
    ctx.fillStyle = '#FFF8E1';
    ctx.beginPath();
    ctx.ellipse(20, 20, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeza
    ctx.beginPath();
    ctx.arc(35, 8, 10, 0, Math.PI * 2);
    ctx.fill();

    // Cresta
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.arc(35, -2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pico
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(44, 8);
    ctx.lineTo(52, 10);
    ctx.lineTo(44, 13);
    ctx.fill();

    // Ojo
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(38, 6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Alas (aleteo animado)
    ctx.fillStyle = '#FFE0B2';
    const alaOffset = pollo.saltando ? -5 : Math.sin(animFrame * 0.3) * 5;
    ctx.beginPath();
    ctx.ellipse(15, 20 + alaOffset, 10, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Patas
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 3;
    const patasOffset = pollo.saltando ? 0 : Math.sin(animFrame * 0.5) * 4;
    ctx.beginPath();
    ctx.moveTo(12, 34);
    ctx.lineTo(10 + patasOffset, 42);
    ctx.moveTo(25, 34);
    ctx.lineTo(27 - patasOffset, 42);
    ctx.stroke();

    ctx.restore();
}

// ===== Obstáculos (zorros o rocas) =====
function crearObstaculo() {
    const tipo = Math.random() > 0.5 ? 'roca' : 'planta';
    obstaculos.push({
        x: canvas.width,
        y: GROUND_Y + 10,
        width: tipo === 'roca' ? 25 : 20,
        height: tipo === 'roca' ? 30 : 35,
        tipo: tipo
    });
}

function dibujarObstaculo(obs) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    if (obs.tipo === 'roca') {
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.moveTo(0, obs.height);
        ctx.lineTo(5, 0);
        ctx.lineTo(obs.width - 5, 0);
        ctx.lineTo(obs.width, obs.height);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.moveTo(obs.width / 2, 0);
        ctx.lineTo(0, obs.height);
        ctx.lineTo(obs.width, obs.height);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
}

// ===== Detección de colisiones =====
function detectarColision(obs) {
    return (
        pollo.x < obs.x + obs.width &&
        pollo.x + pollo.width > obs.x &&
        pollo.y + pollo.height > obs.y
    );
}

// ===== Suelo =====
function dibujarSuelo() {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 40);
    ctx.lineTo(canvas.width, GROUND_Y + 40);
    ctx.stroke();
}

// ===== Salto =====
function saltar() {
    if (!pollo.saltando && juegoActivo) {
        pollo.velocidadY = JUMP_FORCE;
        pollo.saltando = true;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        saltar();
    }
});

canvas.addEventListener('click', saltar);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    saltar();
});

// ===== Loop principal =====
let contadorObstaculos = 0;

function gameLoop() {
    if (!juegoActivo) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Física del salto
    pollo.velocidadY += GRAVITY;
    pollo.y += pollo.velocidadY;

    if (pollo.y >= GROUND_Y) {
        pollo.y = GROUND_Y;
        pollo.velocidadY = 0;
        pollo.saltando = false;
    }

    // Generar obstáculos
    contadorObstaculos++;
    if (contadorObstaculos > 90 - Math.min(velocidadJuego * 3, 40)) {
        crearObstaculo();
        contadorObstaculos = 0;
    }

    // Actualizar obstáculos
    obstaculos.forEach(obs => obs.x -= velocidadJuego);
    obstaculos = obstaculos.filter(obs => obs.x > -50);

    // Colisiones
    for (let obs of obstaculos) {
        if (detectarColision(obs)) {
            terminarJuego();
            return;
        }
    }

    // Dibujar todo
    dibujarSuelo();
    dibujarPollo();
    obstaculos.forEach(dibujarObstaculo);

    // Puntaje
    puntos++;
    velocidadJuego = 6 + Math.floor(puntos / 500);
    scoreEl.textContent = `Puntos: ${Math.floor(puntos / 10)} | Mejor: ${mejorPuntaje}`;

    animFrame++;
    requestAnimationFrame(gameLoop);
}

function terminarJuego() {
    juegoActivo = false;
    const puntajeFinal = Math.floor(puntos / 10);
    if (puntajeFinal > mejorPuntaje) {
        mejorPuntaje = puntajeFinal;
        localStorage.setItem('mejorPuntaje', mejorPuntaje);
    }
    gameOverScreen.classList.remove('hidden');
}

function reiniciarJuego() {
    obstaculos = [];
    puntos = 0;
    velocidadJuego = 6;
    pollo.y = GROUND_Y;
    pollo.velocidadY = 0;
    juegoActivo = true;
    gameOverScreen.classList.add('hidden');
    gameLoop();
}

// Iniciar juego
gameLoop();