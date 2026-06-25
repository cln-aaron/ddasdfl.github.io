/* =====================================================================
   Cyber Escape — Walk-around Escape Room (Roblox-style, touch/iPad)
   Flow: Register → Pick Avatar → Pick Level → WALK the vault, reach a
         terminal, solve the puzzle to unlock the door → escape →
         Result → Feedback → Submit (Formspree + local backup + export).
   ===================================================================== */

/* ---------- 1) CONFIG ---------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgojvvaz";
const STORAGE_KEY = "cyberEscape.submissions.v1";

/* ---------- 2) STATE ---------- */
const state = {
  player: null, avatar: null, level: null,
  questions: [],
  index: 0,                 // current room being solved (when modal open)
  score: 0,                 // first-try correct count
  answerMap: {},            // door -> answer record
  startTime: null, elapsed: 0, timerId: null,
  paused: false,            // true while a puzzle modal is open
  nearTerminal: null,
  soundOn: true,
  feedback: { enjoyment: 0, learning: 0 }
};

/* ---------- 3) HELPERS ---------- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
function showScreen(name) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("screen-" + name);
  if (el) el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
const fmtTime = t => `${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;
const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---- on-screen error reporter (so device-specific failures are visible) ---- */
let _errBox = null;
function showErr(msg) {
  try {
    if (!_errBox) {
      _errBox = document.createElement("div");
      _errBox.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#b00020;color:#fff;font:13px/1.45 ui-monospace,Menlo,monospace;padding:12px 14px;border-radius:12px;max-height:45vh;overflow:auto;white-space:pre-wrap;box-shadow:0 6px 20px rgba(0,0,0,.4)";
      (document.body || document.documentElement).appendChild(_errBox);
    }
    _errBox.textContent = "⚠ " + msg + "\n\n(Please screenshot this and send it back.)";
    _errBox.style.display = "block";
  } catch (e) {}
}
function showFatal(e) { showErr("Game error: " + (e && (e.stack || e.message) || e)); }
window.addEventListener("error", e => showErr((e.message || "Script error") + (e.filename ? "  @ " + e.filename.split("/").pop() + ":" + e.lineno : "")));
window.addEventListener("unhandledrejection", e => showErr("Promise: " + (e.reason && (e.reason.message || e.reason) || "unknown")));

/* ---------- 4) SOUND (Web Audio) ---------- */
let audioCtx = null;
function beep(freqs, dur = 0.12, type = "square", gain = 0.07) {
  if (!state.soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    let t = audioCtx.currentTime;
    (Array.isArray(freqs) ? freqs : [freqs]).forEach(f => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + dur); t += dur;
    });
  } catch (e) {}
}
const sfx = {
  click: () => beep(420, 0.06, "square", 0.05),
  step:  () => beep(180, 0.03, "sine", 0.02),
  correct: () => beep([523,659,784,1046], 0.11, "square", 0.07),
  wrong: () => beep([220,160], 0.18, "sawtooth", 0.06),
  win: () => beep([523,659,784,1046,1318], 0.13, "square", 0.08),
  unlock: () => beep([660,880], 0.1, "triangle", 0.07)
};
/* ---- chiptune background music (generated, no files) ---- */
const music = {
  timer: null, step: 0, beat: 0,
  // Cheerful C-major-ish loop. 0 = rest. 16 steps per bar.
  lead: [523,0,659,523,587,0,784,0, 659,0,523,587,440,0,523,0,
         587,0,698,587,523,0,659,0, 784,0,659,523,587,0,523,0],
  bass: [131,0,0,0, 175,0,0,0, 147,0,0,0, 196,0,0,0,
         131,0,0,0, 175,0,0,0, 147,0,0,0, 98,0,0,0],
  stepDur: 0.155,
  note(freq, dur, type, gain) {
    if (!freq || !audioCtx) return;
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + dur);
  },
  start() {
    if (!state.soundOn || this.timer) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) { return; }
    this.step = 0;
    this.timer = setInterval(() => this.tick(), this.stepDur * 1000);
  },
  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } },
  tick() {
    if (!state.soundOn) return;
    const i = this.step % this.lead.length;
    this.note(this.lead[i], 0.14, "square", 0.035);
    this.note(this.bass[i], 0.22, "triangle", 0.055);
    this.step++;
  }
};

$("#sound-toggle").addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  $("#sound-toggle").textContent = state.soundOn ? "🔊" : "🔇";
  if (state.soundOn) {
    sfx.click();
    if ($("#screen-game").classList.contains("active")) music.start();
  } else {
    music.stop();
  }
});

/* ---------- 5) NAV ---------- */
$$("[data-goto]").forEach(b => b.addEventListener("click", () => { sfx.click(); showScreen(b.dataset.goto); }));
$("#btn-begin").addEventListener("click", () => { sfx.click(); showScreen("register"); });

