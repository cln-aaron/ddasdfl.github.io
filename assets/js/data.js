/* =====================================================================
   Cyber Escape — Game data (4 languages: en, zh, ms, ta)
   Each translatable text is an object { en, zh, ms, ta }.
   app.js reads the active language via tx(obj); missing → English.
   ===================================================================== */

const AVATARS = [
  { id:"fox",     emoji:"🦊", name:{en:"Finn the Fox",      zh:"狐狸芬恩",   ms:"Finn si Musang",     ta:"நரி ஃபின்"},        trait:{en:"Clever & quick",   zh:"聪明机敏", ms:"Bijak & pantas",            ta:"புத்திசாலி & விரைவு"} },
  { id:"owl",     emoji:"🦉", name:{en:"Ollie the Owl",     zh:"猫头鹰奥利", ms:"Ollie si Burung Hantu", ta:"ஆந்தை ஆலி"},        trait:{en:"Wise watcher",     zh:"睿智守望", ms:"Pemerhati bijaksana",       ta:"ஞானமுள்ள கண்காணிப்பாளர்"} },
  { id:"cat",     emoji:"🐱", name:{en:"Coco the Cat",      zh:"猫咪可可",   ms:"Coco si Kucing",      ta:"பூனை கோகோ"},        trait:{en:"Curious & careful",zh:"好奇谨慎", ms:"Ingin tahu & berhati-hati", ta:"ஆர்வம் & கவனம்"} },
  { id:"panda",   emoji:"🐼", name:{en:"Pip the Panda",     zh:"熊猫皮皮",   ms:"Pip si Panda",        ta:"பாண்டா பிப்"},      trait:{en:"Calm & steady",    zh:"沉稳冷静", ms:"Tenang & mantap",           ta:"அமைதி & நிலைத்தன்மை"} },
  { id:"tiger",   emoji:"🐯", name:{en:"Theo the Tiger",    zh:"老虎西奥",   ms:"Theo si Harimau",     ta:"புலி தியோ"},        trait:{en:"Brave & bold",     zh:"勇敢无畏", ms:"Berani & gagah",            ta:"தைரியம் & துணிவு"} },
  { id:"rabbit",  emoji:"🐰", name:{en:"Ruby the Rabbit",   zh:"兔子露比",   ms:"Ruby si Arnab",       ta:"முயல் ரூபி"},       trait:{en:"Fast thinker",     zh:"反应敏捷", ms:"Pemikir pantas",            ta:"விரைவான சிந்தனை"} },
  { id:"monkey",  emoji:"🐵", name:{en:"Milo the Monkey",   zh:"猴子米洛",   ms:"Milo si Monyet",      ta:"குரங்கு மிலோ"},     trait:{en:"Playful & sharp",  zh:"机灵活泼", ms:"Ceria & tajam",             ta:"விளையாட்டு & கூர்மை"} },
  { id:"dog",     emoji:"🐶", name:{en:"Daisy the Dog",     zh:"小狗黛西",   ms:"Daisy si Anjing",     ta:"நாய் டெய்சி"},      trait:{en:"Loyal & alert",    zh:"忠诚警觉", ms:"Setia & peka",              ta:"விசுவாசம் & விழிப்பு"} },
  { id:"koala",   emoji:"🐨", name:{en:"Kai the Koala",     zh:"考拉凯",     ms:"Kai si Koala",        ta:"கோலா கை"},          trait:{en:"Cool & collected", zh:"冷静沉着", ms:"Tenang & terkawal",         ta:"அமைதி & நிதானம்"} },
  { id:"lion",    emoji:"🦁", name:{en:"Leo the Lion",      zh:"狮子里奥",   ms:"Leo si Singa",        ta:"சிங்கம் லியோ"},     trait:{en:"Fearless leader",  zh:"无畏领袖", ms:"Pemimpin tanpa gentar",     ta:"அஞ்சா தலைவர்"} },
  { id:"penguin", emoji:"🐧", name:{en:"Percy the Penguin", zh:"企鹅珀西",   ms:"Percy si Penguin",    ta:"பென்குயின் பெர்சி"}, trait:{en:"Smooth operator",  zh:"从容老练", ms:"Tenang bergaya",            ta:"நிதானமான திறமை"} },
  { id:"frog",    emoji:"🐸", name:{en:"Freddie the Frog",  zh:"青蛙弗雷迪", ms:"Freddie si Katak",    ta:"தவளை ஃப்ரெடி"},     trait:{en:"Leaps to safety",  zh:"敏捷避险", ms:"Melompat ke tempat selamat",ta:"பாதுகாப்பிற்கு தாவும்"} }
];

