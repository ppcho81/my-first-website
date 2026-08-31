// ===== Nacho Run =====
// A little endless-runner game: a nacho (Dorito-shaped chip) jumps over
// cars that come speeding in from the right. Press SPACE or tap/click
// the game to jump. Inspired by the Chrome "dinosaur" game.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = HEIGHT - 40;

// How high the "score saved" key is stored under in this browser
const HIGH_SCORE_KEY = "nachoRunHighScore";

// ---------- Game state ----------
// "ready"    -> waiting for the player to press a key to begin
// "running"  -> game is live
// "gameover" -> player got hit, waiting to restart
let state = "ready";
let frameCount = 0;
let score = 0;
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;

// Base speed and how fast it ramps up, both dialed back 10% from the
// original pace so the game feels a little more relaxed.
const START_SPEED = 5.4;
const SPEED_INCREMENT = 0.45;

let gameSpeed = START_SPEED;
let groundOffset = 0;
let obstacles = [];
let nextObstacleAt = 0;

// ---------- Leaderboard (named top scores, shown below the game) ----------
const LEADERBOARD_KEY = "nachoRunLeaderboard";
const MAX_LEADERBOARD_ENTRIES = 5;

const leaderboardList = document.getElementById("leaderboardList");
const leaderboardEmpty = document.getElementById("leaderboardEmpty");
const scoreForm = document.getElementById("scoreForm");
const playerNameInput = document.getElementById("playerName");
const skipScoreButton = document.getElementById("skipScoreButton");

let leaderboard = loadLeaderboard();
let pendingScore = 0;
let awaitingNameEntry = false;