/* ---------- 6) REGISTRATION ---------- */
$("#register-form").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target, err = $("#register-error"); err.hidden = true;
  if (!form.checkValidity()) { err.textContent = "Please fill in all required fields (marked *) correctly."; err.hidden = false; form.reportValidity(); return; }
  const d = Object.fromEntries(new FormData(form).entries());
  state.player = {
    fullName: d.fullName.trim(), email: d.email.trim(), contact: d.contact.trim(),
    nric4: (d.nric4||"").trim().toUpperCase(), gender: d.gender,
    occupation: d.occupation.trim(), ageGroup: d.ageGroup, consent: !!d.consent
  };
  sfx.click(); showScreen("avatar");
});

/* ---------- 7) AVATAR SELECT ---------- */
function buildAvatars() {
  const grid = $("#avatar-grid"); grid.innerHTML = "";
  AVATARS.forEach(av => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "avatar-pick";
    b.innerHTML = `<span class="ava-emoji">${av.emoji}</span><span class="ava-name">${escapeHtml(av.name)}</span><span class="ava-trait">${escapeHtml(av.trait)}</span>`;
    b.addEventListener("click", () => {
      state.avatar = av;
      $$(".avatar-pick", grid).forEach(x => x.classList.remove("selected"));
      b.classList.add("selected"); $("#btn-avatar-next").disabled = false; sfx.correct();
    });
    grid.appendChild(b);
  });
}
buildAvatars();
$("#btn-avatar-next").addEventListener("click", () => { if (state.avatar) { sfx.click(); showScreen("level"); } });

/* ---------- 8) LEVEL SELECT → START ---------- */
$$(".level-card").forEach(c => c.addEventListener("click", () => {
  sfx.click();
  try { startGame(c.dataset.level); }
  catch (e) { showFatal(e); }
}));

/* =====================================================================
   9) THE WORLD ENGINE
   ===================================================================== */
const TILE = 46, ROOM_W = 9, ROOM_H = 8;
let world = null, raf = null, lastStep = 0;
const input = { x: 0, y: 0 };          // movement vector (from joystick/keys/tap)
let moveTarget = null;                  // tap-to-move target (world px)
const cam = { x: 0, y: 0 };
const cv = $("#world");
const ctx = cv.getContext("2d");
let viewW = 0, viewH = 0, dpr = 1;

function buildWorld() {
  const n = state.questions.length;
  const cols = n * ROOM_W, rows = ROOM_H;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0)); // 0 floor,1 wall,2 locked door,3 open door
  const mid = Math.floor(rows / 2);
  const doorRows = [mid - 1, mid];      // 2-tile-tall doorway (easy to walk through)

  // outer border
  for (let x = 0; x < cols; x++) { grid[0][x] = 1; grid[rows-1][x] = 1; }
  for (let y = 0; y < rows; y++) { grid[y][0] = 1; grid[y][cols-1] = 1; }

  const doors = [], terminals = [];
  for (let r = 0; r < n; r++) {
    const x0 = r * ROOM_W;
    const wallX = x0 + ROOM_W - 1;      // right wall of room r (last room => outer right = exit)
    for (let y = 1; y < rows - 1; y++) grid[y][wallX] = 1;
    doorRows.forEach(dy => { grid[dy][wallX] = 2; });   // locked door
    doors.push({ r, x: wallX, rows: doorRows.slice(), open: false });
    terminals.push({ r, x: x0 + Math.floor(ROOM_W/2), y: mid, solved: false });
  }

  const player = { x: 2.0 * TILE, y: (mid + 0.5) * TILE, half: TILE * 0.30, facing: 1, walk: 0 };
  world = { grid, cols, rows, doors, terminals, player, n, mid,
            worldW: cols * TILE, worldH: rows * TILE };
}

function solidTile(tx, ty) {
  if (ty < 0 || ty >= world.rows || tx < 0 || tx >= world.cols) return true;
  const v = world.grid[ty][tx];
  return v === 1 || v === 2;
}
function hits(cx, cy, half) {
  const pts = [[cx-half,cy-half],[cx+half,cy-half],[cx-half,cy+half],[cx+half,cy+half]];
  return pts.some(([px,py]) => solidTile(Math.floor(px/TILE), Math.floor(py/TILE)));
}
function tryMove(dx, dy) {
  const p = world.player;
  if (dx) { const nx = p.x + dx; if (!hits(nx, p.y, p.half)) p.x = nx; }
  if (dy) { const ny = p.y + dy; if (!hits(p.x, ny, p.half)) p.y = ny; }
}

function openDoor(door) {
  door.open = true;
  door.rows.forEach(dy => { world.grid[dy][door.x] = 3; });
}

/* ---- camera ---- */
function updateCam() {
  const p = world.player;
  cam.x = world.worldW <= viewW ? (world.worldW - viewW) / 2 : clamp(p.x - viewW/2, 0, world.worldW - viewW);
  cam.y = world.worldH <= viewH ? (world.worldH - viewH) / 2 : clamp(p.y - viewH/2, 0, world.worldH - viewH);
}