const LOCATIONS = [
  { name:{en:"The Mail Room",      zh:"邮件室",     ms:"Bilik Mel",          ta:"அஞ்சல் அறை"},        icon:"📧", grad:["#3a2d6b","#5b3fa8"], decor:["✉️","📩","📨","⚠️"] },
  { name:{en:"The Phone Booth",    zh:"电话亭",     ms:"Pondok Telefon",     ta:"தொலைபேசி கூடம்"},    icon:"📞", grad:["#0f4c5c","#1d8a9e"], decor:["☎️","📱","🔔","❓"] },
  { name:{en:"The Link Tunnel",    zh:"链接隧道",   ms:"Terowong Pautan",    ta:"இணைப்பு சுரங்கம்"},   icon:"🔗", grad:["#5c1f4a","#9e2f7a"], decor:["🔗","📦","🚚","⚠️"] },
  { name:{en:"The Friendship Park",zh:"友谊公园",   ms:"Taman Persahabatan", ta:"நட்பு பூங்கா"},      icon:"🌳", grad:["#1f5c2f","#3a9e4f"], decor:["🌳","🪑","💬","🤝"] },
  { name:{en:"The Hall of Mirrors",zh:"镜子大厅",   ms:"Dewan Cermin",       ta:"கண்ணாடி அறை"},       icon:"🪞", grad:["#1f5c5c","#2f9e9e"], decor:["🪞","🎭","👁️","✨"] },
  { name:{en:"The Wi-Fi Cafe",     zh:"无线网咖啡厅",ms:"Kafe Wi-Fi",        ta:"Wi-Fi கஃபே"},        icon:"☕", grad:["#5c2f1f","#9e552f"], decor:["☕","📶","💻","🍰"] },
  { name:{en:"The Treasure Vault", zh:"宝藏库",     ms:"Bilik Harta",        ta:"புதையல் அறை"},       icon:"💎", grad:["#5c4612","#caa02f"], decor:["💰","💎","🪙","🏆"] },
  { name:{en:"The Computer Lab",   zh:"电脑室",     ms:"Makmal Komputer",    ta:"கணினி ஆய்வகம்"},     icon:"💻", grad:["#1f3a5c","#2f6f9e"], decor:["💻","🖥️","🐛","⚠️"] },
  { name:{en:"The Town Square",    zh:"市镇广场",   ms:"Dataran Bandar",     ta:"நகர சதுக்கம்"},      icon:"📢", grad:["#3a1f5c","#6f2f9e"], decor:["📢","🏛️","🗣️","📸"] },
  { name:{en:"The Password Vault", zh:"密码库",     ms:"Bilik Kata Laluan",  ta:"கடவுச்சொல் அறை"},    icon:"🔐", grad:["#5c4a1f","#9e842f"], decor:["🔑","🔒","🗝️","💎"] }
];

/* Helper to keep question objects compact: T(en, zh, ms, ta) */
function T(en, zh, ms, ta) { return { en, zh, ms, ta }; }