function loadLeaderboard() {
  try {
    const saved = JSON.parse(localStorage.getItem(LEADERBOARD_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function saveLeaderboard() {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

function qualifiesForLeaderboard(candidateScore) {
  if (leaderboard.length < MAX_LEADERBOARD_ENTRIES) return true;
  return candidateScore > leaderboard[leaderboard.length - 1].score;
}

function renderLeaderboard() {
  leaderboardList.innerHTML = "";
  leaderboardEmpty.hidden = leaderboard.length > 0;

  leaderboard.forEach(function (entry) {
    const li = document.createElement("li");
    const nameSpan = document.createElement("span");
    nameSpan.className = "lb-name";
    nameSpan.textContent = entry.name;
    const scoreSpan = document.createElement("span");
    scoreSpan.className = "lb-score";
    scoreSpan.textContent = entry.score;
    li.appendChild(nameSpan);
    li.appendChild(scoreSpan);
    leaderboardList.appendChild(li);
  });
}

scoreForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = playerNameInput.value.trim() || "Anonymous";

  leaderboard.push({ name: name, score: pendingScore });
  leaderboard.sort(function (a, b) {
    return b.score - a.score;
  });
  leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
  saveLeaderboard();
  renderLeaderboard();

  scoreForm.hidden = true;
  awaitingNameEntry = false;
  playerNameInput.value = "";
});

skipScoreButton.addEventListener("click", function () {
  scoreForm.hidden = true;
  awaitingNameEntry = false;
  playerNameInput.value = "";
});

renderLeaderboard();

// The nacho (player) himself
const nacho = {
  x: 70,
  width: 42,
  height: 42,
  y: GROUND_Y - 42,
  velocityY: 0,
  jumping: false,
};

const GRAVITY = 0.7;
const JUMP_STRENGTH = -13;

// ---------- Setting up a new game ----------
function resetGame() {
  score = 0;
  gameSpeed = START_SPEED;
  groundOffset = 0;
  obstacles = [];
  frameCount = 0;
  nextObstacleAt = randomBetween(70, 110);
  nacho.y = GROUND_Y - nacho.height;
  nacho.velocityY = 0;
  nacho.jumping = false;

  // Starting a fresh run cancels any unsaved name-entry prompt
  scoreForm.hidden = true;
  awaitingNameEntry = false;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------- Input handling ----------
function jump() {
  if (!nacho.jumping) {
    nacho.velocityY = JUMP_STRENGTH;
    nacho.jumping = true;
  }
}

function handleAction() {
  if (state === "ready") {
    resetGame();
    state = "running";
    jump();
  } else if (state === "running") {
    jump();
  } else if (state === "gameover") {
    // Don't let a stray tap wipe out an unsaved qualifying score
    if (awaitingNameEntry) return;
    resetGame();
    state = "running";
  }
}

window.addEventListener("keydown", function (e) {
  // Don't hijack space/arrow keys while the player is typing their name
  if (document.activeElement === playerNameInput) return;

  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    handleAction();
  }
});

canvas.addEventListener("mousedown", handleAction);
canvas.addEventListener(
  "touchstart",
  function (e) {
    e.preventDefault();
    handleAction();
  },
  { passive: false }
);

// ---------- Obstacles (cars) ----------
// Two sizes of car: a low sedan and a taller SUV, so timing the jump matters.
const CAR_TYPES = [
  { width: 54, height: 32, color: "#c0392b", roofColor: "#922b21" },
  { width: 66, height: 42, color: "#2980b9", roofColor: "#1f618d" },
];

function spawnObstacle() {
  const type = CAR_TYPES[randomBetween(0, CAR_TYPES.length - 1)];
  obstacles.push({
    x: WIDTH + 10,
    y: GROUND_Y - type.height,
    width: type.width,
    height: type.height,
    color: type.color,
    roofColor: type.roofColor,
  });
}

function isColliding(a, b) {
  // Shrink the hitboxes a little so near-misses feel fair
  const pad = 6;
  return (
    a.x + pad < b.x + b.width - pad &&
    a.x + a.width - pad > b.x + pad &&
    a.y + pad < b.y + b.height - pad &&
    a.y + a.height - pad > b.y + pad
  );
}

// ---------- Update ----------
function update() {
  frameCount++;

  // Ground stripes scroll by to sell the feeling of speed
  groundOffset = (groundOffset + gameSpeed) % 40;

  // Nacho's jump physics
  nacho.velocityY += GRAVITY;
  nacho.y += nacho.velocityY;
  if (nacho.y >= GROUND_Y - nacho.height) {
    nacho.y = GROUND_Y - nacho.height;
    nacho.velocityY = 0;
    nacho.jumping = false;
  }

  // Move cars toward Nacho, spawn new ones, and remove ones off screen
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= gameSpeed;
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
    }
  }

  if (frameCount >= nextObstacleAt) {
    spawnObstacle();
    // Gap gets a little tighter as speed rises, but never unfairly short
    const minGap = Math.max(45, 100 - gameSpeed * 2);
    nextObstacleAt = frameCount + randomBetween(minGap, minGap + 40);
  }

  // Check for a crash
  for (const car of obstacles) {
    if (isColliding(nacho, car)) {
      endGame();
      break;
    }
  }

  // Score climbs over time, and the game gently speeds up
  score += 1;
  if (score % 300 === 0) {
    gameSpeed += SPEED_INCREMENT;
  }
}

function endGame() {
  state = "gameover";
  const finalScore = Math.floor(score / 10);
  if (finalScore > highScore) {
    highScore = finalScore;
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
  }

  // If this run earned a spot on the named leaderboard, prompt for a name
  if (finalScore > 0 && qualifiesForLeaderboard(finalScore)) {
    pendingScore = finalScore;
    awaitingNameEntry = true;
    scoreForm.hidden = false;
    playerNameInput.focus();
  }
}

// ---------- Drawing ----------
function drawBackground() {
  // Sky
  ctx.fillStyle = "#bfe6f5";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // A couple of soft clouds
  ctx.fillStyle = "#ffffff";
  drawCloud(90, 50);
  drawCloud(320, 35);
  drawCloud(560, 60);

  // Road
  ctx.fillStyle = "#5a5a5a";
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

  // Scrolling dashed road line
  ctx.strokeStyle = "#f2d94e";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 20]);
  ctx.lineDashOffset = -groundOffset;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 14);
  ctx.lineTo(WIDTH, GROUND_Y + 14);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.arc(x + 16, y - 6, 12, 0, Math.PI * 2);
  ctx.arc(x + 30, y, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawNacho() {
  const x = nacho.x;
  const y = nacho.y;
  const w = nacho.width;
  const h = nacho.height;

  ctx.save();
  ctx.translate(x, y);

  // Little running legs (only while on the ground, alternating)
  if (!nacho.jumping) {
    ctx.fillStyle = "#c98a2c";
    const legSwing = Math.floor(frameCount / 6) % 2 === 0 ? 4 : -4;
    ctx.fillRect(6, h - 2, 6, 8 + legSwing * 0.5);
    ctx.fillRect(w - 14, h - 2, 6, 8 - legSwing * 0.5);
  }

  // The chip body: a triangle with slightly rounded corners
  ctx.fillStyle = "#f2b632";
  ctx.strokeStyle = "#c98a2c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w / 2, 2);
  ctx.lineTo(w - 4, h - 4);
  ctx.quadraticCurveTo(w - 4, h, w - 8, h);
  ctx.lineTo(8, h);
  ctx.quadraticCurveTo(4, h, 4, h - 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Spice flecks
  ctx.fillStyle = "#c9401f";
  ctx.beginPath();
  ctx.arc(w / 2 - 6, h / 2 + 2, 2, 0, Math.PI * 2);
  ctx.arc(w / 2 + 8, h / 2 + 8, 2, 0, Math.PI * 2);
  ctx.arc(w / 2 - 2, h / 2 + 14, 2, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = "#3a2a10";
  ctx.beginPath();
  ctx.arc(w / 2 - 6, h / 2 - 2, 2, 0, Math.PI * 2);
  ctx.arc(w / 2 + 4, h / 2 - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w / 2 - 1, h / 2 + 4, 4, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

function drawCar(car) {
  ctx.save();
  ctx.translate(car.x, car.y);

  // Body
  ctx.fillStyle = car.color;
  ctx.fillRect(0, car.height * 0.4, car.width, car.height * 0.6);

  // Roof
  ctx.fillStyle = car.roofColor;
  ctx.beginPath();
  ctx.moveTo(car.width * 0.18, car.height * 0.4);
  ctx.lineTo(car.width * 0.3, car.height * 0.05);
  ctx.lineTo(car.width * 0.72, car.height * 0.05);
  ctx.lineTo(car.width * 0.84, car.height * 0.4);
  ctx.closePath();
  ctx.fill();

  // Window
  ctx.fillStyle = "#dcf3ff";
  ctx.fillRect(car.width * 0.34, car.height * 0.14, car.width * 0.32, car.height * 0.22);

  // Wheels
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(car.width * 0.2, car.height, car.height * 0.18, 0, Math.PI * 2);
  ctx.arc(car.width * 0.8, car.height, car.height * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawScore() {
  ctx.fillStyle = "#2f4a3e";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "right";
  ctx.fillText("Score: " + Math.floor(score / 10), WIDTH - 16, 26);
  ctx.fillText("High Score: " + highScore, WIDTH - 16, 48);
}

function drawOverlayText(lines) {
  ctx.fillStyle = "rgba(20, 30, 25, 0.55)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 26px Arial";
  ctx.fillText(lines[0], WIDTH / 2, HEIGHT / 2 - 10);

  ctx.font = "16px Arial";
  for (let i = 1; i < lines.length; i++) {
    ctx.fillText(lines[i], WIDTH / 2, HEIGHT / 2 + 20 + (i - 1) * 24);
  }
  ctx.textAlign = "left";
}

// ---------- Main loop ----------
function loop() {
  if (state === "running") {
    update();
  }

  drawBackground();
  for (const car of obstacles) {
    drawCar(car);
  }
  drawNacho();
  drawScore();

  if (state === "ready") {
    drawOverlayText(["Nacho Run", "Press SPACE or tap to start"]);
  } else if (state === "gameover") {
    const lines = [
      "Game Over!",
      "Score: " + Math.floor(score / 10) + "   High Score: " + highScore,
    ];
    if (awaitingNameEntry) {
      lines.push("🎉 Top score! Enter your name below to save it.");
    } else {
      lines.push("Press SPACE or tap to play again");
    }
    drawOverlayText(lines);
  }

  requestAnimationFrame(loop);
}

resetGame();
loop();
