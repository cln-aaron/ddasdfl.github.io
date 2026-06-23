/* =====================================================================
   Cyber Escape — Application Logic
   Static single-page game. No build step required.
   Data flow: Registration → Level → Game → Result → Feedback → Submit
   Submissions are POSTed to Formspree, with a localStorage backup
   (+ CSV/JSON export from the organiser dashboard) so nothing is lost
   if the internet drops at the roadshow.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) CONFIG  —  ⚙️  ORGANISER: PASTE YOUR FORMSPREE FORM ID BELOW
   ---------------------------------------------------------------------
   1. Create a free form at https://formspree.io
   2. Copy your endpoint, e.g. https://formspree.io/f/abcdwxyz
   3. Replace the value below.
   Until you do, the game still works fully — data is saved locally and
   can be exported as CSV/JSON from the Organiser dashboard.
--------------------------------------------------------------------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgojvvaz";

const STORAGE_KEY = "cyberEscape.submissions.v1";

/* ---------------------------------------------------------------------
   2) STATE
--------------------------------------------------------------------- */
const state = {
  player: null,        // registration data
  level: null,         // 'easy' | 'normal'
  questions: [],       // active question set
  index: 0,            // current question index
  score: 0,            // doors unlocked (correct answers)
  answers: [],         // {door, room, question, chosen, chosenText, correct, correctText}
  startTime: null,
  elapsed: 0,
  timerId: null,
  locked: false,       // prevents double-answering
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

function fmtTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

/* ---------------------------------------------------------------------
   4) NAVIGATION  (back buttons & generic data-goto)
--------------------------------------------------------------------- */
$$("[data-goto]").forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.goto));
});

$("#btn-begin").addEventListener("click", () => showScreen("register"));

/* ---------------------------------------------------------------------
   5) REGISTRATION
--------------------------------------------------------------------- */
$("#register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const err = $("#register-error");
  err.hidden = true;

  if (!form.checkValidity()) {
    err.textContent = "Please fill in all required fields (marked *) correctly.";
    err.hidden = false;
    form.reportValidity();
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  state.player = {
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    contact: data.contact.trim(),
    nric4: (data.nric4 || "").trim().toUpperCase(),
    gender: data.gender,
    occupation: data.occupation.trim(),
    ageGroup: data.ageGroup,
    consent: !!data.consent
  };
  showScreen("level");
});

/* ---------------------------------------------------------------------
   6) LEVEL SELECT → START GAME
--------------------------------------------------------------------- */
$$(".level-card").forEach(card => {
  card.addEventListener("click", () => startGame(card.dataset.level));
});

function startGame(level) {
  state.level = level;
  state.questions = QUESTIONS[level];
  state.index = 0;
  state.score = 0;
  state.answers = [];
  state.locked = false;

  $("#q-total").textContent = state.questions.length;
  $("#score").textContent = "0";

  // start timer
  state.startTime = Date.now();
  state.elapsed = 0;
  clearInterval(state.timerId);
  $("#timer").textContent = "00:00";
  state.timerId = setInterval(() => {
    state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    $("#timer").textContent = fmtTime(state.elapsed);
  }, 1000);

  showScreen("game");
  renderQuestion();
}

/* ---------------------------------------------------------------------
   7) GAME RENDER & ANSWER
--------------------------------------------------------------------- */
function renderQuestion() {
  const q = state.questions[state.index];
  state.locked = false;

  $("#q-current").textContent = state.index + 1;
  $("#room-name").textContent = q.room;
  $("#question-text").textContent = q.prompt;
  $("#progress-bar").style.width =
    `${(state.index / state.questions.length) * 100}%`;

  // lock indicators
  const lockRow = $("#lock-row");
  lockRow.innerHTML = state.questions
    .map((_, i) => {
      let cls = "lock";
      if (i < state.index) cls += " unlocked";
      if (i === state.index) cls += " current";
      return `<span class="${cls}">${i < state.index ? "🔓" : "🔒"}</span>`;
    })
    .join("");

  // options
  const optWrap = $("#options");
  optWrap.innerHTML = "";
  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.type = "button";
    btn.innerHTML = `<span class="option-key">${String.fromCharCode(65 + i)}</span><span class="option-text">${escapeHtml(text)}</span>`;
    btn.addEventListener("click", () => handleAnswer(i, btn));
    optWrap.appendChild(btn);
  });

  // reset feedback + hint
  $("#feedback").hidden = true;
  $("#hint-text").hidden = true;
  $("#hint-text").textContent = q.hint;
  $("#btn-hint").disabled = false;
}

$("#btn-hint").addEventListener("click", () => {
  $("#hint-text").hidden = false;
  $("#btn-hint").disabled = true;
});