/* ---- interaction proximity ---- */
function checkInteract() {
  if (state.paused) return;
  const p = world.player;
  for (const t of world.terminals) {
    if (t.solved) continue;
    const tx = (t.x + 0.5) * TILE, ty = (t.y + 0.5) * TILE;
    // Auto-open the puzzle the moment the avatar steps onto the terminal.
    if (Math.hypot(p.x - tx, p.y - ty) < TILE * 0.85) { state.nearTerminal = t; openPuzzle(t.r); return; }
  }
  state.nearTerminal = null;
}

/* ---- escape detection: all solved & at the far-right exit ---- */
function checkExit() {
  const last = world.terminals[world.n - 1];
  if (!last.solved) return;
  if (world.player.x > world.worldW - TILE * 1.2) finishGame();
}

/* =====================================================================
   10) RENDER
   ===================================================================== */
function resizeCanvas() {
  const wrap = $("#world-wrap");
  viewW = wrap.clientWidth; viewH = wrap.clientHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(viewW * dpr); cv.height = Math.round(viewH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function lighten(hex, amt) { // amt 0..1 toward white
  const h = hex.replace("#",""); const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  const m = c => Math.round(c + (255 - c) * amt);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

function render(now) {
  if (!world) return;
  ctx.clearRect(0, 0, viewW, viewH);
  const startTx = Math.max(0, Math.floor(cam.x / TILE));
  const endTx = Math.min(world.cols - 1, Math.ceil((cam.x + viewW) / TILE));
  const startTy = Math.max(0, Math.floor(cam.y / TILE));
  const endTy = Math.min(world.rows - 1, Math.ceil((cam.y + viewH) / TILE));

  // floor & walls
  for (let ty = startTy; ty <= endTy; ty++) {
    for (let tx = startTx; tx <= endTx; tx++) {
      const sx = Math.round(tx * TILE - cam.x), sy = Math.round(ty * TILE - cam.y);
      const r = Math.min(world.n - 1, Math.floor(tx / ROOM_W));
      const loc = LOCATIONS[r % LOCATIONS.length];
      const v = world.grid[ty][tx];
      if (v === 1) {
        ctx.fillStyle = "#3a3f6b"; ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = "#4d5488"; ctx.fillRect(sx, sy, TILE, 6);
        ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.strokeRect(sx+.5, sy+.5, TILE-1, TILE-1);
      } else {
        ctx.fillStyle = lighten(loc.grad[1], 0.55); ctx.fillRect(sx, sy, TILE, TILE);
        ctx.strokeStyle = "rgba(0,0,0,.05)"; ctx.strokeRect(sx+.5, sy+.5, TILE-1, TILE-1);
        if (v === 2 || v === 3) drawDoorTile(sx, sy, v);
      }
    }
  }

  // room signs + decor (once per room, near top)
  for (let r = 0; r < world.n; r++) {
    const loc = LOCATIONS[r % LOCATIONS.length];
    const cx = (r * ROOM_W + ROOM_W/2) * TILE - cam.x;
    if (cx < -120 || cx > viewW + 120) continue;
    // sign
    const sy = TILE * 1.0 - cam.y;
    ctx.font = "700 15px 'Baloo 2', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const tw = ctx.measureText(loc.name).width + 22;
    ctx.fillStyle = "rgba(31,37,71,.78)"; roundRect(cx - tw/2, sy - 14, tw, 26, 13); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(loc.name, cx, sy);
    // a couple decor emojis
    ctx.font = "26px serif";
    ctx.fillText(loc.decor[0], (r*ROOM_W + 1.6)*TILE - cam.x, (ROOM_H-2.2)*TILE - cam.y);
    ctx.fillText(loc.decor[1] || loc.icon, (r*ROOM_W + 7.0)*TILE - cam.x, (2.0)*TILE - cam.y);
  }

  // terminals
  world.terminals.forEach(t => {
    const x = (t.x + 0.5) * TILE - cam.x, y = (t.y + 0.5) * TILE - cam.y;
    if (x < -60 || x > viewW + 60) return;
    const loc = LOCATIONS[t.r % LOCATIONS.length];
    if (t.solved) {
      ctx.fillStyle = "rgba(47,212,122,.25)"; ctx.beginPath(); ctx.arc(x, y, TILE*0.5, 0, 7); ctx.fill();
      ctx.font = "30px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("✅", x, y);
    } else {
      const pulse = 0.5 + 0.5 * Math.sin(now / 280);
      ctx.fillStyle = `rgba(255,194,61,${0.25 + 0.25*pulse})`;
      ctx.beginPath(); ctx.arc(x, y, TILE*(0.55 + 0.12*pulse), 0, 7); ctx.fill();
      ctx.fillStyle = "#ffc23d"; roundRect(x-16, y-2, 32, 20, 5); ctx.fill();
      ctx.fillStyle = "#7a5600"; ctx.fillRect(x-12, y+18, 24, 4);
      ctx.font = "22px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(loc.icon, x, y - 18);
      // floating ?
      const fb = Math.sin(now/300) * 4;
      ctx.font = "700 22px 'Baloo 2', sans-serif"; ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#5a3fd6"; ctx.lineWidth = 4; ctx.strokeText("?", x, y - 40 + fb); ctx.fillText("?", x, y - 40 + fb);
    }
  });

  // player
  const p = world.player;
  const px = p.x - cam.x, py = p.y - cam.y;
  ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(px, py + TILE*0.34, TILE*0.32, TILE*0.14, 0, 0, 7); ctx.fill();
  const bob = (input.x || input.y) ? Math.abs(Math.sin(now/90)) * 6 : Math.sin(now/420) * 2;
  ctx.save(); ctx.translate(px, py - bob);
  ctx.scale(p.facing, 1);
  ctx.font = `${Math.round(TILE*0.95)}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(state.avatar.emoji, 0, 0); ctx.restore();
  // name tag
  ctx.font = "600 11px 'Fredoka', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const nm = state.avatar.name.split(" ")[0];
  const nw = ctx.measureText(nm).width + 14;
  ctx.fillStyle = "rgba(123,92,255,.92)"; roundRect(px - nw/2, py + TILE*0.42, nw, 16, 8); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillText(nm, px, py + TILE*0.42 + 8);

  // ---- objective hint arrow (points to the next unsolved terminal) ----
  const tgt = world.terminals.find(t => !t.solved);
  if (tgt) {
    const tx = (tgt.x + 0.5) * TILE, ty = (tgt.y + 0.5) * TILE;
    const dx = tx - p.x, dy = ty - p.y, dist = Math.hypot(dx, dy);
    if (dist > TILE * 1.7) {
      const ang = Math.atan2(dy, dx);
      const rad = 46 + 7 * Math.abs(Math.sin(now / 240));
      const ax = px + Math.cos(ang) * rad, ay = (py - bob) + Math.sin(ang) * rad;
      ctx.save();
      ctx.translate(ax, ay); ctx.rotate(ang);
      ctx.fillStyle = "#ffc23d"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(17, 0); ctx.lineTo(-9, -12); ctx.lineTo(-9, 12); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  drawMinimap(now);
}

/* ---- minimap: a thin overview strip of the whole vault ---- */
function drawMinimap(now) {
  const mmW = Math.min(viewW - 24, 340);
  const mmH = Math.max(24, mmW * (world.worldH / world.worldW));
  const mmX = (viewW - mmW) / 2, mmY = 10;
  const sc = mmW / world.worldW;            // uniform scale (aspect preserved)
  ctx.save();
  // panel
  ctx.fillStyle = "rgba(20,24,48,.62)"; ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
  roundRect(mmX - 7, mmY - 7, mmW + 14, mmH + 14, 11); ctx.fill(); ctx.stroke();
  // rooms
  for (let r = 0; r < world.n; r++) {
    const loc = LOCATIONS[r % LOCATIONS.length];
    ctx.fillStyle = lighten(loc.grad[1], 0.4);
    ctx.fillRect(mmX + r * ROOM_W * TILE * sc + 1, mmY + 1, ROOM_W * TILE * sc - 2, mmH - 2);
  }
  // doors (red locked / green open)
  world.doors.forEach(d => {
    ctx.fillStyle = d.open ? "#2fd47a" : "#ff5470";
    ctx.fillRect(mmX + (d.x + 0.5) * TILE * sc - 1.5, mmY + mmH * 0.28, 3, mmH * 0.44);
  });
  // terminals (amber unsolved / green solved)
  world.terminals.forEach(t => {
    ctx.beginPath(); ctx.arc(mmX + (t.x + 0.5) * TILE * sc, mmY + (t.y + 0.5) * TILE * sc, 2.6, 0, 7);
    ctx.fillStyle = t.solved ? "#2fd47a" : "#ffc23d"; ctx.fill();
  });
  // player (pulsing white dot)
  const pr = 3.2 + 0.8 * Math.abs(Math.sin(now / 300));
  ctx.beginPath(); ctx.arc(mmX + world.player.x * sc, mmY + world.player.y * sc, pr, 0, 7);
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#7b5cff"; ctx.lineWidth = 2; ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawDoorTile(sx, sy, v) {
  if (v === 3) { // open
    ctx.fillStyle = "#2e7d32"; ctx.fillRect(sx+4, sy, 6, TILE);
    ctx.fillStyle = "#2e7d32"; ctx.fillRect(sx+TILE-10, sy, 6, TILE);
    ctx.font = "16px serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("✅", sx+TILE/2, sy+8);
  } else { // locked
    ctx.fillStyle = "#9c6b32"; ctx.fillRect(sx+3, sy+2, TILE-6, TILE-2);
    ctx.strokeStyle = "#5d3a16"; ctx.lineWidth = 3; ctx.strokeRect(sx+3, sy+2, TILE-6, TILE-2);
    ctx.font = "20px serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("🔒", sx+TILE/2, sy+TILE/2);
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.arcTo(x+w, y, x+w, y+h, r); ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r); ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
}

/* ---- main loop ---- */
function loop(now) {
  if (!world) return;
  try {
    if (viewW < 10 || viewH < 10) resizeCanvas();   // recover if size wasn't ready
    if (!state.paused) {
      let vx = input.x, vy = input.y;
      // tap-to-move
      if (moveTarget && !vx && !vy) {
        const dx = moveTarget.x - world.player.x, dy = moveTarget.y - world.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 6) moveTarget = null; else { vx = dx/dist; vy = dy/dist; }
      }
      const mag = Math.hypot(vx, vy);
      if (mag > 0) {
        const nx = vx/mag, ny = vy/mag;
        const SPEED = 3.0;
        if (Math.abs(vx) > 0.05) world.player.facing = vx < 0 ? -1 : 1;
        tryMove(nx * SPEED * Math.min(mag,1), ny * SPEED * Math.min(mag,1));
        if (now - lastStep > 230) { sfx.step(); lastStep = now; }
      }
      checkInteract();
      checkExit();
    }
    updateCam();
    render(now);
  } catch (e) {
    showFatal(e); cancelAnimationFrame(raf); raf = null; return;
  }
  raf = requestAnimationFrame(loop);
}

/* =====================================================================
   11) START GAME
   ===================================================================== */
function startGame(level) {
  state.level = level;
  state.questions = QUESTIONS[level];
  state.score = 0; state.answerMap = {}; state.paused = false; moveTarget = null;
  input.x = 0; input.y = 0;

  $("#q-total").textContent = state.questions.length;
  $("#q-current").textContent = "1";
  $("#score").textContent = "0";

  try { buildWorld(); } catch (e) { showFatal(e); return; }
  showScreen("game");

  state.startTime = Date.now(); state.elapsed = 0;
  clearInterval(state.timerId); $("#timer").textContent = "00:00";
  state.timerId = setInterval(() => {
    state.elapsed = Math.floor((Date.now() - state.startTime)/1000);
    $("#timer").textContent = fmtTime(state.elapsed);
  }, 1000);

  // Start rendering as soon as the canvas has a real size (Safari sometimes
  // reports 0 on the first frame after a display change — retry a few frames).
  cancelAnimationFrame(raf);
  startLoopWhenReady(0);
  music.start();
}
function startLoopWhenReady(attempt) {
  resizeCanvas();
  if ((viewW < 10 || viewH < 10) && attempt < 90) {
    raf = requestAnimationFrame(() => startLoopWhenReady(attempt + 1));
    return;
  }
  updateCam();
  raf = requestAnimationFrame(loop);
}
window.addEventListener("resize", () => { if (world && $("#screen-game").classList.contains("active")) resizeCanvas(); });
window.addEventListener("orientationchange", () => { if (world && $("#screen-game").classList.contains("active")) setTimeout(resizeCanvas, 200); });
if (window.ResizeObserver) {
  try { new ResizeObserver(() => { if (world && $("#screen-game").classList.contains("active")) resizeCanvas(); }).observe($("#world-wrap")); } catch (e) {}
}

/* =====================================================================
   12) INPUT — joystick, tap-to-move, keyboard
   ===================================================================== */
(function joystick() {
  const base = $("#joystick"), thumb = $("#joystick-thumb");
  const R = 40; let active = false, id = null;
  function center() { const r = base.getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2 }; }
  function set(cx, cy) {
    const c = center(); let dx = cx - c.x, dy = cy - c.y;
    const d = Math.hypot(dx, dy); if (d > R) { dx = dx/d*R; dy = dy/d*R; }
    thumb.style.transform = `translate(${dx}px,${dy}px)`;
    input.x = dx / R; input.y = dy / R; moveTarget = null;
  }
  function end() { active = false; id = null; input.x = 0; input.y = 0; thumb.style.transform = "translate(0,0)"; }
  base.addEventListener("pointerdown", e => { active = true; id = e.pointerId; base.setPointerCapture(id); set(e.clientX, e.clientY); e.preventDefault(); });
  base.addEventListener("pointermove", e => { if (active && e.pointerId === id) { set(e.clientX, e.clientY); e.preventDefault(); } });
  base.addEventListener("pointerup", e => { if (e.pointerId === id) end(); });
  base.addEventListener("pointercancel", () => end());
})();

// tap-to-move on the canvas
cv.addEventListener("pointerdown", e => {
  if (state.paused) return;
  const r = cv.getBoundingClientRect();
  moveTarget = { x: e.clientX - r.left + cam.x, y: e.clientY - r.top + cam.y };
});

// keyboard
const keys = {};
window.addEventListener("keydown", e => {
  if (!$("#screen-game").classList.contains("active") || state.paused) return;
  const k = e.key.toLowerCase();
  if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"," "].includes(k)) e.preventDefault();
  if (k === " " && state.nearTerminal) { openPuzzle(state.nearTerminal.r); return; }
  keys[k] = true; applyKeys();
});
window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; applyKeys(); });
function applyKeys() {
  let x = 0, y = 0;
  if (keys["arrowleft"] || keys["a"]) x -= 1;
  if (keys["arrowright"] || keys["d"]) x += 1;
  if (keys["arrowup"] || keys["w"]) y -= 1;
  if (keys["arrowdown"] || keys["s"]) y += 1;
  input.x = x; input.y = y;
  if (x || y) moveTarget = null;
}

/* interact button */
$("#interact-btn").addEventListener("click", () => { if (state.nearTerminal) openPuzzle(state.nearTerminal.r); });

/* =====================================================================
   13) PUZZLE MODAL
   ===================================================================== */
function openPuzzle(roomIndex) {
  state.index = roomIndex;
  state.paused = true;
  input.x = 0; input.y = 0; moveTarget = null;
  $("#interact-btn").hidden = true;
  sfx.click();
  const q = state.questions[roomIndex];
  const loc = LOCATIONS[roomIndex % LOCATIONS.length];
  $("#puzzle-room").textContent = loc.name;
  $("#q-current").textContent = roomIndex + 1;
  $("#question-text").textContent = q.prompt;

  const optWrap = $("#options"); optWrap.innerHTML = "";
  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option"; btn.type = "button";
    btn.innerHTML = `<span class="option-key">${String.fromCharCode(65+i)}</span><span class="option-text">${escapeHtml(text)}</span>`;
    btn.addEventListener("click", () => answer(i));
    optWrap.appendChild(btn);
  });
  $("#feedback").hidden = true;
  $("#hint-text").hidden = true; $("#hint-text").textContent = q.hint; $("#btn-hint").disabled = false;
  $("#puzzle-modal").hidden = false;
}

$("#btn-hint").addEventListener("click", () => { sfx.click(); $("#hint-text").hidden = false; $("#btn-hint").disabled = true; });

function answer(choiceIndex) {
  const r = state.index;
  const q = state.questions[r];
  const loc = LOCATIONS[r % LOCATIONS.length];
  const correct = choiceIndex === q.answer;

  // record (first attempt is the genuine selection; track attempts)
  let rec = state.answerMap[r];
  if (!rec) {
    rec = { door: r+1, room: loc.name, question: q.prompt,
            chosen: choiceIndex, chosenText: q.options[choiceIndex],
            correctIndex: q.answer, correctText: q.options[q.answer],
            correct, attempts: 1 };
    state.answerMap[r] = rec;
    if (correct) { state.score++; $("#score").textContent = state.score; }
  } else {
    rec.attempts++; rec.lastChosen = choiceIndex; rec.lastChosenText = q.options[choiceIndex];
  }

  const opts = $$("#options .option");
  opts.forEach((b, i) => { if (i === q.answer) b.classList.add("is-correct"); if (i === choiceIndex && !correct) b.classList.add("is-wrong"); });

  const head = $("#feedback-head"), fb = $("#feedback");
  if (correct) {
    sfx.correct(); setTimeout(sfx.unlock, 180); burstConfetti();
    opts.forEach(b => b.disabled = true);
    head.className = "feedback-head ok"; head.textContent = "🔓 Correct! The door unlocks!";
    $("#btn-next").textContent = (r === state.questions.length - 1) ? "🏆 Escape!" : "Continue →";
  } else {
    sfx.wrong();
    head.className = "feedback-head no"; head.textContent = "🔒 Not quite — the door stays locked!";
    $("#btn-next").textContent = "Try Again";
  }
  $("#feedback-body").textContent = q.explain;
  $("#btn-hint").disabled = true;
  fb.hidden = false;
  fb._correct = correct;
}

$("#btn-next").addEventListener("click", () => {
  sfx.click();
  const r = state.index;
  if ($("#feedback")._correct) {
    // unlock door, mark terminal solved
    world.terminals[r].solved = true;
    openDoor(world.doors[r]);
    $("#puzzle-modal").hidden = true;
    state.paused = false;
    if (r === state.questions.length - 1) { finishGame(); return; }
    // nudge objective
    $("#objective").textContent = "Door unlocked! 🔓 Walk to the next glowing terminal →";
  } else {
    // let them retry the same puzzle
    openPuzzle(r);
  }
});

/* confetti over the world */
function burstConfetti() {
  const layer = $("#confetti-layer");
  const colors = ["#ff5fa2","#ffc23d","#2fd47a","#3aa0ff","#7b5cff","#21d4d4"];
  for (let i = 0; i < 30; i++) {
    const c = document.createElement("div"); c.className = "confetti";
    c.style.left = Math.round(8 + (i/30)*84) + "%";
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = (1.0 + (i%5)*0.2).toFixed(2) + "s";
    c.style.transform = `rotate(${i*28}deg)`;
    layer.appendChild(c); setTimeout(() => c.remove(), 2200);
  }
}

/* =====================================================================
   14) FINISH / RESULT
   ===================================================================== */
function finishGame() {
  cancelAnimationFrame(raf); raf = null;
  music.stop();
  clearInterval(state.timerId);
  state.elapsed = Math.floor((Date.now() - state.startTime)/1000);
  const total = state.questions.length;
  const passed = state.score >= Math.ceil(total * 0.7);
  sfx.win();
  $("#result-avatar").textContent = state.avatar.emoji;
  $("#result-emoji").textContent = passed ? "🎉" : "🧩";
  $("#result-title").textContent = "You Escaped!";
  $("#result-lede").textContent = passed
    ? `Amazing work, ${state.avatar.name}! You explored every room, beat the scams and AI traps, and escaped the Digital Vault. You're navigating the digital world with confidence!`
    : `You escaped, ${state.avatar.name}! A few puzzles took more than one try — review the tips you learned, because every scam you can spot keeps you safer!`;
  $("#stat-score").textContent = `${state.score}/${total}`;
  $("#stat-time").textContent = fmtTime(state.elapsed);
  $("#stat-level").textContent = state.level === "easy" ? "Easy" : "Normal";
  showScreen("result");
}
$("#btn-to-feedback").addEventListener("click", () => { sfx.click(); showScreen("feedback"); });

/* =====================================================================
   15) FEEDBACK
   ===================================================================== */
function buildRating(id, key) {
  const wrap = document.getElementById(id); wrap.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement("button");
    s.type = "button"; s.className = "star"; s.textContent = "★"; s.setAttribute("aria-label", `${i} star`);
    s.addEventListener("click", () => { state.feedback[key] = i; sfx.click(); $$(".star", wrap).forEach((x, idx) => x.classList.toggle("on", idx < i)); });
    wrap.appendChild(s);
  }
}
buildRating("rating-enjoy", "enjoyment");
buildRating("rating-learn", "learning");

$("#feedback-form").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const record = buildRecord(data);
  saveLocal(record);
  $("#thanks-status").textContent = "Submitting your responses…"; sfx.win(); showScreen("thanks");
  const result = await sendToFormspree(record);
  if (result.ok) {
    $("#thanks-status").textContent = "✅ Your responses have been recorded. Thank you!";
  } else if (result.reason === "http-422" || result.reason === "http-403") {
    // Most common: the Formspree form hasn't been confirmed/activated yet.
    $("#thanks-status").textContent = "✅ Saved on this device. (Online form not active yet — organiser: please confirm the Formspree form via the activation email.)";
  } else {
    $("#thanks-status").textContent = "✅ Saved on this device. (Online submission unavailable right now — organisers will sync it later.)";
  }
});

