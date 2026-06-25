/* =====================================================================
   Cyber Escape — Question Bank
   Theme: Navigating AI & Digital Safety With Confidence
   Each question = one "door/lock" in the escape room.
   - room:     the themed room shown to the player
   - prompt:   the scenario / question
   - options:  answer choices
   - answer:   index (0-based) of the correct option
   - hint:     a nudge shown on demand
   - explain:  the teaching moment shown after answering
   ===================================================================== */

/* ---------------------------------------------------------------------
   AVATARS — players pick an animal character that travels the vault
--------------------------------------------------------------------- */
const AVATARS = [
  { id: "fox",     emoji: "🦊", name: "Finn the Fox",     trait: "Clever & quick" },
  { id: "owl",     emoji: "🦉", name: "Ollie the Owl",    trait: "Wise watcher" },
  { id: "cat",     emoji: "🐱", name: "Coco the Cat",     trait: "Curious & careful" },
  { id: "panda",   emoji: "🐼", name: "Pip the Panda",    trait: "Calm & steady" },
  { id: "tiger",   emoji: "🐯", name: "Theo the Tiger",   trait: "Brave & bold" },
  { id: "rabbit",  emoji: "🐰", name: "Ruby the Rabbit",  trait: "Fast thinker" },
  { id: "monkey",  emoji: "🐵", name: "Milo the Monkey",  trait: "Playful & sharp" },
  { id: "dog",     emoji: "🐶", name: "Daisy the Dog",    trait: "Loyal & alert" },
  { id: "koala",   emoji: "🐨", name: "Kai the Koala",    trait: "Cool & collected" },
  { id: "lion",    emoji: "🦁", name: "Leo the Lion",     trait: "Fearless leader" },
  { id: "penguin", emoji: "🐧", name: "Percy the Penguin", trait: "Smooth operator" },
  { id: "frog",    emoji: "🐸", name: "Freddie the Frog", trait: "Leaps to safety" }
];

/* ---------------------------------------------------------------------
   LOCATIONS — the 10 themed "rooms" the avatar travels through.
   Reused for both Easy and Normal (each level has 10 doors).
   Each room: a name, an emoji icon, a color gradient, and floating
   decoration emojis to build the scene.
--------------------------------------------------------------------- */
const LOCATIONS = [
  { name: "The Mail Room",       icon: "📧", grad: ["#3a2d6b", "#5b3fa8"], decor: ["✉️","📩","📨","⚠️"] },
  { name: "The Phone Booth",     icon: "📞", grad: ["#0f4c5c", "#1d8a9e"], decor: ["☎️","📱","🔔","❓"] },
  { name: "The Link Tunnel",     icon: "🔗", grad: ["#5c1f4a", "#9e2f7a"], decor: ["🔗","📦","🚚","⚠️"] },
  { name: "The Friendship Park",  icon: "🌳", grad: ["#1f5c2f", "#3a9e4f"], decor: ["🌳","🪑","💬","🤝"] },
  { name: "The Password Vault",  icon: "🔐", grad: ["#5c4a1f", "#9e842f"], decor: ["🔑","🔒","🗝️","💎"] },
  { name: "The Wi-Fi Cafe",      icon: "☕", grad: ["#5c2f1f", "#9e552f"], decor: ["☕","📶","💻","🍰"] },
  { name: "The Treasure Vault",  icon: "💎", grad: ["#5c4612", "#caa02f"], decor: ["💰","💎","🪙","🏆"] },
  { name: "The Computer Lab",    icon: "💻", grad: ["#1f3a5c", "#2f6f9e"], decor: ["💻","🖥️","🐛","⚠️"] },
  { name: "The Town Square",     icon: "📢", grad: ["#3a1f5c", "#6f2f9e"], decor: ["📢","🏛️","🗣️","📸"] },
  { name: "The Hall of Mirrors", icon: "🪞", grad: ["#1f5c5c", "#2f9e9e"], decor: ["🪞","🎭","👁️","✨"] }
];

