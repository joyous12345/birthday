var lang = "en",
  personName = "",
  playing = false,
  musicStopped = false,
  audioInitialized = false,
  candleBlown = false;
var bgMusic = null,
  cheerSound = null;
var usedBlessingIndices = [],
  usedCakeBiteIndices = [];

var T = {
  en: {
    invite: "Who's celebrating today?",
    btn: "🎉 Start Celebration!",
    ph: "Name (optional)",
    hb: "Happy Birthday,",
    hbNoName: "Happy Birthday!",
    tag: "🎉 Wishing you an amazing day! 🎉",
    tagN: function (n) {
      return "🎉 Wishing you an amazing day, " + n + "! 🎉";
    },
    blow: "Blow the candle!",
    ready: "Get Ready!",
    finalN: "🎉 Make a wish! Your special day is here! 🎉",
    final: function (n) {
      return "🎉 Happy Birthday, " + n + "! May all your wishes come true! 🎉";
    },
    replay: "Replay",
  },
  zh: {
    invite: "今天是誰的生日？",
    btn: "🎉 開始慶祝！",
    ph: "姓名（選填）",
    hb: "生日快樂，",
    hbNoName: "生日快樂！",
    tag: "🎉 願你擁有最美好的一天！🎉",
    tagN: function (n) {
      return "🎉 " + n + "，願你擁有最美好的一天！🎉";
    },
    blow: "吹蠟燭！",
    ready: "準備好了嗎！",
    finalN: "🎉 許個願！今天是你的特別日子！🎉",
    final: function (n) {
      return "🎉 " + n + "，生日快樂！願你所有願望成真！🎉";
    },
    replay: "重播",
  },
};
function setLang(l) {
  lang = l;
  // Reset blessing/cake pools so language switch starts fresh
  usedBlessingIndices = [];
  usedCakeBiteIndices = [];
  var t = T[l];
  document.documentElement.setAttribute("lang", l);
  document.getElementById("s-invite").textContent = t.invite;
  document.getElementById("s-btn").textContent = t.btn;
  document.getElementById("name-input").placeholder = t.ph;
  var closeBtn = document.getElementById("gift-popup-close");
  if (closeBtn)
    closeBtn.textContent =
      l === "zh" ? "✨ 收下祝福 ✨" : "✨ Receive Blessing ✨";
  document.querySelectorAll(".lang-btn").forEach(function (b, i) {
    b.classList.toggle("active", i === (l === "en" ? 0 : 1));
  });
}