/* =====================================================================
   16) RECORD / FORMSPREE / STORAGE
   ===================================================================== */
function buildRecord(fb) {
  const answers = Object.keys(state.answerMap).map(Number).sort((a,b)=>a-b).map(k => state.answerMap[k]);
  return {
    submittedAt: new Date().toISOString(),
    fullName: state.player.fullName, email: state.player.email, contact: state.player.contact,
    nric4: state.player.nric4, gender: state.player.gender, occupation: state.player.occupation,
    ageGroup: state.player.ageGroup, consent: state.player.consent ? "Yes" : "No",
    avatar: state.avatar ? state.avatar.name : "",
    level: state.level, score: state.score, totalQuestions: state.questions.length,
    timeSeconds: state.elapsed, timeFormatted: fmtTime(state.elapsed),
    answers,
    feedbackEnjoyment: state.feedback.enjoyment, feedbackLearning: state.feedback.learning,
    feedbackRecommend: fb.recommend || "", feedbackComments: fb.comments || ""
  };
}
async function sendToFormspree(record) {
  if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
    console.warn("[Cyber Escape] Formspree endpoint not set — record saved locally only.");
    return { ok: false, reason: "not-configured" };
  }
  try {
    // One combined submission: front registration info + end-of-game score/answers + feedback.
    const payload = { ...record,
      _subject: `Cyber Escape — ${record.fullName} (${record.level}, ${record.score}/${record.totalQuestions})`,
      answersReadable: record.answers.map(a => `D${a.door} [${a.correct ? "✓1st" : "✗"+(a.attempts>1?" /"+a.attempts+" tries":"")}] ${a.room} → chose "${a.chosenText}" (correct: "${a.correctText}")`).join("\n"),
      answersJson: JSON.stringify(record.answers) };
    delete payload.answers;
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    });
    let body = null;
    try { body = await res.json(); } catch (e) {}
    if (res.ok) {
      console.info("[Cyber Escape] Formspree submission OK.", body);
      return { ok: true };
    }
    // Surface the real reason (e.g. form not yet activated/confirmed, plan limit, bad id)
    console.error(`[Cyber Escape] Formspree returned HTTP ${res.status}:`, body);
    return { ok: false, reason: "http-" + res.status, body };
  } catch (e) {
    console.error("[Cyber Escape] Formspree request failed (network/CORS):", e);
    return { ok: false, reason: "network" };
  }
}
function getLocal() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function saveLocal(record) { const all = getLocal(); all.push(record); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch (e) {} }