function handleAnswer(choiceIndex, btnEl) {
  if (state.locked) return;
  state.locked = true;

  const q = state.questions[state.index];
  const correct = choiceIndex === q.answer;
  if (correct) state.score++;

  // record answer (this is the "selection of options" stored per participant)
  state.answers.push({
    door: state.index + 1,
    room: q.room,
    question: q.prompt,
    chosen: choiceIndex,
    chosenText: q.options[choiceIndex],
    correct,
    correctIndex: q.answer,
    correctText: q.options[q.answer]
  });

  // visual feedback on options
  const optButtons = $$("#options .option");
  optButtons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add("is-correct");
    if (i === choiceIndex && !correct) b.classList.add("is-wrong");
  });

  $("#score").textContent = state.score;

  // feedback panel
  const fb = $("#feedback");
  const head = $("#feedback-head");
  head.className = "feedback-head " + (correct ? "ok" : "no");
  head.textContent = correct ? "🔓 Door unlocked! Correct." : "🔒 The door stays shut. Not quite.";
  $("#feedback-body").textContent = q.explain;
  $("#btn-next").textContent =
    state.index === state.questions.length - 1 ? "Finish & Escape →" : "Next Door →";
  fb.hidden = false;
  $("#btn-hint").disabled = true;
}

$("#btn-next").addEventListener("click", () => {
  if (state.index < state.questions.length - 1) {
    state.index++;
    renderQuestion();
  } else {
    finishGame();
  }
});

/* ---------------------------------------------------------------------
   8) RESULT
--------------------------------------------------------------------- */
function finishGame() {
  clearInterval(state.timerId);
  state.elapsed = Math.floor((Date.now() - state.startTime) / 1000);

  const total = state.questions.length;
  const passed = state.score >= Math.ceil(total * 0.7); // 70% to "escape"

  $("#progress-bar").style.width = "100%";
  $("#result-emoji").textContent = passed ? "🎉" : "🧩";
  $("#result-title").textContent = passed ? "You Escaped!" : "So Close!";
  $("#result-lede").textContent = passed
    ? "Brilliant work — you spotted the scams and AI traps and made it out of the Digital Vault. You're navigating the digital world with confidence!"
    : "You unlocked some doors but a few tricks caught you out. Review the tips you learned — every scam you can spot keeps you safer.";

  $("#stat-score").textContent = `${state.score}/${total}`;
  $("#stat-time").textContent = fmtTime(state.elapsed);
  $("#stat-level").textContent = state.level === "easy" ? "Easy" : "Normal";

  showScreen("result");
}

$("#btn-to-feedback").addEventListener("click", () => showScreen("feedback"));

/* ---------------------------------------------------------------------
   9) FEEDBACK (star ratings)
--------------------------------------------------------------------- */
function buildRating(containerId, key) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("button");
    star.type = "button";
    star.className = "star";
    star.textContent = "★";
    star.setAttribute("aria-label", `${i} star${i > 1 ? "s" : ""}`);
    star.addEventListener("click", () => {
      state.feedback[key] = i;
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

  // Always back up locally first
  saveLocal(record);

  // Then try to send to Formspree
  $("#thanks-status").textContent = "Submitting your responses…";
  showScreen("thanks");

  const ok = await sendToFormspree(record);
  $("#thanks-status").textContent = ok
    ? "✅ Your responses have been recorded. Thank you!"
    : "✅ Saved on this device. (Online submission unavailable — organisers will sync it later.)";
});

/* ---------------------------------------------------------------------
   10) BUILD SUBMISSION RECORD
--------------------------------------------------------------------- */
function buildRecord(feedbackForm) {
  return {
    submittedAt: new Date().toISOString(),
    // participant
    fullName: state.player.fullName,
    email: state.player.email,
    contact: state.player.contact,
    nric4: state.player.nric4,
    gender: state.player.gender,
    occupation: state.player.occupation,
    ageGroup: state.player.ageGroup,
    consent: state.player.consent ? "Yes" : "No",
    // game
    level: state.level,
    score: state.score,
    totalQuestions: state.questions.length,
    timeSeconds: state.elapsed,
    timeFormatted: fmtTime(state.elapsed),
    // every option the participant selected
    answers: state.answers,
    // feedback
    feedbackEnjoyment: state.feedback.enjoyment,
    feedbackLearning: state.feedback.learning,
    feedbackRecommend: feedbackForm.recommend || "",
    feedbackComments: feedbackForm.comments || ""
  };
}

/* ---------------------------------------------------------------------
   11) FORMSPREE SUBMISSION
--------------------------------------------------------------------- */
async function sendToFormspree(record) {
  if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")) {
    console.warn("Formspree endpoint not configured — record saved locally only.");
    return false;
  }
  try {
    // Flatten answers into a readable string for the email/spreadsheet,
    // and keep the full JSON too.
    const payload = {
      ...record,
      answersReadable: record.answers
        .map(a => `D${a.door} [${a.correct ? "✓" : "✗"}] ${a.room} → chose "${a.chosenText}" (correct: "${a.correctText}")`)
        .join("\n"),
      answersJson: JSON.stringify(record.answers)
    };
    delete payload.answers; // avoid sending nested array; keep readable + json instead

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
   12) LOCAL STORAGE BACKUP