/* ── CURSOR EMOJIS (throttled + capped) ── */
(function () {
  var canvas = document.getElementById("cursor-canvas"),
    ctx = canvas.getContext("2d"),
    particles = [],
    MAX = 55;
  var emojis = ["🎉", "✨", "🌸", "💖", "🎈", "⭐", "🎊", "💫", "🌟", "🥳"];
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  function CP(x, y) {
    this.x = x;
    this.y = y;
    this.e = emojis[~~(Math.random() * emojis.length)];
    this.sz = 11 + Math.random() * 11;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = -1.2 - Math.random() * 2.8;
    this.g = 0.11;
    this.life = 1;
    this.decay = 0.028 + Math.random() * 0.016;
    this.rot = Math.random() * Math.PI * 2;
    this.rv = (Math.random() - 0.5) * 0.12;
  }
  CP.prototype.update = function () {
    this.x += this.vx;
    this.vy += this.g;
    this.y += this.vy;
    this.life -= this.decay;
    this.rot += this.rv;
  };
  var lastFont = "";
  CP.prototype.draw = function () {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    var font = this.sz + "px serif";
    if (font !== lastFont) {
      ctx.font = font;
      lastFont = font;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.e, 0, 0);
    ctx.restore();
  };
  var lastT = 0;
  function emit(x, y) {
    var now = Date.now();
    if (now - lastT > 110 && particles.length < MAX) {
      particles.push(new CP(x, y));
      lastT = now;
    }
  }
  document.addEventListener("click", function (e) {
    var add = Math.min(3, MAX - particles.length);
    for (var i = 0; i < add; i++) particles.push(new CP(e.clientX, e.clientY));
  });
  document.addEventListener("mousemove", function (e) {
    emit(e.clientX, e.clientY);
  });
  document.addEventListener(
    "touchmove",
    function (e) {
      emit(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true },
  );
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── CONFETTI ── */
function createConfetti() {
  var scene = document.getElementById("page-celeb"),
    colors = ["c-white", "c-pink", "c-gold", "c-purple", "c-blue", "c-coral"],
    frag = document.createDocumentFragment();
  for (var i = 0; i < 80; i++) {
    var p = document.createElement("span");
    p.className =
      "particle " +
      ["small", "medium", "big"][~~(Math.random() * 3)] +
      " " +
      colors[~~(Math.random() * 6)] +
      " " +
      (Math.random() > 0.5 ? "soft" : "");
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 5 + Math.random() * 5 + "s";
    p.style.animationDelay = Math.random() * 8 + "s";
    frag.appendChild(p);
  }
  var rc = ["#FF85A1", "#FFE15D", "#4CC9F0", "#da70d6", "#ff6b6b", "#fff"];
  for (var j = 0; j < 50; j++) {
    var r = document.createElement("span");
    r.className = "ribbon " + ["long", "twist", ""][~~(Math.random() * 3)];
    r.style.left = Math.random() * 100 + "vw";
    r.style.background = rc[~~(Math.random() * 6)];
    r.style.animationDuration = 6 + Math.random() * 4 + "s";
    r.style.animationDelay = Math.random() * 8 + "s";
    frag.appendChild(r);
  }
  scene.appendChild(frag);
}

/* ── BALLOONS (fills space) ── */
var balloonEmojis = ["🎈", "🎀", "🎊", "💖", "🌸", "🎁", "⭐", "🥳"];
function spawnBalloons() {
  var scene = document.getElementById("page-celeb");
  for (var i = 0; i < 9; i++) {
    (function (idx) {
      setTimeout(function () {
        var b = document.createElement("div");
        b.className = "balloon";
        b.textContent = balloonEmojis[idx % balloonEmojis.length];
        b.style.fontSize = 20 + Math.random() * 18 + "px";
        b.style.left = 4 + Math.random() * 90 + "%";
        b.style.setProperty("--bx", Math.random() * 60 - 30 + "px");
        b.style.setProperty("--bd", 7 + Math.random() * 6 + "s");
        b.style.setProperty("--bdl", idx * 1.2 + "s");
        scene.appendChild(b);
      }, idx * 350);
    })(i);
  }
}

/* ── HEARTS ── */
function spawnHearts(burst) {
  var scene = document.getElementById("page-celeb"),
    em = ["💖", "🎂", "✨", "🎈", "💝", "🌸", "🥳", "🎊", "⭐", "💫"],
    frag = document.createDocumentFragment(),
    n = burst ? 22 : 14;
  for (var i = 0; i < n; i++) {
    var h = document.createElement("div");
    h.className = "heart";
    h.textContent = em[~~(Math.random() * em.length)];
    h.style.left = (burst ? 8 : 15) + Math.random() * (burst ? 84 : 70) + "%";
    h.style.top = (burst ? 10 : 20) + Math.random() * 60 + "%";
    h.style.fontSize = (burst ? 18 : 14) + Math.random() * 22 + "px";
    h.style.setProperty("--fd", 2 + Math.random() * 2.5 + "s");
    h.style.setProperty("--delay", Math.random() * 0.6 + "s");
    h.addEventListener("animationend", function () {
      this.remove();
    });
    frag.appendChild(h);
  }
  scene.appendChild(frag);
}

/* ── SPARKLES ── */
function spawnSparkles() {
  var scene = document.getElementById("page-celeb"),
    frag = document.createDocumentFragment();
  for (var i = 0; i < 16; i++) {
    var s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = 40 + Math.random() * 20 + "%";
    s.style.top = 20 + Math.random() * 30 + "%";
    s.style.position = "absolute";
    s.style.pointerEvents = "none";
    var sz = 10 + Math.random() * 14,
      delay = i * 0.06;
    s.innerHTML =
      '<svg viewBox="0 0 20 20" width="' +
      sz +
      '" height="' +
      sz +
      '"><path d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5Z" fill="rgba(255,240,100,.95)"/></svg>';
    frag.appendChild(s);
    (function (el, d) {
      setTimeout(function () {
        el.style.animation = "sPop .8s " + d + "s ease-out forwards";
        setTimeout(
          function () {
            el.remove();
          },
          (d + 1.5) * 1000,
        );
      }, 10);
    })(s, delay);
  }
  scene.appendChild(frag);
}

/* ── MUSIC ── */
function initMusicElements() {
  if (!bgMusic) {
    bgMusic = new Audio("birthday.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.75;
  }
  if (!cheerSound) {
    cheerSound = new Audio("cheer.mp3");
    cheerSound.volume = 0.85;
  }
}
function startMusic() {
  if (musicStopped || playing) return;
  initMusicElements();
  bgMusic.currentTime = 0;
  var p = bgMusic.play();
  if (p !== undefined) {
    p.then(function () {
      playing = true;
      audioInitialized = true;
      document.getElementById("music-btn").textContent = "🔇";
    }).catch(function () {
      playing = false;
    });
  } else {
    playing = true;
    audioInitialized = true;
    document.getElementById("music-btn").textContent = "🔇";
  }
}
function stopMusic(perm) {
  playing = false;
  if (bgMusic) {
    bgMusic.pause();
    if (!perm) bgMusic.currentTime = 0;
  }
  if (perm) {
    musicStopped = true;
    audioInitialized = false;
    document.getElementById("music-btn").style.display = "none";
  }
}
function toggleMusic() {
  if (musicStopped) return;
  if (playing) {
    stopMusic(false);
    document.getElementById("music-btn").textContent = "🎵";
  } else {
    playing = false;
    startMusic();
  }
}

/* ── CAKE ANIMATION ── */
function animateCakeTiers() {
  var tiers = ["tier-candle", "tier-top", "tier-mid", "tier-bot", "tier-plate"];
  tiers.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.classList.remove("drop");
      el.style.opacity = "0";
      el.style.transform = "translateY(100px)";
    }
  });
  var order = ["tier-plate", "tier-bot", "tier-mid", "tier-top", "tier-candle"],
    delays = [100, 300, 500, 700, 900];
  order.forEach(function (id, i) {
    setTimeout(function () {
      var el = document.getElementById(id);
      if (el) {
        el.style.transform = "";
        el.classList.add("drop");
      }
    }, delays[i]);
  });
}

/* ── PAGE FLOW ── */
function showPage(id) {
  document.querySelectorAll(".page").forEach(function (p) {
    if (p.id === id) p.classList.remove("hidden", "out");
    else p.classList.add("out");
  });
}
function startExp() {
  personName = document.getElementById("name-input").value.trim();
  showPage("page-count");
  runCountdown();
}

function runCountdown() {
  var el = document.getElementById("count-el"),
    lbl = document.getElementById("count-label"),
    count = 3;
  el.textContent = count;
  lbl.textContent = T[lang].ready;
  el.className = "count-num";
  el.style.animation = "none";
  requestAnimationFrame(function () {
    el.style.animation = "";
  });
  var tick = setInterval(function () {
    count--;
    if (count === 0) {
      clearInterval(tick);
      setTimeout(launchCelebration, 500);
    } else {
      el.className = "count-num";
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
      el.textContent = count;
    }
  }, 900);
}

function launchCelebration() {
  showPage("page-celeb");
  var t = T[lang];
  document.getElementById("r-replay").textContent = t.replay;
  document.getElementById("blow-txt").textContent = t.blow;
  if (personName) {
    document.getElementById("hb-main").textContent =
      t.hb + " " + personName + "!";
    document.getElementById("hb-tagline").textContent = t.tagN(personName);
  } else {
    document.getElementById("hb-main").textContent = t.hbNoName;
    document.getElementById("hb-tagline").textContent = t.tag;
  }
  document.getElementById("blow-btn").classList.remove("blown");
  document.getElementById("final-msg").style.display = "none";
  document.getElementById("top-btns").classList.remove("show");
  var sr = document.getElementById("scene-row");
  if (sr) sr.classList.remove("gifts-active");

  var candle = document.getElementById("candle"),
    fw = document.getElementById("flame-wrap");
  candle.style.opacity = "0";
  candle.style.animation = "none";
  fw.style.opacity = "0";
  fw.style.visibility = "";
  fw.style.animation = "none";
  var fl = fw.querySelector(".flame");
  if (fl) {
    fl.style.animation = "none";
    fl.style.opacity = "";
    fl.style.visibility = "";
  }
  var fi = fw.querySelector(".flame-inner");
  if (fi) fi.style.opacity = "";

  animateCakeTiers();
  setTimeout(function () {
    candle.style.animation = "candleIn .4s ease-out forwards";
  }, 1350);
  setTimeout(function () {
    fw.style.animation = "flameIn .3s ease-out forwards";
    if (fl) fl.style.animation = "flicker 1.2s infinite";
    // Gifts appear 600ms after candle is lit
    setTimeout(function () {
      document.querySelectorAll(".gift-wrap").forEach(function (g) {
        g.classList.add("g-show");
      });
    }, 600);
  }, 1750);

  document
    .querySelectorAll("#page-celeb .particle,#page-celeb .ribbon")
    .forEach(function (e) {
      e.remove();
    });
  createConfetti();
  document.querySelectorAll("#page-celeb .balloon").forEach(function (e) {
    e.remove();
  });
  spawnBalloons();
  // Re-apply mobile layout after celebration resets DOM
  setTimeout(restructureForMobile, 50);

  musicStopped = false;
  playing = false;
  audioInitialized = false;
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  if (cheerSound) {
    cheerSound.pause();
    cheerSound.currentTime = 0;
  }
  document.getElementById("music-btn").style.display = "flex";
  document.getElementById("music-btn").textContent = "🔇";
  startMusic();
  candleBlown = false;
  document.getElementById("blow-btn").onclick = blowCandle;
}

function blowCandle() {
  candleBlown = true;
  document.getElementById("scene-row").classList.add("gifts-active");
  enableCakeClick();
  enableGiftClicks();
  var t = T[lang],
    fw = document.getElementById("flame-wrap"),
    candle = document.getElementById("candle"),
    fl = fw.querySelector(".flame");
  if (fl) {
    fl.style.animation = "none";
    fl.style.opacity = "0";
    fl.style.visibility = "hidden";
  }
  var fi = fw.querySelector(".flame-inner");
  if (fi) fi.style.opacity = "0";
  fw.style.animation = "none";
  fw.style.opacity = "0";
  fw.style.visibility = "hidden";
  candle.style.opacity = ".45";
  document.getElementById("blow-btn").classList.add("blown");
  stopMusic(true);
  initMusicElements();
  setTimeout(function () {
    cheerSound.currentTime = 0;
    cheerSound.play().catch(function () {});
  }, 80);
  spawnSparkles();
  setTimeout(function () {
    spawnHearts(true);
  }, 200);
  setTimeout(function () {
    spawnHearts(false);
  }, 1100);
  var fm = document.getElementById("final-msg");
  fm.textContent = personName ? t.final(personName) : t.finalN;
  setTimeout(function () {
    fm.style.display = "block";
  }, 550);
  setTimeout(function () {
    document.getElementById("top-btns").classList.add("show");
  }, 900);
}

function replay() {
  stopMusic(false);
  playing = false;
  musicStopped = false;
  showPage("page-start");
  document.getElementById("top-btns").classList.remove("show");
  var sr = document.getElementById("scene-row");
  if (sr) sr.classList.remove("gifts-active");
  document.querySelectorAll("#page-celeb .balloon").forEach(function (e) {
    e.remove();
  });
}

document.getElementById("name-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") startExp();
});
document.addEventListener("visibilitychange", function () {
  if (document.hidden && playing) {
    if (bgMusic) bgMusic.pause();
    playing = false;
  } else if (!document.hidden && audioInitialized && !musicStopped) {
    playing = false;
    startMusic();
  }
});

