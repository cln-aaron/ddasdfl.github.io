/* =====================================================================
   Cyber Escape — Application Logic (Roblox-style journey edition)
   Flow: Register → Pick Avatar → Pick Level → Travel the Vault
         (room-by-room scenes & challenges) → Result → Feedback → Submit
   Data: POSTed to Formspree, with localStorage backup + CSV/JSON export.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) CONFIG  —  ⚙️ Formspree endpoint
--------------------------------------------------------------------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgojvvaz";
const STORAGE_KEY = "cyberEscape.submissions.v1";

/* ---------------------------------------------------------------------
   2) STATE
--------------------------------------------------------------------- */
const state = {
  player: null,
  avatar: null,        // selected avatar object
  level: null,
  questions: [],
  index: 0,
  score: 0,
  answers: [],
  startTime: null,
  elapsed: 0,
  timerId: null,
  locked: false,
  soundOn: true,
  feedback: { enjoyment: 0, learning: 0 }
};

/* ---------------------------------------------------------------------
   3) HELPERS
--------------------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function showScreen(name) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("screen-" + name);
  if (el) el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function fmtTime(t) {
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------------------------------------------------------------------
   4) SOUND (Web Audio — no files needed)
--------------------------------------------------------------------- */
let audioCtx = null;
function beep(freqs, dur = 0.12, type = "square", gain = 0.08) {
  if (!state.soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    let t = audioCtx.currentTime;
    (Array.isArray(freqs) ? freqs : [freqs]).forEach((f) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = type; osc.frequency.value = f;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(t); osc.stop(t + dur);
      t += dur;
    });
  } catch (e) { /* audio not available */ }
}
const sfx = {
  click: () => beep(420, 0.06, "square", 0.05),
  correct: () => beep([523, 659, 784, 1046], 0.11, "square", 0.07),
  wrong: () => beep([220, 160], 0.18, "sawtooth", 0.06),
  win: () => beep([523, 659, 784, 1046, 1318], 0.13, "square", 0.08),
  unlock: () => beep([660, 880], 0.1, "triangle", 0.07)
};

$("#sound-toggle").addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  $("#sound-toggle").textContent = state.soundOn ? "🔊" : "🔇";
  if (state.soundOn) sfx.click();
});

/* ---------------------------------------------------------------------
   5) NAVIGATION
--------------------------------------------------------------------- */
$$("[data-goto]").forEach(btn =>
  btn.addEventListener("click", () => { sfx.click(); showScreen(btn.dataset.goto); }));
$("#btn-begin").addEventListener("click", () => { sfx.click(); showScreen("register"); });

/* ---------------------------------------------------------------------
   6) REGISTRATION
--------------------------------------------------------------------- */
$("#register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const err = $("#register-error");
  err.hidden = true;
  if (!form.checkValidity()) {
    err.textContent = "Please fill in all required fields (marked *) correctly.";
    err.hidden = false; form.reportValidity(); return;
  }
  const d = Object.fromEntries(new FormData(form).entries());
  state.player = {
    fullName: d.fullName.trim(), email: d.email.trim(), contact: d.contact.trim(),
    nric4: (d.nric4 || "").trim().toUpperCase(), gender: d.gender,
    occupation: d.occupation.trim(), ageGroup: d.ageGroup, consent: !!d.consent
  };
  sfx.click();
  showScreen("avatar");
});

/* ---------------------------------------------------------------------
   7) AVATAR SELECT
--------------------------------------------------------------------- */
function buildAvatars() {
  const grid = $("#avatar-grid");
  grid.innerHTML = "";
  AVATARS.forEach(av => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "avatar-pick";
    b.innerHTML = `<span class="ava-emoji">${av.emoji}</span>
      <span class="ava-name">${escapeHtml(av.name)}</span>
      <span class="ava-trait">${escapeHtml(av.trait)}</span>`;
    b.addEventListener("click", () => {
      state.avatar = av;
      $$(".avatar-pick", grid).forEach(x => x.classList.remove("selected"));
      b.classList.add("selected");
      $("#btn-avatar-next").disabled = false;
      sfx.correct();
    });
    grid.appendChild(b);
  });
}
buildAvatars();
$("#btn-avatar-next").addEventListener("click", () => {
  if (!state.avatar) return;
  sfx.click();
  showScreen("level");
});