/* ---------- play again ---------- */
$("#btn-play-again").addEventListener("click", () => {
  sfx.click(); music.stop();
  state.player = null; state.avatar = null; state.level = null; state.feedback = { enjoyment: 0, learning: 0 };
  $("#register-form").reset(); $("#feedback-form").reset();
  $$(".star").forEach(s => s.classList.remove("on"));
  $$(".avatar-pick").forEach(x => x.classList.remove("selected"));
  $("#btn-avatar-next").disabled = true;
  $("#objective").textContent = "Walk to the glowing terminal and solve the puzzle to open the door! 🚪";
  showScreen("welcome");
});

/* =====================================================================
   17) ORGANISER DASHBOARD
   ===================================================================== */
$("#btn-admin-link").addEventListener("click", openAdmin);
if (new URLSearchParams(location.search).has("admin")) document.addEventListener("DOMContentLoaded", openAdmin);
function openAdmin() { renderAdmin(); showScreen("admin"); }
function renderAdmin() {
  const all = getLocal(), total = all.length;
  const easy = all.filter(r => r.level === "easy").length, normal = all.filter(r => r.level === "normal").length;
  const avg = total ? (all.reduce((s, r) => s + (r.score||0), 0) / total).toFixed(1) : "0";
  $("#admin-stats").innerHTML = `
    <div class="stat"><span class="stat-num">${total}</span><span class="stat-label">Players (this device)</span></div>
    <div class="stat"><span class="stat-num">${easy}</span><span class="stat-label">Easy mode</span></div>
    <div class="stat"><span class="stat-num">${normal}</span><span class="stat-label">Normal mode</span></div>
    <div class="stat"><span class="stat-num">${avg}</span><span class="stat-label">Avg score</span></div>`;
  const table = $("#admin-table");
  if (!total) { table.innerHTML = `<tr><td class="empty">No local submissions yet.</td></tr>`; return; }
  const head = `<tr><th>Time</th><th>Name</th><th>Email</th><th>Contact</th><th>NRIC</th><th>Gender</th><th>Occupation</th><th>Group</th><th>Avatar</th><th>Level</th><th>Score</th><th>Duration</th></tr>`;
  const rows = all.slice().reverse().map(r => `<tr>
    <td>${escapeHtml(new Date(r.submittedAt).toLocaleString())}</td><td>${escapeHtml(r.fullName)}</td><td>${escapeHtml(r.email)}</td>
    <td>${escapeHtml(r.contact)}</td><td>${escapeHtml(r.nric4)}</td><td>${escapeHtml(r.gender)}</td><td>${escapeHtml(r.occupation)}</td>
    <td>${escapeHtml(r.ageGroup)}</td><td>${escapeHtml(r.avatar||"")}</td><td>${escapeHtml(r.level)}</td>
    <td>${escapeHtml(r.score + "/" + r.totalQuestions)}</td><td>${escapeHtml(r.timeFormatted)}</td></tr>`).join("");
  table.innerHTML = head + rows;
}
$("#btn-export-csv").addEventListener("click", () => {
  const all = getLocal(); if (!all.length) return alert("No data to export.");
  const cols = ["submittedAt","fullName","email","contact","nric4","gender","occupation","ageGroup","consent","avatar","level","score","totalQuestions","timeSeconds","timeFormatted","feedbackEnjoyment","feedbackLearning","feedbackRecommend","feedbackComments","answers"];
  const esc = v => `"${(typeof v === "object" ? JSON.stringify(v) : String(v ?? "")).replace(/"/g, '""')}"`;
  const lines = [cols.join(",")]; all.forEach(r => lines.push(cols.map(c => esc(r[c])).join(",")));
  download(lines.join("\n"), "cyber-escape-data.csv", "text/csv");
});
$("#btn-export-json").addEventListener("click", () => { const all = getLocal(); if (!all.length) return alert("No data to export."); download(JSON.stringify(all, null, 2), "cyber-escape-data.json", "application/json"); });
$("#btn-clear-data").addEventListener("click", () => { if (confirm("Delete ALL locally stored submissions on this device? This cannot be undone.\n\nExport first if you still need the data.")) { localStorage.removeItem(STORAGE_KEY); renderAdmin(); } });
function download(content, filename, type) {
  const blob = new Blob([content], { type }), url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