/* ── GIFT BLESSINGS ── */
var giftBlessings = {
  en: [
    {
      emoji: "💝",
      msg: "May your birthday be filled with\njoy, laughter, and love!\nYou deserve all the happiness! 🌟",
    },
    {
      emoji: "🌈",
      msg: "Wishing you a year of wonderful\nadventures and beautiful memories!\nHappy Birthday! 🎂",
    },
    {
      emoji: "⭐",
      msg: "You don’t need to shine all the time.\nJust being you is already enough.\nHappy Birthday ✨",
    },
    {
      emoji: "🌸",
      msg: "Sending you the warmest wishes\non your special day!\nMay life always be kind to you! 🌺",
    },
    {
      emoji: "🎊",
      msg: "Another year, another level unlocked.\nLet’s see what chaos comes next 😏",
    },
    {
      emoji: "💫",
      msg: "You light up the world\naround you every day.\nHappy Birthday, shining star! 🌟",
    },
    {
      emoji: "🎁",
      msg: "This gift is filled with\nall my heartfelt wishes for you!\nMay happiness find you always! 💖",
    },
    {
      emoji: "💰",
      msg: "Hope life treats you well this year—\nand maybe your bank account too 😏",
    },
  ],
  zh: [
    {
      emoji: "💝",
      msg: "願你的生日充滿歡笑與愛！\n你值得世上所有的幸福！\n生日快樂！🌟",
    },
    {
      emoji: "🌈",
      msg: "願這一年充滿美好的冒險\n與珍貴的回憶！\n生日快樂！🎂",
    },
    {
      emoji: "⭐",
      msg: "願你所有的夢想\n在這一年一一實現！\n你是最特別的那個人！✨",
    },
    {
      emoji: "🌸",
      msg: "不用一直很厲害，\n做自己就很好了。\n生日快樂 ✨",
    },
    {
      emoji: "🎊",
      msg: "數數你的幸福，\n而不是蠟燭的數量！\n願接下來的每一天都精彩！🥂",
    },
    {
      emoji: "💫",
      msg: "你每天都照亮\n身邊所有人的世界！\n生日快樂，閃亮的你！🌟",
    },
    {
      emoji: "🎁",
      msg: "又長一歲了，\n但還活得不錯，算贏 😌",
    },
    { emoji: "💰", msg: "願你今年不只快樂，\n也順便小小暴富一下 😏" },
  ],
};