/* ---------------------------------------------------------------------
   8) LEVEL SELECT → START
--------------------------------------------------------------------- */
$$(".level-card").forEach(card =>
  card.addEventListener("click", () => { sfx.click(); startGame(card.dataset.level); }));

function startGame(level) {
  state.level = level;
  state.questions = QUESTIONS[level];
  state.index = 0; state.score = 0; state.answers = []; state.locked = false;

  $("#q-total").textContent = state.questions.length;
  $("#score").textContent = "0";
  $("#avatar-char").textContent = state.avatar.emoji;

  buildJourney();

  state.startTime = Date.now(); state.elapsed = 0;
  clearInterval(state.timerId);
  $("#timer").textContent = "00:00";
  state.timerId = setInterval(() => {
    state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    $("#timer").textContent = fmtTime(state.elapsed);
  }, 1000);

  showScreen("game");
  renderRoom(true);
}

/* ---------------------------------------------------------------------
   9) JOURNEY MAP
--------------------------------------------------------------------- */
function buildJourney() {
  const wrap = $("#journey");
  wrap.innerHTML = "";
  state.questions.forEach((_, i) => {
    if (i > 0) {
      const line = document.createElement("div");
      line.className = "j-line"; line.dataset.line = i;
      wrap.appendChild(line);
    }
    const node = document.createElement("div");
    node.className = "j-node"; node.dataset.node = i;
    node.textContent = i + 1;
    wrap.appendChild(node);
  });
}
function updateJourney() {
  $$(".j-node").forEach(n => {
    const i = +n.dataset.node;
    n.classList.toggle("done", i < state.index);
    n.classList.toggle("current", i === state.index);
    if (i < state.index) n.textContent = "✓";
    else n.textContent = i + 1;
  });
  $$(".j-line").forEach(l => l.classList.toggle("done", +l.dataset.line <= state.index));
}

/* ---------------------------------------------------------------------
   10) RENDER ROOM (scene + challenge)
--------------------------------------------------------------------- */
function renderRoom(instant = false) {
  const q = state.questions[state.index];
  const loc = LOCATIONS[state.index % LOCATIONS.length];
  state.locked = false;

  $("#q-current").textContent = state.index + 1;
  updateJourney();

  // scene styling
  const scene = $("#scene");
  scene.style.setProperty("--scene-a", loc.grad[0]);
  scene.style.setProperty("--scene-b", loc.grad[1]);
  $("#scene-sign").textContent = loc.name;

  // decorations
  const decor = $("#scene-decor");
  const spots = [["10%","22%"],["78%","16%"],["40%","12%"],["62%","40%"],["22%","52%"],["86%","48%"]];
  decor.innerHTML = loc.decor.concat(loc.decor).slice(0, 6).map((em, i) => {
    const [l, t] = spots[i];
    return `<span style="left:${l};top:${t};animation-delay:${i * 0.4}s">${em}</span>`;
  }).join("");

  // reset avatar + door
  const ava = $("#avatar-char");
  ava.className = "avatar-char";
  ava.textContent = state.avatar.emoji;
  ava.style.opacity = "1";
  ava.style.left = "16px";
  const door = $("#door");
  door.className = "door";
  $("#door-lock").textContent = "🔒";

  // challenge
  $("#question-text").textContent = q.prompt;
  const optWrap = $("#options");
  optWrap.innerHTML = "";
  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option"; btn.type = "button";
    btn.innerHTML = `<span class="option-key">${String.fromCharCode(65 + i)}</span><span class="option-text">${escapeHtml(text)}</span>`;
    btn.addEventListener("click", () => handleAnswer(i));
    optWrap.appendChild(btn);
  });

  $("#feedback").hidden = true;
  $("#hint-text").hidden = true;
  $("#hint-text").textContent = q.hint;
  $("#btn-hint").disabled = false;
}

