# 🛡️ Cyber Escape — Navigating AI & Digital Safety With Confidence

An interactive **online escape room** that gamifies learning about **scam prevention and AI awareness**, built for community events and roadshows.

Players pick an **animal hero**, then travel room-to-room through *The Digital Vault* — meeting a locked-door scam/AI challenge in each themed location and unlocking their way to escape.

## ✨ Features

- **Roblox-style journey**: choose an animal avatar that walks through 10 themed scenes (Mail Room, Lucky Casino, Hall of Mirrors…), with a level map, bouncy animations, confetti, and sound effects
- **12 animal avatars** to pick from after sign-up
- **One game, two difficulty modes**
  - 🌱 **Easy** — designed for *kids & seniors* (everyday scams, gentle pace, hints)
  - ⚡ **Normal** — designed for *PMET / working adults* (deepfakes, BEC, AI data risks)
- **10 challenges per level** (20 total), each a themed "door" with a teaching moment after every answer
- **Participant registration** collecting: Full name, Email, Contact number, last 4 of NRIC/FIN, Gender, Occupation, and age/needs group
- **Stores every option each participant selects** (which choice, right or wrong) for reporting
- **Post-game feedback** (enjoyment, learning, recommendation, comments)
- **Live timer, score, progress, hints**, and a polished neon UI that works on phones and tablets
- **Data collection via Formspree** with an automatic **local backup + CSV/JSON export** fallback

## 🚀 Quick Start (local preview)

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## ⚙️ Setup: connect Formspree (required for central data collection)

1. Create a free form at **https://formspree.io**.
2. Copy your form endpoint — it looks like `https://formspree.io/f/abcdwxyz`.
3. Open `assets/js/app.js` and replace the placeholder near the top:

   ```js
   const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
   ```

4. Commit and deploy. Every submission will now be POSTed to your Formspree inbox/spreadsheet.

> Until this is set, the game still works fully — submissions are saved on the device and can be exported from the Organiser dashboard.

> ⚠️ **Formspree free tier caps monthly submissions.** For a busy roadshow, check your plan limits in advance. The local backup ensures nothing is lost if the limit/internet is hit.

## 🔐 Organiser dashboard (local backup)

- Click **"Organiser access"** in the footer, or visit `index.html?admin`.
- View all submissions saved **on that device**, and **Export CSV / JSON**.
- Each tablet stores its own data locally — export from each and merge, or rely on Formspree for central aggregation.

## 🌐 Publishing on GitHub Pages

This repo is `ddasdfl.github.io`. In **Settings → Pages**, set the source branch and folder (root). The game is plain HTML/CSS/JS — no build step.

## 📁 Structure

```
index.html              Game shell & all screens (welcome, sign-up, avatar, level, game, result, feedback, admin)
assets/css/style.css    Playful Roblox-style theme, scenes & animations
assets/js/data.js       Avatars, locations (scenes) & question bank — edit to customise
assets/js/app.js        Game logic, journey/scene engine, sound, data capture, Formspree + export
```

## ✏️ Customising questions

Edit `assets/js/data.js`. Each question has: `room`, `prompt`, `options`, `answer` (0-based index of correct option), `hint`, and `explain` (the learning point).

## 🔏 Data & privacy note

Personal data (incl. last 4 NRIC) is collected with explicit consent. Use it only for the event and follow-up, keep your Formspree account secured, and clear local device data after the event using the dashboard's **Clear Local Data** button.
