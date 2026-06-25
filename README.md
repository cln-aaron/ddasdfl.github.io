# 🛡️ Cyber Escape — Navigating AI & Digital Safety With Confidence

An interactive **online escape room** that gamifies learning about **scam prevention and AI awareness**, built for community events and roadshows.

Players pick an **animal hero**, then **walk around** *The Digital Vault* (top-down, Roblox-style) — reaching a glowing terminal in each themed room where a scam/AI puzzle blocks the locked door. Solve it to unlock the door and explore onward until you escape.

## ✨ Features

- **Walk-around escape room**: a touch-controlled top-down world (canvas). Your animal hero explores 10 themed rooms (Mail Room, Treasure Vault, Hall of Mirrors…) connected by locked doors.
- **iPad / touch first**: on-screen **virtual joystick**, **tap-to-move**, and keyboard (arrows / WASD) on desktop. Zoom/scroll locked during play.
- **Puzzles as obstacles**: reach a room's terminal → puzzle pops up → answer correctly to unlock that room's door. Wrong answers teach you and let you retry.
- **12 animal avatars** to pick from after sign-up.
- **One game, two difficulty modes**
  - 🌱 **Easy** — designed for *kids & seniors* (everyday scams, gentle pace, hints)
  - ⚡ **Normal** — designed for *PMET / working adults* (deepfakes, BEC, AI data risks)
- **5 challenges per level** (10 total), each with a teaching moment after every answer.
- **PDPA consent page** (DDAS/IMDA wording) shown before any data is collected.
- **Personal particulars** collected: Full name, Age, Email, Contact number, Participant demographics.
- **Stores every option each participant selects** (their choice + correctness + number of attempts) for reporting.
- **Programme feedback** (satisfaction, usefulness, motivation [1–5]; would-apply & interested-in-other [Yes/No]; keen areas & comments).
- **Confetti, sound effects (mute toggle), live timer, key/score counter.**
- **One combined submission**: front registration info + end-of-game score/answers + feedback are gathered, then sent together to **Formspree** in a single POST — with an automatic **local backup + CSV/JSON export** fallback.

## 🚀 Quick Start (local preview)

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 🧾 What gets sent, and when

All data is captured first, then sent in **one** submission:

1. **At sign-up (front):** PDPA consent, then name, age, email, contact, participant demographics.
2. **During the game:** every option chosen per room, whether the first attempt was correct, and number of attempts.
3. **At the end:** final score, time taken, and the feedback ratings/comments.

When the player taps **Submit & Finish**, all three are merged into one record and POSTed to Formspree (and saved locally as backup). ✅ Yes — collecting info at the front and the score at the end and sending them together is exactly how it works.

## ⚙️ Formspree setup & troubleshooting

The endpoint is already set in `assets/js/app.js`:

```js
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgojvvaz";
```

**If submissions aren't arriving, check these (in order):**

1. **Activate the form (most common cause).** Formspree requires a one-time confirmation. Complete one full play-through on the **live site** so a real submission is sent, then open the inbox of the email tied to your Formspree account and click the **"Confirm"/activation** link Formspree sends. Until you do, submissions won't show up.
2. **Test on the deployed site, not `file://`.** Open the GitHub Pages URL (https). Browser security/CORS can block form posts from a local file opened directly.
3. **Open the browser console** (on the live site) and finish a game. The code logs the exact Formspree response, e.g. `Formspree returned HTTP 422 …`. The Thank-You screen also hints when the form isn't active yet.
4. **Check your plan limits.** Formspree's free tier caps monthly submissions — a busy roadshow can hit it. The local backup + CSV export ensures nothing is lost.
5. **Confirm the form ID** matches your Formspree dashboard (`mgojvvaz`).

> Even if Formspree is down or unconfirmed, every submission is still saved on the device and can be exported from the Organiser dashboard (CSV/JSON).

## 🔐 Organiser dashboard (local backup)

- Click **"Organiser access"** in the footer, or visit `index.html?admin`.
- View all submissions saved **on that device**, and **Export CSV / JSON**.
- Each tablet stores its own data locally — export from each and merge, or rely on Formspree for central aggregation.

## 🌐 Publishing on GitHub Pages

This repo is `ddasdfl.github.io`. In **Settings → Pages**, set the source branch and folder (root). The game is plain HTML/CSS/JS — no build step.

## 📁 Structure

```
index.html              Game shell & all screens (welcome, sign-up, avatar, level, game, result, feedback, admin)
assets/css/style.css    Playful Roblox-style theme, world/joystick/modal styles & animations
assets/js/data.js       Avatars, room locations & question bank — edit to customise
assets/js/app.js        Top-down walk-around engine, controls, puzzles, sound, data capture, Formspree + export
```

## ✏️ Customising questions

Edit `assets/js/data.js`. Each question has: `room`, `prompt`, `options`, `answer` (0-based index of correct option), `hint`, and `explain` (the learning point).

## 🔏 Data & privacy note

Personal data is collected only after explicit PDPA consent (DDAS/IMDA). Use it only for the event and follow-up, keep your Formspree account secured, and clear local device data after the event using the dashboard's **Clear Local Data** button.