$("#btn-hint").addEventListener("click", () => {
  sfx.click();
  $("#hint-text").hidden = false;
  $("#btn-hint").disabled = true;
});

/* ---------------------------------------------------------------------
   11) ANSWER HANDLING + ANIMATIONS
--------------------------------------------------------------------- */
function handleAnswer(choiceIndex) {
  if (state.locked) return;
  state.locked = true;

  const q = state.questions[state.index];
  const correct = choiceIndex === q.answer;
  if (correct) state.score++;

  state.answers.push({
    door: state.index + 1,
    room: LOCATIONS[state.index % LOCATIONS.length].name,
    question: q.prompt,
    chosen: choiceIndex, chosenText: q.options[choiceIndex],
    correct, correctIndex: q.answer, correctText: q.options[q.answer]
  });

  const optButtons = $$("#options .option");
  optButtons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add("is-correct");
    if (i === choiceIndex && !correct) b.classList.add("is-wrong");
  });
  $("#score").textContent = state.score;

  const scene = $("#scene");
  const ava = $("#avatar-char");
  const door = $("#door");

  if (correct) {
    sfx.correct();
    setTimeout(sfx.unlock, 200);
    scene.classList.add("flash-good");
    $("#door-lock").textContent = "🔓";
    door.classList.add("open");
    ava.classList.add("cheer");
    burstConfetti();
    setTimeout(() => { scene.classList.remove("flash-good"); }, 600);
    // walk through the door
    setTimeout(() => {
      ava.classList.remove("cheer");
      ava.classList.add("walking");
      setTimeout(() => { ava.style.opacity = "0"; }, 900);
    }, 700);
  } else {
    sfx.wrong();
    scene.classList.add("flash-bad");
    door.classList.add("shake");
    setTimeout(() => { scene.classList.remove("flash-bad"); door.classList.remove("shake"); }, 500);
  }

  const fb = $("#feedback");
  const head = $("#feedback-head");
  head.className = "feedback-head " + (correct ? "ok" : "no");
  head.textContent = correct ? "🔓 Door unlocked! You found a key!" : "🔒 Oops — that door stays shut!";
  $("#feedback-body").textContent = q.explain;
  $("#btn-next").textContent =
    state.index === state.questions.length - 1 ? "🏆 Finish & Escape →" : "Next Room →";
  fb.hidden = false;
  $("#btn-hint").disabled = true;
}

$("#btn-next").addEventListener("click", () => {
  sfx.click();
  if (state.index < state.questions.length - 1) {
    state.index++;
    renderRoom();
  } else {
    finishGame();
  }
});

/* ---- confetti burst (DOM) ---- */
function burstConfetti() {
  const layer = $("#confetti-layer");
  const colors = ["#ff5fa2", "#ffc23d", "#2fd47a", "#3aa0ff", "#7b5cff", "#21d4d4"];
  for (let i = 0; i < 28; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.round(10 + (i / 28) * 80) + "%";
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = (0.9 + (i % 5) * 0.18).toFixed(2) + "s";
    c.style.transform = `translateY(0) rotate(${i * 30}deg)`;
    layer.appendChild(c);
    setTimeout(() => c.remove(), 1800);
  }
}