function getNextBlessingIndex() {
  var pool = giftBlessings[lang];
  if (usedBlessingIndices.length >= pool.length) usedBlessingIndices = [];
  var available = [];
  for (var i = 0; i < pool.length; i++) {
    if (usedBlessingIndices.indexOf(i) === -1) available.push(i);
  }
  var idx = available[Math.floor(Math.random() * available.length)];
  usedBlessingIndices.push(idx);
  return idx;
}

function showPopup(blessing) {
  document.getElementById("gift-popup-emoji").textContent = blessing.emoji;
  document.getElementById("gift-popup-msg").innerHTML = blessing.msg
    .replace(/\\n/g, "<br>")
    .replace(/\n/g, "<br>");
  var overlay = document.getElementById("gift-popup-overlay");
  overlay.classList.add("visible");
  var box = document.getElementById("gift-popup-box");
  box.style.animation = "none";
  void box.offsetWidth;
  box.style.animation = "";
  var emojiEl = document.getElementById("gift-popup-emoji");
  emojiEl.style.animation = "none";
  void emojiEl.offsetWidth;
  emojiEl.style.animation = "";
}

function openGiftPopup() {
  showPopup(giftBlessings[lang][getNextBlessingIndex()]);
}

function closeGiftPopup(e) {
  if (
    !e ||
    e.target === document.getElementById("gift-popup-overlay") ||
    e.target === document.getElementById("gift-popup-close")
  ) {
    document.getElementById("gift-popup-overlay").classList.remove("visible");
  }
}