const QUESTIONS = {
  /* ---------------- EASY: Kids & Seniors ---------------- */
  easy: [
    {
      room: "Door 1 · The Prize Pop-up",
      prompt: "A bright pop-up says: “🎉 Congratulations! You are today's lucky winner of a new phone. Click here to claim within 5 minutes!” What should you do?",
      options: [
        "Click quickly before the timer ends",
        "Close the pop-up — real prizes don't work like this",
        "Enter your bank details to receive the phone",
        "Share it with friends so they can win too"
      ],
      answer: 1,
      hint: "Genuine companies don't make you rush or ask for bank details to 'claim' a surprise prize.",
      explain: "Surprise prizes with countdown timers are a classic scam. The rush is designed to stop you from thinking. Close it and never enter personal or bank details."
    },
    {
      room: "Door 2 · The Secret Code",
      prompt: "Someone calls saying they're from your bank and asks you to read out the One-Time Password (OTP) sent to your phone. What do you do?",
      options: [
        "Read it out — they said they're the bank",
        "Never share it; hang up and call the bank using the number on your card",
        "Send it by text instead of saying it",
        "Give them only half the code to be safe"
      ],
      answer: 1,
      hint: "An OTP is like a key to your money. Banks will NEVER ask you to share it.",
      explain: "No real bank, police officer, or government staff will ever ask for your OTP. Anyone who does is a scammer. Hang up and verify using an official number."
    },
    {
      room: "Door 3 · The Strange Link",
      prompt: "You get an SMS: “Your parcel is held. Pay $0.50 delivery fee here: http://post-sg-claim.xyz”. What's the safest move?",
      options: [
        "Tap the link and pay — it's only 50 cents",
        "Don't tap; check directly with the official courier app/website",
        "Reply STOP to the message",
        "Forward it to everyone you know"
      ],
      answer: 1,
      hint: "Look at the web address. Odd endings like '.xyz' and tiny 'fees' are warning signs.",
      explain: "Fake delivery texts trick you into entering card details on a copycat site. The tiny fee is bait. Always check parcels through the official app or website, not the link."
    },
    {
      room: "Door 4 · The Friendly Stranger",
      prompt: "A stranger online becomes very friendly fast, then asks to borrow money for an 'emergency'. What should you do?",
      options: [
        "Send the money — they sound nice and desperate",
        "Don't send money; be cautious with strangers asking for cash online",
        "Send a smaller amount as a test",
        "Give them your account number so they can pay you back later"
      ],
      answer: 1,
      hint: "Real friends earned over time don't suddenly need your money urgently.",
      explain: "Scammers build trust quickly, then invent emergencies. Never send money to someone you've only met online. Talk to a family member if you feel pressured."
    },
    {
      room: "Door 5 · The Password Vault",
      prompt: "Which of these is the SAFEST password?",
      options: [
        "123456",
        "password",
        "Your name and birth year",
        "A long phrase like 'BlueTeapot7Rainy!Morning'"
      ],
      answer: 3,
      hint: "Longer and harder to guess is better. Avoid things people can find out about you.",
      explain: "Long passphrases mixing words, numbers and symbols are strong and easy to remember. Avoid names, birthdays and common words like 'password' or '123456'."
    },
    {
      room: "Door 6 · The Free Wi-Fi Trap",
      prompt: "You're at a café using free public Wi-Fi. Is it a good time to log in to your bank account?",
      options: [
        "Yes, public Wi-Fi is always safe",
        "Better to wait — use mobile data or do banking at home",
        "Yes, if the Wi-Fi has a fun name",
        "Yes, as long as it's busy"
      ],
      answer: 1,
      hint: "Other people might be snooping on open Wi-Fi networks.",
      explain: "Public Wi-Fi can be watched by strangers. Avoid logging into banking or sensitive accounts on it — use your mobile data or wait until you're on a trusted network."
    },
    {
      room: "Door 7 · The Lucky Lottery Call",
      prompt: "A caller says you've won a big overseas lottery, but you must first pay a 'processing fee' to release the winnings. What is true?",
      options: [
        "Pay the fee to get the prize",
        "It's a scam — you can't win a lottery you never entered, and real prizes don't need upfront fees",
        "Pay using gift cards as they suggest",
        "Give your IC and bank details to speed it up"
      ],
      answer: 1,
      hint: "Did you ever buy a ticket for this lottery?",
      explain: "If you didn't enter, you can't win. Demands for upfront fees — especially via gift cards or transfers — are always scams. Just hang up."
    },
    {
      room: "Door 8 · The Scary Warning",
      prompt: "A loud pop-up appears: “⚠️ VIRUS DETECTED! Your computer is infected. Call this number NOW for support.” What should you do?",
      options: [
        "Call the number and let them fix it remotely",
        "Don't call; close the page — real virus alerts don't beg you to call a number",
        "Pay them to remove the virus",
        "Let them remote-control your computer"
      ],
      answer: 1,
      hint: "Fake 'tech support' wants to scare you into calling and handing over control.",
      explain: "These are fake tech-support scams. Never call the number or allow remote access. Close the browser; if unsure, ask a trusted person or restart your device."
    },
    {
      room: "Door 9 · The Oversharing Door",
      prompt: "Which of these is safest to keep PRIVATE and not post publicly online?",
      options: [
        "Your favourite colour",
        "A photo of a sunset",
        "Your full IC number, home address and bank details",
        "A nice recipe"
      ],
      answer: 2,
      hint: "Think about what a scammer could misuse to pretend to be you.",
      explain: "Sensitive details like your full IC, address and bank info can be used to impersonate you or target you. Share those only when truly necessary, never publicly."
    },
    {
      room: "Door 10 · The Familiar Voice (AI)",
      prompt: "You get a video/voice call that looks and sounds like your grandchild, urgently asking you to transfer money. AI can now fake voices and faces. What's the safest step?",
      options: [
        "Transfer immediately — it looks just like them",
        "Pause, hang up, and call your family member back on their real number to check",
        "Send money to a 'friend's' account they give you",
        "Keep it secret as they ask"
      ],
      answer: 1,
      hint: "AI can copy a voice or face. Always verify through a number you already trust.",
      explain: "AI 'deepfakes' can clone voices and faces convincingly. If someone urgently asks for money, hang up and call your loved one back directly. A real family member won't mind you double-checking."
    }
  ],

  /* ---------------- NORMAL: PMET / Working Adults ---------------- */
  normal: [
    {
      room: "Door 1 · The Inbox Breach",
      prompt: "You receive an email appearing to be from your CFO: “I'm in a meeting — urgently process this vendor payment, here are the new bank details. Keep it confidential.” What's the correct response?",
      options: [
        "Process it immediately to avoid annoying the CFO",
        "Verify out-of-band: call the CFO on a known number before acting on changed payment details",
        "Reply to the email to confirm the new account",
        "Forward it to finance and approve at the same time"
      ],
      answer: 1,
      hint: "Urgency + secrecy + changed bank details = classic Business Email Compromise.",
      explain: "This is Business Email Compromise (BEC). Always verify payment changes through a separate, trusted channel (a known phone number) — never by replying to the same email thread, which the attacker controls."
    },
    {
      room: "Door 2 · The Cloned Voice (AI)",
      prompt: "On a call, your 'manager's' voice instructs you to buy gift cards for a client and send the codes. The voice is convincing. What's the red flag and right action?",
      options: [
        "Voices can't be faked, so comply",
        "AI voice-cloning is real; verify via a second channel and refuse gift-card/code requests",
        "Send the codes but keep the receipts",
        "Ask for the request in writing, then proceed without verifying"
      ],
      answer: 1,
      hint: "Gift-card payments are untraceable — a hallmark of fraud, even with a familiar voice.",
      explain: "AI voice cloning makes deepfake 'vishing' easy. Legitimate business is never settled in gift-card codes. Verify any unusual request through a separate, trusted channel before acting."
    },
    {
      room: "Door 3 · The Second Key",
      prompt: "Which approach gives the strongest protection for your work accounts?",
      options: [
        "A strong password alone is enough",
        "Reuse one strong password everywhere",
        "Unique passwords (via a password manager) plus phishing-resistant MFA (authenticator app or security key)",
        "SMS codes as your only login step"
      ],
      answer: 2,
      hint: "Even a great password can be stolen — a second, separate factor matters most.",
      explain: "Use unique passwords (a password manager helps) AND multi-factor authentication. App-based or hardware-key MFA resists phishing far better than SMS, which can be intercepted or SIM-swapped."
    },
    {
      room: "Door 4 · The Lookalike Domain",
      prompt: "A login link reads: https://accounts-microsoft-secure.com/login . Why should you be suspicious?",
      options: [
        "It uses HTTPS, so it must be safe",
        "The domain is misspelled/non-official ('microsoft', odd subdomains) — a phishing tactic",
        "Long URLs are always fine",
        "It has the word 'secure' in it, so it's secure"
      ],
      answer: 1,
      hint: "HTTPS only means encrypted, not trustworthy. Read the domain carefully.",
      explain: "Attackers register lookalike domains (typos, extra words, odd subdomains). HTTPS just means the connection is encrypted — not that the site is legitimate. Always check the exact spelling of the real domain."
    },
    {
      room: "Door 5 · The Helpful Chatbot (AI)",
      prompt: "You want a public AI chatbot to summarise a document. Which content is RISKY to paste into a public/consumer AI tool?",
      options: [
        "A blog post that's already public",
        "Confidential client data, source code, or unreleased financials",
        "A generic list of meeting tips",
        "A recipe you found online"
      ],
      answer: 1,
      hint: "Assume anything you paste into a public AI tool could be stored or reviewed.",
      explain: "Don't paste confidential, personal, or proprietary data into public AI tools — it may be retained or used for training, creating a data-leak and compliance risk. Use approved enterprise tools for sensitive work."
    },
    {
      room: "Door 6 · The Guaranteed Returns",
      prompt: "A slick 'investment mentor' on social media promises guaranteed 30% monthly returns with no risk, and pushes you to act today. What's the strongest red flag?",
      options: [
        "They have a verified-looking profile",
        "'Guaranteed' high returns with 'no risk' plus urgency — hallmarks of an investment scam",
        "They share daily charts",
        "They have many followers"
      ],
      answer: 1,
      hint: "In real investing, higher returns always carry higher risk. 'Guaranteed' is the lie.",
      explain: "No legitimate investment guarantees high returns with zero risk. Urgency, secrecy, and 'guaranteed' profits define investment and crypto scams. Verify advisers/platforms with official regulators before sending money."
    },
    {
      room: "Door 7 · The Scan-to-Pay Trap",
      prompt: "A parking notice / e-payment sticker has a QR code to 'settle your fine instantly'. Why be cautious before scanning (quishing)?",
      options: [
        "QR codes are always government-issued",
        "QR codes can hide malicious links/payment pages; verify via official channels before scanning or paying",
        "QR codes can't lead to phishing sites",
        "Scanning is safe as long as you're on Wi-Fi"
      ],
      answer: 1,
      hint: "A QR code is just a hidden link — you can't read it with your eyes.",
      explain: "'Quishing' uses QR codes to send you to phishing or fake payment pages, sometimes via stickers placed over real ones. Pay fines/bills only through official apps or websites you navigate to yourself."
    },
    {
      room: "Door 8 · The Dream Job",
      prompt: "A 'recruiter' offers a high-paying remote job after a quick chat, then asks for a deposit/training fee and your bank login to 'set up payroll'. What's true?",
      options: [
        "Pay the fee to secure the role",
        "It's a job scam — legitimate employers never charge fees or ask for your banking login",
        "Share your login since it's for payroll",
        "Accept and start work before any checks"
      ],
      answer: 1,
      hint: "Real jobs pay you — they don't ask you to pay them or hand over passwords.",
      explain: "Job scams lure you with easy, high pay, then extract fees or credentials, or recruit you as a money mule. Real employers don't charge fees or request your bank login. Verify the company independently."
    },
    {
      room: "Door 9 · The Long Game",
      prompt: "An online contact you've never met in person grows romantic over weeks, then introduces a 'can't-miss' crypto opportunity and asks you to invest via their link. This pattern is:",
      options: [
        "A normal way to find good investments",
        "Romance + investment scam ('pig butchering') — emotional grooming to extract money",
        "Safe because you've chatted for weeks",
        "Fine as long as the platform looks professional"
      ],
      answer: 1,
      hint: "Trust built only online + a sudden investment 'tip' is a known scam combo.",
      explain: "So-called 'pig butchering' scams blend romance with fake investment platforms. The relationship and the 'profits' you see are fake. Never invest through a link from someone you've only met online."
    },
    {
      room: "Door 10 · The Viral Claim (AI)",
      prompt: "A realistic video of a public figure making a shocking announcement is spreading fast. Before you believe or share it, you should:",
      options: [
        "Share immediately — it looks real",
        "Verify with trusted news sources and check for deepfake signs; don't spread unverified content",
        "Assume video can't be faked",
        "Believe it because many people reposted it"
      ],
      answer: 1,
      hint: "AI can generate convincing fake video and audio. Confirm before you trust or share.",
      explain: "AI-generated deepfakes and misinformation spread quickly. Cross-check shocking claims against reputable news outlets, look for unnatural artefacts, and pause before sharing — your share lends it credibility."
    }
  ]
};