/* ---------------------------------------------------------------------
   12) RESULT
--------------------------------------------------------------------- */
function finishGame() {
  clearInterval(state.timerId);
  state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const total = state.questions.length;
  const passed = state.score >= Math.ceil(total * 0.7);

  sfx.win();
  $("#result-avatar").textContent = state.avatar.emoji;
  $("#result-emoji").textContent = passed ? "🎉" : "🧩";
  $("#result-title").textContent = passed ? "You Escaped!" : "So Close!";
  $("#result-lede").textContent = passed
    ? `Amazing work, ${state.avatar.name}! You spotted the scams and AI traps and escaped the Digital Vault. You're navigating the digital world with confidence!`
    : "You unlocked some doors but a few tricks caught you out. Review the tips you learned — every scam you can spot keeps you safer!";
  $("#stat-score").textContent = `${state.score}/${total}`;
  $("#stat-time").textContent = fmtTime(state.elapsed);
  $("#stat-level").textContent = state.level === "easy" ? "Easy" : "Normal";
  showScreen("result");
}

$("#btn-to-feedback").addEventListener("click", () => { sfx.click(); showScreen("feedback"); });

/* ---------------------------------------------------------------------
   13) FEEDBACK
--------------------------------------------------------------------- */
function buildRating(containerId, key) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("button");
    star.type = "button"; star.className = "star"; star.textContent = "★";
    star.setAttribute("aria-label", `${i} star${i > 1 ? "s" : ""}`);
    star.addEventListener("click", () => {
      state.feedback[key] = i; sfx.click();
      $$(".star", wrap).forEach((s, idx) => s.classList.toggle("on", idx < i));
    });
    wrap.appendChild(star);
  }
}
buildRating("rating-enjoy", "enjoyment");
buildRating("rating-learn", "learning");

$("#feedback-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const record = buildRecord(data);
  saveLocal(record);
  $("#thanks-status").textContent = "Submitting your responses…";
  sfx.win();
  showScreen("thanks");
  const ok = await sendToFormspree(record);
  $("#thanks-status").textContent = ok
    ? "✅ Your responses have been recorded. Thank you!"
    : "✅ Saved on this device. (Online submission unavailable — organisers will sync it later.)";
});

/* ---------------------------------------------------------------------
   14) RECORD
--------------------------------------------------------------------- */
function buildRecord(feedbackForm) {
  return {
    submittedAt: new Date().toISOString(),
    fullName: state.player.fullName, email: state.player.email,
    contact: state.player.contact, nric4: state.player.nric4,
    gender: state.player.gender, occupation: state.player.occupation,
    ageGroup: state.player.ageGroup, consent: state.player.consent ? "Yes" : "No",
    avatar: state.avatar ? state.avatar.name : "",
    level: state.level, score: state.score, totalQuestions: state.questions.length,
    timeSeconds: state.elapsed, timeFormatted: fmtTime(state.elapsed),
    answers: state.answers,
    feedbackEnjoyment: state.feedback.enjoyment, feedbackLearning: state.feedback.learning,
    feedbackRecommend: feedbackForm.recommend || "", feedbackComments: feedbackForm.comments || ""
  };
}

/* ---------------------------------------------------------------------
   15) FORMSPREE
--------------------------------------------------------------------- */
async function sendToFormspree(record) {
  if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
    console.warn("Formspree endpoint not configured — saved locally only.");
    return false;
  }
  try {
    const payload = {
      ...record,
      answersReadable: record.answers
        .map(a => `D${a.door} [${a.correct ? "✓" : "✗"}] ${a.room} → chose "${a.chosenText}" (correct: "${a.correctText}")`)
        .join("\n"),
      answersJson: JSON.stringify(record.answers)
    };
    delete payload.answers;
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error("Formspree submission failed:", err);
    return false;
  }
}

/* ---------------------------------------------------------------------
   16) LOCAL STORAGE
--------------------------------------------------------------------- */
function getLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveLocal(record) {
  const all = getLocal(); all.push(record);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); }
  catch (e) { console.error("Could not save locally:", e); }
}

/* ---------------------------------------------------------------------
   17) PLAY AGAIN
--------------------------------------------------------------------- */
$("#btn-play-again").addEventListener("click", () => {
  sfx.click();
  state.player = null; state.avatar = null; state.level = null;
  state.feedback = { enjoyment: 0, learning: 0 };
  $("#register-form").reset();
  $("#feedback-form").reset();
  $$(".star").forEach(s => s.classList.remove("on"));
  $$(".avatar-pick").forEach(x => x.classList.remove("selected"));
  $("#btn-avatar-next").disabled = true;
  showScreen("welcome");
});