// Gift clicks — enabled only after candle blown
function enableGiftClicks() {
  document.querySelectorAll(".gift-wrap").forEach(function (g) {
    if (!g._giftClickEnabled) {
      g._giftClickEnabled = true;
      g.addEventListener("click", function (e) {
        if (!candleBlown) return;
        e.stopPropagation();
        openGiftPopup();
      });
    }
  });
}

/* ── CAKE EATING ── */
var cakeBites = {
  en: [
    {
      emoji: "🍰",
      msg: "Mmm! A slice of pure joy!\nEvery bite as sweet as you! 💕",
    },
    {
      emoji: "😋",
      msg: "Delicious! Just like this\namazing year ahead of you! ✨",
    },
    { emoji: "🎂", msg: "The best bite goes to\nthe birthday star! 🌟" },
    { emoji: "🍓", msg: "Sweet cake for a sweet soul!\nHappy Birthday! 💖" },
    { emoji: "🥄", msg: "One bite closer to\nall your birthday wishes! 🎉" },
  ],
  zh: [
    { emoji: "🍰", msg: "好吃！每一口都甜蜜蜜！\n就像你這個人一樣可愛！💕" },
    { emoji: "😋", msg: "太美味了！\n就像你接下來的精彩一年！✨" },
    { emoji: "🎂", msg: "最好的那塊蛋糕\n當然留給生日主角！🌟" },
    { emoji: "🍓", msg: "甜蜜的蛋糕獻給甜蜜的你！\n生日快樂！💖" },
    { emoji: "🥄", msg: "再一口，願望就實現了！🎉" },
  ],
};