const QUESTIONS = {
  /* ---------------- EASY (5 rooms: Mail, Phone, Link, Friendship, Mirrors) ---------------- */
  easy: [
    {
      prompt: T(
        "A bright pop-up says: “🎉 Congratulations! You are today's lucky winner of a new phone. Click here to claim within 5 minutes!” What should you do?",
        "一个鲜艳的弹窗显示：「🎉 恭喜！你是今天的幸运中奖者，将获得一部新手机。请在 5 分钟内点击这里领取！」你应该怎么做？",
        "Satu pop-up terang berbunyi: “🎉 Tahniah! Anda pemenang bertuah hari ini untuk sebuah telefon baharu. Klik di sini untuk menuntut dalam masa 5 minit!” Apakah yang patut anda lakukan?",
        "ஒரு பிரகாசமான பாப்-அப் கூறுகிறது: “🎉 வாழ்த்துகள்! இன்றைய அதிர்ஷ்டசாலி நீங்கள்தான், புதிய மொபைல் பெற்றுள்ளீர்கள். 5 நிமிடத்திற்குள் இங்கே கிளிக் செய்து பெறுங்கள்!” நீங்கள் என்ன செய்ய வேண்டும்?"),
      options: [
        T("Click quickly before the timer ends", "在倒计时结束前赶紧点击", "Klik cepat sebelum pemasa tamat", "நேரம் முடிவதற்குள் விரைவாக கிளிக் செய்யவும்"),
        T("Close the pop-up — real prizes don't work like this", "关闭弹窗——真正的奖品不会这样发放", "Tutup pop-up — hadiah sebenar tidak begini caranya", "பாப்-அப்பை மூடவும் — உண்மையான பரிசுகள் இப்படி இருக்காது"),
        T("Enter your bank details to receive the phone", "输入你的银行资料来领取手机", "Masukkan butiran bank anda untuk menerima telefon", "மொபைலைப் பெற உங்கள் வங்கி விவரங்களை உள்ளிடவும்"),
        T("Share it with friends so they can win too", "分享给朋友，让他们也能中奖", "Kongsi dengan rakan supaya mereka juga menang", "நண்பர்களுடன் பகிருங்கள், அவர்களும் வெல்லட்டும்")
      ],
      answer: 1,
      hint: T(
        "Genuine companies don't make you rush or ask for bank details to 'claim' a surprise prize.",
        "正规公司不会催你赶时间，也不会要你提供银行资料来「领取」意外大奖。",
        "Syarikat sah tidak akan mendesak anda atau meminta butiran bank untuk 'menuntut' hadiah kejutan.",
        "உண்மையான நிறுவனங்கள் உங்களை அவசரப்படுத்தாது, அல்லது 'பரிசு பெற' வங்கி விவரங்களைக் கேட்காது."),
      explain: T(
        "Surprise prizes with countdown timers are a classic scam. The rush is designed to stop you from thinking. Close it and never enter personal or bank details.",
        "带倒计时的「意外大奖」是典型骗局，催你赶时间就是为了让你来不及思考。直接关闭，切勿输入个人或银行资料。",
        "Hadiah kejutan dengan pemasa undur ialah penipuan klasik. Desakan itu bertujuan menghalang anda berfikir. Tutup sahaja dan jangan sekali-kali masukkan butiran peribadi atau bank.",
        "கவுண்ட்டவுன் டைமருடன் வரும் 'திடீர் பரிசுகள்' ஒரு பொதுவான மோசடி. அவசரம் உங்களை யோசிக்க விடாமல் தடுக்கவே. அதை மூடிவிடுங்கள், தனிப்பட்ட அல்லது வங்கி விவரங்களை ஒருபோதும் உள்ளிடாதீர்கள்.")
    },
    {
      prompt: T(
        "Someone calls saying they're from your bank and asks you to read out the One-Time Password (OTP) sent to your phone. What do you do?",
        "有人来电自称是你的银行，要求你读出发送到你手机的一次性密码（OTP）。你该怎么做？",
        "Seseorang menelefon mendakwa dari bank anda dan meminta anda membacakan Kata Laluan Sekali Guna (OTP) yang dihantar ke telefon anda. Apa tindakan anda?",
        "உங்கள் வங்கியிலிருந்து என்று கூறி யாரோ அழைத்து, உங்கள் மொபைலுக்கு அனுப்பப்பட்ட ஒருமுறை கடவுச்சொல்லை (OTP) வாசிக்கச் சொல்கிறார்கள். நீங்கள் என்ன செய்வீர்கள்?"),
      options: [
        T("Read it out — they said they're the bank", "读出来——他们说自己是银行", "Bacakan — mereka kata mereka dari bank", "வாசித்துவிடுங்கள் — அவர்கள் வங்கி என்று சொன்னார்களே"),
        T("Never share it; hang up and call the bank using the number on your card", "绝不透露；挂断电话，使用卡上的号码致电银行", "Jangan kongsi; tutup talian dan hubungi bank guna nombor pada kad anda", "ஒருபோதும் பகிராதீர்கள்; அழைப்பைத் துண்டித்து, உங்கள் கார்டில் உள்ள எண்ணைப் பயன்படுத்தி வங்கியை அழைக்கவும்"),
        T("Send it by text instead of saying it", "用短信发送，而不是口头说出", "Hantar melalui mesej teks dan bukannya menyebutnya", "சொல்வதற்குப் பதிலாக குறுஞ்செய்தியில் அனுப்பவும்"),
        T("Give them only half the code to be safe", "为安全起见只给一半的密码", "Beri separuh kod sahaja untuk selamat", "பாதுகாப்பிற்காக பாதி குறியீட்டை மட்டும் கொடுங்கள்")
      ],
      answer: 1,
      hint: T(
        "An OTP is like a key to your money. Banks will NEVER ask you to share it.",
        "OTP 就像你钱财的钥匙。银行绝不会要求你透露它。",
        "OTP ibarat kunci kepada wang anda. Bank TIDAK SEKALI-KALI akan meminta anda berkongsinya.",
        "OTP என்பது உங்கள் பணத்திற்கான சாவி போன்றது. வங்கிகள் அதை ஒருபோதும் பகிரச் சொல்லாது."),
      explain: T(
        "No real bank, police officer, or government staff will ever ask for your OTP. Anyone who does is a scammer. Hang up and verify using an official number.",
        "真正的银行、警察或政府人员绝不会索取你的 OTP。任何这么做的人都是骗子。挂断电话，用官方号码核实。",
        "Tiada bank, pegawai polis, atau kakitangan kerajaan yang sah akan meminta OTP anda. Sesiapa yang berbuat demikian ialah penipu. Tutup talian dan sahkan menggunakan nombor rasmi.",
        "உண்மையான வங்கி, காவலர் அல்லது அரசு ஊழியர் யாரும் உங்கள் OTP-ஐக் கேட்க மாட்டார்கள். கேட்பவர் மோசடிக்காரர். அழைப்பைத் துண்டித்து, அதிகாரப்பூர்வ எண்ணைப் பயன்படுத்தி உறுதிப்படுத்துங்கள்.")
    },
    {
      prompt: T(
        "You get an SMS: “Your parcel is held. Pay $0.50 delivery fee here: http://post-sg-claim.xyz”. What's the safest move?",
        "你收到一条短信：「你的包裹被扣留。请在此支付 0.50 元运费：http://post-sg-claim.xyz」。最安全的做法是什么？",
        "Anda menerima SMS: “Bungkusan anda ditahan. Bayar yuran penghantaran $0.50 di sini: http://post-sg-claim.xyz”. Apakah langkah paling selamat?",
        "உங்களுக்கு ஒரு SMS வருகிறது: “உங்கள் பார்சல் தடுத்து வைக்கப்பட்டுள்ளது. $0.50 டெலிவரி கட்டணத்தை இங்கே செலுத்துங்கள்: http://post-sg-claim.xyz”. பாதுகாப்பான நடவடிக்கை எது?"),
      options: [
        T("Tap the link and pay — it's only 50 cents", "点击链接付款——才 5 角钱而已", "Ketik pautan dan bayar — hanya 50 sen", "இணைப்பைத் தட்டி பணம் செலுத்துங்கள் — வெறும் 50 சதம்தானே"),
        T("Don't tap; check directly with the official courier app/website", "不要点击；直接到官方快递应用或网站查询", "Jangan ketik; semak terus dengan aplikasi/laman web kurier rasmi", "தட்டாதீர்கள்; அதிகாரப்பூர்வ கூரியர் ஆப்/இணையதளத்தில் நேரடியாகச் சரிபார்க்கவும்"),
        T("Reply STOP to the message", "回复「STOP」给该短信", "Balas STOP kepada mesej itu", "அந்தச் செய்திக்கு STOP என்று பதிலளிக்கவும்"),
        T("Forward it to everyone you know", "转发给所有认识的人", "Hantar kepada semua orang yang anda kenal", "உங்களுக்குத் தெரிந்த அனைவருக்கும் அனுப்பவும்")
      ],
      answer: 1,
      hint: T(
        "Look at the web address. Odd endings like '.xyz' and tiny 'fees' are warning signs.",
        "看看网址。像「.xyz」这样奇怪的结尾和小额「手续费」都是警示信号。",
        "Lihat alamat web. Pengakhiran pelik seperti '.xyz' dan 'yuran' kecil ialah tanda amaran.",
        "இணைய முகவரியைப் பாருங்கள். '.xyz' போன்ற வித்தியாசமான முடிவுகளும், சிறிய 'கட்டணங்களும்' எச்சரிக்கை அறிகுறிகள்."),
      explain: T(
        "Fake delivery texts trick you into entering card details on a copycat site. The tiny fee is bait. Always check parcels through the official app or website, not the link.",
        "虚假的快递短信会诱骗你在仿冒网站输入银行卡资料。小额费用只是诱饵。务必通过官方应用或网站查询包裹，而不是点击链接。",
        "Mesej penghantaran palsu menipu anda untuk memasukkan butiran kad pada laman tiruan. Yuran kecil itu umpan. Sentiasa semak bungkusan melalui aplikasi atau laman web rasmi, bukan pautan tersebut.",
        "போலி டெலிவரி செய்திகள் நகல் இணையதளத்தில் உங்கள் கார்டு விவரங்களை உள்ளிட ஏமாற்றுகின்றன. சிறிய கட்டணம் ஒரு தூண்டில். பார்சல்களை எப்போதும் அதிகாரப்பூர்வ ஆப் அல்லது இணையதளம் வழியாகச் சரிபார்க்கவும், இணைப்பின் வழியாக அல்ல.")
    },
    {
      prompt: T(
        "A stranger online becomes very friendly fast, then asks to borrow money for an 'emergency'. What should you do?",
        "一个网上的陌生人很快就变得非常友好，然后以「紧急情况」为由向你借钱。你该怎么做？",
        "Seorang yang tidak dikenali dalam talian cepat menjadi sangat mesra, kemudian meminta pinjam wang untuk 'kecemasan'. Apa yang patut anda lakukan?",
        "ஆன்லைனில் ஒரு அந்நியர் வேகமாக மிகவும் நட்பாகி, பிறகு 'அவசரத்திற்கு' பணம் கடன் கேட்கிறார். நீங்கள் என்ன செய்ய வேண்டும்?"),
      options: [
        T("Send the money — they sound nice and desperate", "把钱寄出去——他们听起来人很好又很无助", "Hantar wang itu — mereka kedengaran baik dan terdesak", "பணத்தை அனுப்புங்கள் — அவர்கள் நல்லவர் போலவும் கையறு நிலையிலும் தெரிகிறார்கள்"),
        T("Don't send money; be cautious with strangers asking for cash online", "不要寄钱；对网上向你要钱的陌生人要提高警惕", "Jangan hantar wang; berhati-hati dengan orang asing yang meminta wang dalam talian", "பணம் அனுப்பாதீர்கள்; ஆன்லைனில் பணம் கேட்கும் அந்நியர்களிடம் எச்சரிக்கையாக இருங்கள்"),
        T("Send a smaller amount as a test", "先寄一小笔作为试探", "Hantar jumlah kecil sebagai ujian", "சோதனையாக சிறிய தொகையை அனுப்புங்கள்"),
        T("Give them your account number so they can pay you back later", "把你的账号给他们，方便他们日后还钱", "Beri nombor akaun anda supaya mereka boleh bayar balik kemudian", "பிறகு திருப்பிச் செலுத்த உங்கள் கணக்கு எண்ணைக் கொடுங்கள்")
      ],
      answer: 1,
      hint: T(
        "Real friends earned over time don't suddenly need your money urgently.",
        "经过长期相处建立的真朋友，不会突然急着要你的钱。",
        "Kawan sebenar yang terjalin sekian lama tidak tiba-tiba memerlukan wang anda dengan segera.",
        "காலப்போக்கில் உருவான உண்மையான நண்பர்கள் திடீரென்று உங்கள் பணம் அவசரமாகத் தேவைப்படாது."),
      explain: T(
        "Scammers build trust quickly, then invent emergencies. Never send money to someone you've only met online. Talk to a family member if you feel pressured.",
        "骗子会迅速博取信任，然后编造紧急情况。绝不要给只在网上认识的人寄钱。如果感到被施压，请找家人商量。",
        "Penipu membina kepercayaan dengan cepat, kemudian mereka-reka kecemasan. Jangan sekali-kali hantar wang kepada seseorang yang anda hanya kenal dalam talian. Berbincang dengan ahli keluarga jika anda berasa tertekan.",
        "மோசடிக்காரர்கள் விரைவாக நம்பிக்கையை வளர்த்து, பிறகு அவசரநிலைகளைப் புனைகிறார்கள். ஆன்லைனில் மட்டும் சந்தித்தவருக்கு ஒருபோதும் பணம் அனுப்பாதீர்கள். அழுத்தம் உணர்ந்தால் குடும்ப உறுப்பினரிடம் பேசுங்கள்.")
    },
    {
      prompt: T(
        "You get a video/voice call that looks and sounds like your grandchild, urgently asking you to transfer money. AI can now fake voices and faces. What's the safest step?",
        "你接到一个视频／语音电话，长相和声音都像你的孙子／孙女，急着要你转账。如今人工智能可以伪造声音和面孔。最安全的做法是什么？",
        "Anda menerima panggilan video/suara yang kelihatan dan kedengaran seperti cucu anda, mendesak anda memindahkan wang. AI kini boleh memalsukan suara dan wajah. Apakah langkah paling selamat?",
        "உங்கள் பேரக்குழந்தை போலத் தோற்றமும் குரலும் கொண்ட ஒரு வீடியோ/குரல் அழைப்பு வந்து, அவசரமாக பணம் அனுப்பச் சொல்கிறது. AI இப்போது குரல்களையும் முகங்களையும் போலியாக உருவாக்க முடியும். பாதுகாப்பான நடவடிக்கை எது?"),
      options: [
        T("Transfer immediately — it looks just like them", "立刻转账——看起来就是本人", "Pindah wang segera — ia kelihatan benar-benar seperti dia", "உடனே பணம் அனுப்புங்கள் — அவர்களைப் போலவே தெரிகிறதே"),
        T("Pause, hang up, and call your family member back on their real number to check", "先停一停，挂断电话，用家人真实的号码回拨核实", "Berhenti seketika, tutup talian, dan telefon semula ahli keluarga di nombor sebenar mereka untuk pastikan", "சற்று நிறுத்தி, அழைப்பைத் துண்டித்து, உங்கள் குடும்ப உறுப்பினரின் உண்மையான எண்ணுக்கு மீண்டும் அழைத்துச் சரிபார்க்கவும்"),
        T("Send money to a 'friend's' account they give you", "把钱转到他们提供的「朋友」账户", "Hantar wang ke akaun 'kawan' yang mereka berikan", "அவர்கள் தரும் 'நண்பரின்' கணக்கிற்கு பணம் அனுப்புங்கள்"),
        T("Keep it secret as they ask", "按他们的要求保密", "Rahsiakan seperti yang mereka minta", "அவர்கள் கேட்டபடி இரகசியமாக வைத்திருங்கள்")
      ],
      answer: 1,
      hint: T(
        "AI can copy a voice or face. Always verify through a number you already trust.",
        "人工智能能复制声音或面孔。务必通过你早已信任的号码核实。",
        "AI boleh meniru suara atau wajah. Sentiasa sahkan melalui nombor yang anda sememangnya percaya.",
        "AI ஒரு குரலையோ முகத்தையோ நகலெடுக்க முடியும். நீங்கள் ஏற்கனவே நம்பும் எண் மூலம் எப்போதும் உறுதிப்படுத்துங்கள்."),
      explain: T(
        "AI 'deepfakes' can clone voices and faces convincingly. If someone urgently asks for money, hang up and call your loved one back directly. A real family member won't mind you double-checking.",
        "人工智能「深度伪造」能逼真地复制声音和面孔。如果有人急着要钱，挂断电话，直接回拨给你的亲人。真正的家人不会介意你再三确认。",
        "'Deepfake' AI boleh meniru suara dan wajah dengan meyakinkan. Jika seseorang mendesak meminta wang, tutup talian dan telefon terus orang tersayang anda. Ahli keluarga sebenar tidak akan keberatan anda menyemak semula.",
        "AI 'டீப்ஃபேக்' குரல்களையும் முகங்களையும் நம்பும்படி நகலெடுக்கும். யாராவது அவசரமாகப் பணம் கேட்டால், அழைப்பைத் துண்டித்து, உங்கள் அன்பானவரை நேரடியாக அழையுங்கள். உண்மையான குடும்ப உறுப்பினர் நீங்கள் மறுபரிசோதனை செய்வதை தவறாக நினைக்க மாட்டார்.")
    }
  ],

  /* ---------------- NORMAL (5 rooms: Mail, Phone, Link, Friendship, Mirrors) ---------------- */
  normal: [
    {
      prompt: T(
        "You receive an email appearing to be from your CFO: “I'm in a meeting — urgently process this vendor payment, here are the new bank details. Keep it confidential.” What's the correct response?",
        "你收到一封看似来自财务总监（CFO）的电邮：「我在开会——请紧急处理这笔供应商付款，这是新的银行账户资料。请保密。」正确的回应是什么？",
        "Anda menerima e-mel yang seolah-olah daripada CFO anda: “Saya dalam mesyuarat — segera proses bayaran vendor ini, ini butiran bank baharu. Rahsiakan.” Apakah tindak balas yang betul?",
        "உங்கள் CFO-விடமிருந்து வந்தது போல் ஒரு மின்னஞ்சல் வருகிறது: “நான் கூட்டத்தில் இருக்கிறேன் — இந்த விற்பனையாளர் கட்டணத்தை அவசரமாக செயல்படுத்துங்கள், இதோ புதிய வங்கி விவரங்கள். இரகசியமாக வைத்திருங்கள்.” சரியான பதில் என்ன?"),
      options: [
        T("Process it immediately to avoid annoying the CFO", "立刻处理，以免惹恼 CFO", "Proses dengan segera supaya tidak menyinggung CFO", "CFO-வை எரிச்சலூட்டாமல் இருக்க உடனே செயல்படுத்துங்கள்"),
        T("Verify out-of-band: call the CFO on a known number before acting on changed payment details", "通过其他渠道核实：在按新付款资料行动前，用已知号码致电 CFO 确认", "Sahkan melalui saluran lain: telefon CFO di nombor yang diketahui sebelum bertindak atas butiran bayaran yang berubah", "வேறு வழியில் உறுதிப்படுத்துங்கள்: மாற்றப்பட்ட கட்டண விவரங்களின்படி செயல்படும் முன், தெரிந்த எண்ணில் CFO-வை அழைக்கவும்"),
        T("Reply to the email to confirm the new account", "回复该电邮以确认新账户", "Balas e-mel itu untuk mengesahkan akaun baharu", "புதிய கணக்கை உறுதிப்படுத்த மின்னஞ்சலுக்குப் பதிலளிக்கவும்"),
        T("Forward it to finance and approve at the same time", "转发给财务部门并同时批准", "Hantar kepada bahagian kewangan dan luluskan serentak", "அதை நிதித் துறைக்கு அனுப்பி, அதே நேரத்தில் ஒப்புதல் அளிக்கவும்")
      ],
      answer: 1,
      hint: T(
        "Urgency + secrecy + changed bank details = classic Business Email Compromise.",
        "紧急 + 保密 + 更改银行账户 = 典型的商业电邮诈骗（BEC）。",
        "Mendesak + kerahsiaan + butiran bank bertukar = penipuan E-mel Perniagaan (BEC) klasik.",
        "அவசரம் + இரகசியம் + மாற்றப்பட்ட வங்கி விவரங்கள் = பொதுவான வணிக மின்னஞ்சல் மோசடி (BEC)."),
      explain: T(
        "This is Business Email Compromise (BEC). Always verify payment changes through a separate, trusted channel (a known phone number) — never by replying to the same email thread, which the attacker controls.",
        "这是商业电邮诈骗（BEC）。务必通过另一个可信渠道（已知的电话号码）核实付款变更——绝不要直接回复同一封电邮，因为它已被攻击者控制。",
        "Ini Penipuan E-mel Perniagaan (BEC). Sentiasa sahkan perubahan bayaran melalui saluran lain yang dipercayai (nombor telefon yang diketahui) — jangan sekali-kali dengan membalas rangkaian e-mel yang sama, kerana ia dikawal penyerang.",
        "இது வணிக மின்னஞ்சல் மோசடி (BEC). கட்டண மாற்றங்களை எப்போதும் தனியான, நம்பகமான வழியில் (தெரிந்த தொலைபேசி எண்) உறுதிப்படுத்துங்கள் — தாக்குபவர் கட்டுப்படுத்தும் அதே மின்னஞ்சலுக்குப் பதிலளிப்பதன் மூலம் ஒருபோதும் வேண்டாம்.")
    },
    {
      prompt: T(
        "On a call, your 'manager's' voice instructs you to buy gift cards for a client and send the codes. The voice is convincing. What's the red flag and right action?",
        "在一通电话里，你「经理」的声音指示你为客户购买礼品卡并发送卡号。声音很逼真。警示信号是什么？正确做法又是什么？",
        "Dalam satu panggilan, suara 'pengurus' anda mengarahkan anda membeli kad hadiah untuk pelanggan dan menghantar kodnya. Suaranya meyakinkan. Apakah tanda amaran dan tindakan yang betul?",
        "ஒரு அழைப்பில், உங்கள் 'மேலாளரின்' குரல் ஒரு வாடிக்கையாளருக்கு பரிசு அட்டைகள் வாங்கி குறியீடுகளை அனுப்பச் சொல்கிறது. குரல் நம்பும்படி உள்ளது. எச்சரிக்கை அறிகுறியும் சரியான நடவடிக்கையும் என்ன?"),
      options: [
        T("Voices can't be faked, so comply", "声音无法伪造，所以照做", "Suara tidak boleh dipalsukan, jadi patuh sahaja", "குரல்களை போலியாக்க முடியாது, எனவே சொன்னபடி செய்யுங்கள்"),
        T("AI voice-cloning is real; verify via a second channel and refuse gift-card/code requests", "人工智能能克隆声音；通过第二个渠道核实，并拒绝任何索取礼品卡／卡号的要求", "Pengklonan suara AI memang wujud; sahkan melalui saluran kedua dan tolak permintaan kad hadiah/kod", "AI குரல் நகலெடுப்பு உண்மை; இரண்டாவது வழியில் உறுதிப்படுத்தி, பரிசு அட்டை/குறியீடு கோரிக்கைகளை மறுக்கவும்"),
        T("Send the codes but keep the receipts", "发送卡号，但保留收据", "Hantar kod tetapi simpan resit", "குறியீடுகளை அனுப்புங்கள், ஆனால் ரசீதுகளை வைத்திருங்கள்"),
        T("Ask for the request in writing, then proceed without verifying", "要求对方书面提出，然后不经核实就照办", "Minta permintaan secara bertulis, kemudian teruskan tanpa mengesahkan", "கோரிக்கையை எழுத்துப்பூர்வமாகக் கேட்டு, பின்னர் சரிபார்க்காமல் தொடரவும்")
      ],
      answer: 1,
      hint: T(
        "Gift-card payments are untraceable — a hallmark of fraud, even with a familiar voice.",
        "礼品卡付款无法追踪——即使声音很熟悉，这也是诈骗的典型特征。",
        "Bayaran kad hadiah tidak boleh dijejaki — ciri penipuan, walaupun suaranya dikenali.",
        "பரிசு அட்டை பணம் கண்டறிய முடியாதது — பரிச்சயமான குரலாக இருந்தாலும், இது மோசடியின் அடையாளம்."),
      explain: T(
        "AI voice cloning makes deepfake 'vishing' easy. Legitimate business is never settled in gift-card codes. Verify any unusual request through a separate, trusted channel before acting.",
        "人工智能语音克隆让「深度伪造语音诈骗」变得轻而易举。正当业务绝不会用礼品卡卡号结算。在行动前，请通过另一个可信渠道核实任何异常要求。",
        "Pengklonan suara AI memudahkan 'vishing' deepfake. Urusan sah tidak pernah diselesaikan dengan kod kad hadiah. Sahkan sebarang permintaan luar biasa melalui saluran lain yang dipercayai sebelum bertindak.",
        "AI குரல் நகலெடுப்பு டீப்ஃபேக் 'விஷிங்'-ஐ எளிதாக்குகிறது. முறையான வணிகம் ஒருபோதும் பரிசு அட்டை குறியீடுகளில் தீர்க்கப்படாது. செயல்படும் முன் எந்தவொரு அசாதாரண கோரிக்கையையும் தனியான, நம்பகமான வழியில் உறுதிப்படுத்துங்கள்.")
    },
    {
      prompt: T(
        "A login link reads: https://accounts-microsoft-secure.com/login . Why should you be suspicious?",
        "一个登录链接是：https://accounts-microsoft-secure.com/login。你为什么应该起疑？",
        "Satu pautan log masuk berbunyi: https://accounts-microsoft-secure.com/login . Mengapa anda patut curiga?",
        "ஒரு உள்நுழைவு இணைப்பு: https://accounts-microsoft-secure.com/login . நீங்கள் ஏன் சந்தேகப்பட வேண்டும்?"),
      options: [
        T("It uses HTTPS, so it must be safe", "它用了 HTTPS，所以一定安全", "Ia menggunakan HTTPS, jadi tentu selamat", "இது HTTPS பயன்படுத்துகிறது, எனவே பாதுகாப்பாக இருக்க வேண்டும்"),
        T("The domain is misspelled/non-official ('microsoft', odd subdomains) — a phishing tactic", "这个域名拼写不对／非官方（夹带「microsoft」、奇怪的子域名）——这是钓鱼手法", "Domain itu salah eja/tidak rasmi ('microsoft', subdomain pelik) — taktik pancingan data", "டொமைன் தவறாக எழுதப்பட்டது/அதிகாரப்பூர்வமற்றது ('microsoft', வித்தியாசமான துணை டொமைன்கள்) — ஃபிஷிங் தந்திரம்"),
        T("Long URLs are always fine", "长网址都没问题", "URL panjang sentiasa selamat", "நீளமான URL-கள் எப்போதும் பரவாயில்லை"),
        T("It has the word 'secure' in it, so it's secure", "里面有「secure」这个词，所以很安全", "Ia mengandungi perkataan 'secure', jadi ia selamat", "அதில் 'secure' என்ற சொல் உள்ளது, எனவே பாதுகாப்பானது")
      ],
      answer: 1,
      hint: T(
        "HTTPS only means encrypted, not trustworthy. Read the domain carefully.",
        "HTTPS 只代表加密，并不代表可信。请仔细看清域名。",
        "HTTPS hanya bermaksud disulitkan, bukan boleh dipercayai. Baca domain dengan teliti.",
        "HTTPS என்பது மறைகுறியாக்கப்பட்டது என்று மட்டுமே பொருள், நம்பகமானது என்று அல்ல. டொமைனைக் கவனமாகப் படியுங்கள்."),
      explain: T(
        "Attackers register lookalike domains (typos, extra words, odd subdomains). HTTPS just means the connection is encrypted — not that the site is legitimate. Always check the exact spelling of the real domain.",
        "攻击者会注册「以假乱真」的域名（拼写错误、多余单词、奇怪的子域名）。HTTPS 只表示连接是加密的——并不代表网站是正规的。务必核对真实域名的准确拼写。",
        "Penyerang mendaftar domain yang menyerupai (salah taip, perkataan tambahan, subdomain pelik). HTTPS hanya bermaksud sambungan disulitkan — bukan bahawa laman itu sah. Sentiasa semak ejaan tepat domain sebenar.",
        "தாக்குபவர்கள் ஒத்த தோற்றமுள்ள டொமைன்களைப் பதிவு செய்கிறார்கள் (எழுத்துப் பிழைகள், கூடுதல் சொற்கள், வித்தியாசமான துணை டொமைன்கள்). HTTPS என்பது இணைப்பு மறைகுறியாக்கப்பட்டது என்று மட்டுமே — தளம் முறையானது என்று அல்ல. உண்மையான டொமைனின் சரியான எழுத்துப்பிழையை எப்போதும் சரிபார்க்கவும்.")
    },
    {
      prompt: T(
        "An online contact you've never met in person grows romantic over weeks, then introduces a 'can't-miss' crypto opportunity and asks you to invest via their link. This pattern is:",
        "一个你从未见过面的网友，几周内与你发展出恋情，接着介绍一个「绝不能错过」的加密货币机会，并要你通过他们的链接投资。这种模式属于：",
        "Seorang kenalan dalam talian yang anda tidak pernah jumpa bersemuka menjadi romantik selama berminggu-minggu, kemudian memperkenalkan peluang kripto yang 'jangan dilepaskan' dan meminta anda melabur melalui pautan mereka. Corak ini ialah:",
        "நீங்கள் நேரில் சந்திக்காத ஒரு ஆன்லைன் தொடர்பு வாரக்கணக்கில் காதல் வயப்பட்டு, பிறகு 'தவறவிடக்கூடாத' கிரிப்டோ வாய்ப்பை அறிமுகப்படுத்தி, அவர்களின் இணைப்பு வழியாக முதலீடு செய்யச் சொல்கிறார். இந்த முறை:"),
      options: [
        T("A normal way to find good investments", "寻找优质投资的正常途径", "Cara biasa untuk mencari pelaburan yang baik", "நல்ல முதலீடுகளைக் கண்டறியும் சாதாரண வழி"),
        T("Romance + investment scam ('pig butchering') — emotional grooming to extract money", "恋爱 + 投资骗局（「杀猪盘」）——以感情操控来骗取钱财", "Penipuan asmara + pelaburan ('pig butchering') — manipulasi emosi untuk meraih wang", "காதல் + முதலீட்டு மோசடி ('பிக் பட்சரிங்') — பணம் பறிக்க உணர்வுபூர்வ ஏமாற்று"),
        T("Safe because you've chatted for weeks", "安全的，因为你们已经聊了好几周", "Selamat kerana anda telah berbual selama berminggu-minggu", "வாரக்கணக்கில் பேசிவிட்டதால் பாதுகாப்பானது"),
        T("Fine as long as the platform looks professional", "只要平台看起来专业就没问题", "Tidak mengapa selagi platform itu kelihatan profesional", "தளம் தொழில்முறையாகத் தெரிந்தால் பரவாயில்லை")
      ],
      answer: 1,
      hint: T(
        "Trust built only online + a sudden investment 'tip' is a known scam combo.",
        "只在网上建立的信任 + 突然冒出的投资「内幕消息」，是已知的骗局组合。",
        "Kepercayaan yang dibina dalam talian sahaja + 'tip' pelaburan tiba-tiba ialah gabungan penipuan yang diketahui.",
        "ஆன்லைனில் மட்டும் உருவான நம்பிக்கை + திடீர் முதலீட்டு 'குறிப்பு' என்பது அறியப்பட்ட மோசடி கலவை."),
      explain: T(
        "So-called 'pig butchering' scams blend romance with fake investment platforms. The relationship and the 'profits' you see are fake. Never invest through a link from someone you've only met online.",
        "所谓的「杀猪盘」骗局，将恋爱与虚假投资平台结合在一起。你看到的感情和「收益」都是假的。绝不要通过只在网上认识的人提供的链接投资。",
        "Penipuan 'pig butchering' menggabungkan asmara dengan platform pelaburan palsu. Hubungan dan 'keuntungan' yang anda lihat adalah palsu. Jangan sekali-kali melabur melalui pautan daripada seseorang yang anda hanya kenal dalam talian.",
        "'பிக் பட்சரிங்' மோசடிகள் காதலை போலி முதலீட்டு தளங்களுடன் கலக்கின்றன. நீங்கள் காணும் உறவும் 'லாபமும்' போலியானவை. ஆன்லைனில் மட்டும் சந்தித்தவரின் இணைப்பு வழியாக ஒருபோதும் முதலீடு செய்யாதீர்கள்.")
    },
    {
      prompt: T(
        "A realistic video of a public figure making a shocking announcement is spreading fast. Before you believe or share it, you should:",
        "一段逼真的视频正在快速传播，画面中一位公众人物发表了惊人声明。在相信或转发之前，你应该：",
        "Satu video realistik seorang tokoh awam membuat pengumuman mengejutkan tersebar dengan pantas. Sebelum anda mempercayai atau berkongsinya, anda patut:",
        "ஒரு பொது நபர் அதிர்ச்சியூட்டும் அறிவிப்பு செய்வதைக் காட்டும் நம்பும்படியான வீடியோ வேகமாகப் பரவுகிறது. அதை நம்புவதற்கு அல்லது பகிர்வதற்கு முன், நீங்கள்:"),
      options: [
        T("Share immediately — it looks real", "立刻转发——看起来很真实", "Kongsi serta-merta — ia kelihatan benar", "உடனே பகிருங்கள் — அது உண்மையாகத் தெரிகிறதே"),
        T("Verify with trusted news sources and check for deepfake signs; don't spread unverified content", "用可信的新闻来源核实，并留意深度伪造的痕迹；不要传播未经核实的内容", "Sahkan dengan sumber berita yang dipercayai dan periksa tanda deepfake; jangan sebarkan kandungan yang belum disahkan", "நம்பகமான செய்தி ஆதாரங்களுடன் உறுதிப்படுத்தி, டீப்ஃபேக் அறிகுறிகளைச் சரிபார்க்கவும்; சரிபார்க்காத உள்ளடக்கத்தைப் பரப்பாதீர்கள்"),
        T("Assume video can't be faked", "认定视频不可能被伪造", "Anggap video tidak boleh dipalsukan", "வீடியோவை போலியாக்க முடியாது என்று கருதுங்கள்"),
        T("Believe it because many people reposted it", "因为很多人转发了就相信它", "Percaya kerana ramai orang telah mengetip semula", "பலர் மறுபதிவு செய்ததால் அதை நம்புங்கள்")
      ],
      answer: 1,
      hint: T(
        "AI can generate convincing fake video and audio. Confirm before you trust or share.",
        "人工智能能生成以假乱真的视频和音频。在相信或转发前先确认。",
        "AI boleh menjana video dan audio palsu yang meyakinkan. Sahkan sebelum anda percaya atau berkongsi.",
        "AI நம்பும்படியான போலி வீடியோ மற்றும் ஆடியோவை உருவாக்க முடியும். நம்புவதற்கு அல்லது பகிர்வதற்கு முன் உறுதிப்படுத்தவும்."),
      explain: T(
        "AI-generated deepfakes and misinformation spread quickly. Cross-check shocking claims against reputable news outlets, look for unnatural artefacts, and pause before sharing — your share lends it credibility.",
        "人工智能生成的深度伪造和虚假信息传播得很快。把惊人说法与权威新闻媒体交叉核对，留意不自然的破绽，转发前先停一停——你的转发会让它显得更可信。",
        "Deepfake dan maklumat salah janaan AI tersebar dengan cepat. Semak silang dakwaan mengejutkan dengan media berita bereputasi, perhatikan kesan tidak semula jadi, dan berhenti sebelum berkongsi — perkongsian anda memberinya kredibiliti.",
        "AI உருவாக்கிய டீப்ஃபேக்குகளும் தவறான தகவல்களும் வேகமாகப் பரவுகின்றன. அதிர்ச்சியூட்டும் கூற்றுகளை நம்பகமான செய்தி ஊடகங்களுடன் ஒப்பிட்டுப் பாருங்கள், இயற்கைக்கு மாறான குறைபாடுகளைத் தேடுங்கள், பகிர்வதற்கு முன் சற்று நிறுத்துங்கள் — உங்கள் பகிர்வு அதற்கு நம்பகத்தன்மையைத் தருகிறது.")
    }
  ]
};