/* ---------------------------------------------------------------------
   18) ORGANISER DASHBOARD
--------------------------------------------------------------------- */
$("#btn-admin-link").addEventListener("click", openAdmin);
if (new URLSearchParams(location.search).has("admin")) {
  document.addEventListener("DOMContentLoaded", openAdmin);
}
function openAdmin() { renderAdmin(); showScreen("admin"); }

function renderAdmin() {
  const all = getLocal();
  const total = all.length;
  const easy = all.filter(r => r.level === "easy").length;
  const normal = all.filter(r => r.level === "normal").length;
  const avg = total ? (all.reduce((s, r) => s + (r.score || 0), 0) / total).toFixed(1) : "0";
  $("#admin-stats").innerHTML = `
    <div class="stat"><span class="stat-num">${total}</span><span class="stat-label">Players (this device)</span></div>
    <div class="stat"><span class="stat-num">${easy}</span><span class="stat-label">Easy mode</span></div>
    <div class="stat"><span class="stat-num">${normal}</span><span class="stat-label">Normal mode</span></div>
    <div class="stat"><span class="stat-num">${avg}</span><span class="stat-label">Avg score</span></div>`;
  const table = $("#admin-table");
  if (!total) { table.innerHTML = `<tr><td class="empty">No local submissions yet.</td></tr>`; return; }
  const head = `<tr><th>Time</th><th>Name</th><th>Email</th><th>Contact</th><th>NRIC</th>
    <th>Gender</th><th>Occupation</th><th>Group</th><th>Avatar</th><th>Level</th><th>Score</th><th>Duration</th></tr>`;
  const rows = all.slice().reverse().map(r => `<tr>
    <td>${escapeHtml(new Date(r.submittedAt).toLocaleString())}</td>
    <td>${escapeHtml(r.fullName)}</td><td>${escapeHtml(r.email)}</td>
    <td>${escapeHtml(r.contact)}</td><td>${escapeHtml(r.nric4)}</td>
    <td>${escapeHtml(r.gender)}</td><td>${escapeHtml(r.occupation)}</td>
    <td>${escapeHtml(r.ageGroup)}</td><td>${escapeHtml(r.avatar || "")}</td>
    <td>${escapeHtml(r.level)}</td><td>${escapeHtml(r.score + "/" + r.totalQuestions)}</td>
    <td>${escapeHtml(r.timeFormatted)}</td></tr>`).join("");
  table.innerHTML = head + rows;
}

$("#btn-export-csv").addEventListener("click", () => {
  const all = getLocal();
  if (!all.length) return alert("No data to export.");
  const cols = ["submittedAt","fullName","email","contact","nric4","gender","occupation",
    "ageGroup","consent","avatar","level","score","totalQuestions","timeSeconds","timeFormatted",
    "feedbackEnjoyment","feedbackLearning","feedbackRecommend","feedbackComments","answers"];
  const esc = v => `"${(typeof v === "object" ? JSON.stringify(v) : String(v ?? "")).replace(/"/g, '""')}"`;
  const lines = [cols.join(",")];
  all.forEach(r => lines.push(cols.map(c => esc(r[c])).join(",")));
  download(lines.join("\n"), "cyber-escape-data.csv", "text/csv");
});
$("#btn-export-json").addEventListener("click", () => {
  const all = getLocal();
  if (!all.length) return alert("No data to export.");
  download(JSON.stringify(all, null, 2), "cyber-escape-data.json", "application/json");
});
$("#btn-clear-data").addEventListener("click", () => {
  if (confirm("Delete ALL locally stored submissions on this device? This cannot be undone.\n\nExport first if you still need the data.")) {
    localStorage.removeItem(STORAGE_KEY); renderAdmin();
  }
});
function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