function getNextCakeBiteIndex() {
  var pool = cakeBites[lang];
  if (usedCakeBiteIndices.length >= pool.length) usedCakeBiteIndices = [];
  var available = [];
  for (var i = 0; i < pool.length; i++) {
    if (usedCakeBiteIndices.indexOf(i) === -1) available.push(i);
  }
  var idx = available[Math.floor(Math.random() * available.length)];
  usedCakeBiteIndices.push(idx);
  return idx;
}

function openCakePopup() {
  showPopup(cakeBites[lang][getNextCakeBiteIndex()]);
}

function enableCakeClick() {
  var cakeWrap = document.getElementById("cake-wrap");
  if (cakeWrap && !cakeWrap._cakeClickEnabled) {
    cakeWrap._cakeClickEnabled = true;
    cakeWrap.style.cursor = "pointer";
    cakeWrap.addEventListener("click", function (e) {
      if (!candleBlown) return;
      e.stopPropagation();
      openCakePopup();
    });
  }
}

/* ── MOBILE LAYOUT RESTRUCTURE ── */
function restructureForMobile() {
  var isMobile = window.innerWidth <= 520;
  var sceneRow = document.getElementById("scene-row");
  if (!sceneRow) return;

  // Remove any previously created mobile rows
  sceneRow.querySelectorAll(".mobile-gift-row").forEach(function (r) {
    r.remove();
  });
  // Remove cake and gifts from any mobile rows (reset)
  var cakeWrap = document.getElementById("cake-wrap");

  if (isMobile) {
    // Collect gift elements
    var g1 = sceneRow.querySelector(".g1");
    var g2 = sceneRow.querySelector(".g2");
    var g5 = sceneRow.querySelector(".g5");
    var g6 = sceneRow.querySelector(".g6");
    var g3 = sceneRow.querySelector(".g3");
    var g4 = sceneRow.querySelector(".g4");
    var g7 = sceneRow.querySelector(".g7");
    var g8 = sceneRow.querySelector(".g8");

    // Clear scene-row
    while (sceneRow.firstChild) sceneRow.removeChild(sceneRow.firstChild);

    // Row 1: left gifts (g5,g6,g1,g2 — or g1,g2,g5,g6 sized nicely)
    var row1 = document.createElement("div");
    row1.className = "mobile-gift-row";
    [g6, g5, g1, g2].forEach(function (g) {
      if (g) row1.appendChild(g);
    });

    // Row 2: cake
    var row2 = document.createElement("div");
    row2.className = "mobile-gift-row";
    row2.style.justifyContent = "center";
    if (cakeWrap) row2.appendChild(cakeWrap);

    // Row 3: right gifts (g3,g4,g7,g8)
    var row3 = document.createElement("div");
    row3.className = "mobile-gift-row";
    [g3, g4, g7, g8].forEach(function (g) {
      if (g) row3.appendChild(g);
    });

    sceneRow.appendChild(row1);
    sceneRow.appendChild(row2);
    sceneRow.appendChild(row3);
  } else {
    // Desktop: restore flat layout
    var allGifts = sceneRow.querySelectorAll(".gift-wrap");
    if (allGifts.length === 0) {
      // Gifts may be inside .mobile-gift-row — restore
      var rows = sceneRow.querySelectorAll(".mobile-gift-row");
      var giftsArr = [];
      rows.forEach(function (r) {
        r.querySelectorAll(".gift-wrap").forEach(function (g) {
          giftsArr.push(g);
        });
        if (cakeWrap && r.contains(cakeWrap)) r.removeChild(cakeWrap);
      });
      rows.forEach(function (r) {
        r.remove();
      });
      // Re-append: left gifts (order -1), cake (order 0), right gifts (order 1)
      ["g1", "g2", "g5", "g6"].forEach(function (cls) {
        giftsArr.forEach(function (g) {
          if (g.classList.contains(cls)) sceneRow.appendChild(g);
        });
      });
      if (cakeWrap) sceneRow.appendChild(cakeWrap);
      ["g3", "g4", "g7", "g8"].forEach(function (cls) {
        giftsArr.forEach(function (g) {
          if (g.classList.contains(cls)) sceneRow.appendChild(g);
        });
      });
    }
  }
}

// Run on load and resize (debounced to avoid hammering during drag)
restructureForMobile();
var _resizeTimer;
window.addEventListener("resize", function () {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(restructureForMobile, 120);
});

setLang("en");