--------------------------------------------------------------------- */
function getLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveLocal(record) {
  const all = getLocal();
  all.push(record);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Could not save locally:", e);
  }
}

/* ---------------------------------------------------------------------
   13) PLAY AGAIN
--------------------------------------------------------------------- */
$("#btn-play-again").addEventListener("click", () => {
  // reset transient state, keep nothing about the previous player
  state.player = null;
  state.level = null;
  state.feedback = { enjoyment: 0, learning: 0 };
  $("#register-form").reset();
  $("#feedback-form").reset();
  $$(".star").forEach(s => s.classList.remove("on"));
  showScreen("welcome");
});

/* ---------------------------------------------------------------------
   14) ORGANISER DASHBOARD (admin)
--------------------------------------------------------------------- */
$("#btn-admin-link").addEventListener("click", openAdmin);

// also accessible via ?admin in the URL
if (new URLSearchParams(location.search).has("admin")) {
  document.addEventListener("DOMContentLoaded", openAdmin);
}

function openAdmin() {
  renderAdmin();
  showScreen("admin");
}

function renderAdmin() {
  const all = getLocal();
  const stats = $("#admin-stats");
  const totalPlayers = all.length;
  const easy = all.filter(r => r.level === "easy").length;
  const normal = all.filter(r => r.level === "normal").length;
  const avgScore = totalPlayers
    ? (all.reduce((s, r) => s + (r.score || 0), 0) / totalPlayers).toFixed(1)
    : "0";

  stats.innerHTML = `
    <div class="stat"><span class="stat-num">${totalPlayers}</span><span class="stat-label">Players (this device)</span></div>
    <div class="stat"><span class="stat-num">${easy}</span><span class="stat-label">Easy mode</span></div>
    <div class="stat"><span class="stat-num">${normal}</span><span class="stat-label">Normal mode</span></div>
    <div class="stat"><span class="stat-num">${avgScore}</span><span class="stat-label">Avg score</span></div>
  `;

  const table = $("#admin-table");
  if (!totalPlayers) {
    table.innerHTML = `<tr><td class="empty">No local submissions yet.</td></tr>`;
    return;
  }
  const head = `<tr>
    <th>Time</th><th>Name</th><th>Email</th><th>Contact</th><th>NRIC</th>
    <th>Gender</th><th>Occupation</th><th>Group</th><th>Level</th><th>Score</th><th>Duration</th>
  </tr>`;
  const rows = all.slice().reverse().map(r => `<tr>
    <td>${escapeHtml(new Date(r.submittedAt).toLocaleString())}</td>
    <td>${escapeHtml(r.fullName)}</td>
    <td>${escapeHtml(r.email)}</td>
    <td>${escapeHtml(r.contact)}</td>
    <td>${escapeHtml(r.nric4)}</td>
    <td>${escapeHtml(r.gender)}</td>
    <td>${escapeHtml(r.occupation)}</td>
    <td>${escapeHtml(r.ageGroup)}</td>
    <td>${escapeHtml(r.level)}</td>
    <td>${escapeHtml(r.score + "/" + r.totalQuestions)}</td>
    <td>${escapeHtml(r.timeFormatted)}</td>
  </tr>`).join("");
  table.innerHTML = head + rows;
}

/* ---- Export CSV ---- */
$("#btn-export-csv").addEventListener("click", () => {
  const all = getLocal();
  if (!all.length) return alert("No data to export.");

  const cols = [
    "submittedAt", "fullName", "email", "contact", "nric4", "gender",
    "occupation", "ageGroup", "consent", "level", "score", "totalQuestions",
    "timeSeconds", "timeFormatted", "feedbackEnjoyment", "feedbackLearning",
    "feedbackRecommend", "feedbackComments", "answers"
  ];
  const csvEscape = v => {
    const s = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [cols.join(",")];
  all.forEach(r => lines.push(cols.map(c => csvEscape(r[c])).join(",")));
  download(lines.join("\n"), "cyber-escape-data.csv", "text/csv");
});

/* ---- Export JSON ---- */
$("#btn-export-json").addEventListener("click", () => {
  const all = getLocal();
  if (!all.length) return alert("No data to export.");
  download(JSON.stringify(all, null, 2), "cyber-escape-data.json", "application/json");
});

/* ---- Clear local data ---- */
$("#btn-clear-data").addEventListener("click", () => {
  if (confirm("Delete ALL locally stored submissions on this device? This cannot be undone.\n\nExport first if you still need the data.")) {
    localStorage.removeItem(STORAGE_KEY);
    renderAdmin();
  }
});

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
