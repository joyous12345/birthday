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
    btn: "🎉 Start",
    ph: "Name (optional)",
    hb: "Happy Birthday,",
    hbNoName: "Happy Birthday!",
    tag: "Hope today brings you something good.",
    tagN: function (n) {
      return "Hope today brings you something good, " + n + ".";
    },
    blow: "Blow the candle",
    ready: "Get Ready!",
    finalN: "Make a wish. This moment is yours.",
    final: function (n) {
      return "Happy Birthday, " + n + ". Hope this year is kind to you.";
    },
    replay: "Replay",
  },
  zh: {
    invite: "今天是谁的生日？",
    btn: "🎉 开始",
    ph: "名字（选填）",
    hb: "生日快乐，",
    hbNoName: "生日快乐！",
    tag: "希望今天有让你开心的事。",
    tagN: function (n) {
      return n + "，希望今天有让你开心的事。";
    },
    blow: "吹蜡烛",
    ready: "准备好了吗？",
    finalN: "许个愿吧，今天是你的日子。",
    final: function (n) {
      return n + "，生日快乐。希望这一年对你温柔一点。";
    },
    replay: "再来一次",
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
  document.title = l === "zh" ? "生日快乐 🎂" : "Happy Birthday! 🎂";
  var hintTxt = document.getElementById("audio-hint-txt");
  if (hintTxt)
    hintTxt.textContent =
      l === "zh" ? "👆 点一下以开启音乐" : "👆 Tap anywhere to enable music";
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
function _showAudioHint(show) {
  var h = document.getElementById("audio-hint");
  if (!h) return;
  h.style.display = show ? "block" : "none";
}
function _unlockAudioOnTap() {
  document.removeEventListener("click", _unlockAudioOnTap);
  document.removeEventListener("touchend", _unlockAudioOnTap);
  _showAudioHint(false);
  if (!musicStopped && !playing) startMusic();
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
      _showAudioHint(false);
      document.getElementById("music-btn").textContent = "🔇";
    }).catch(function () {
      // Autoplay blocked (iOS Safari) — show hint and wait for tap
      playing = false;
      _showAudioHint(true);
      document.addEventListener("click", _unlockAudioOnTap);
      document.addEventListener("touchend", _unlockAudioOnTap);
    });
  } else {
    playing = true;
    audioInitialized = true;
    _showAudioHint(false);
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

  // 觸發初始數字動畫
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
  var countPage = document.getElementById("page-count");
  var celebPage = document.getElementById("page-celeb");

  // Burst-out the countdown page, burst-in the celebration page
  countPage.classList.add("burst-out");
  celebPage.classList.remove("hidden", "out");
  celebPage.classList.add("burst-in");
  countPage.addEventListener("animationend", function handler() {
    countPage.removeEventListener("animationend", handler);
    countPage.classList.add("out");
    countPage.classList.remove("burst-out");
  });
  celebPage.addEventListener("animationend", function handler() {
    celebPage.removeEventListener("animationend", handler);
    celebPage.classList.remove("burst-in");
  });
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

  restructureForMobile();
  setTimeout(animateCakeTiers, 60);
  setTimeout(function () {
    candle.style.animation = "candleIn .4s ease-out forwards";
  }, 1350);
  setTimeout(function () {
    fw.style.animation = "flameIn .3s ease-out forwards";
    if (fl) fl.style.animation = "flicker 1.2s infinite";

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
  document.getElementById("blow-btn").onclick = null;
  _setupBlowInteraction();
}

/* ── MIC BLOW DETECTION ── */
function _teardownMic() {
  if (_micAnimFrame) {
    cancelAnimationFrame(_micAnimFrame);
    _micAnimFrame = null;
  }
  if (_micStream) {
    _micStream.getTracks().forEach(function (t) {
      t.stop();
    });
    _micStream = null;
  }
}

function _startBlowAnalyser(stream, hint, btn) {
  var actx = new (window.AudioContext || window.webkitAudioContext)();
  var src = actx.createMediaStreamSource(stream);
  var analyser = actx.createAnalyser();
  analyser.fftSize = 256;
  src.connect(analyser);
  var buf = new Uint8Array(analyser.frequencyBinCount);

  hint.innerHTML =
    (lang === "zh" ? "🎤 对着麦克风吹！" : "🎤 Blow into your mic!") +
    '<div class="blow-meter-wrap"><div class="blow-meter-bar" id="blow-bar"></div></div>';
  hint.style.display = "block";

  var THRESHOLD = 60,
    holdFrames = 0,
    HOLD_NEEDED = 6;
  function checkBlow() {
    if (candleBlown) return;
    analyser.getByteFrequencyData(buf);
    var sum = 0;
    for (var i = 0; i < 12; i++) sum += buf[i];
    var avg = sum / 12;
    var bar = document.getElementById("blow-bar");
    if (bar) bar.style.width = Math.min(100, (avg / THRESHOLD) * 100) + "%";
    if (avg > THRESHOLD) {
      if (++holdFrames >= HOLD_NEEDED) {
        _teardownMic();
        hint.style.display = "none";
        blowCandle();
        return;
      }
    } else {
      holdFrames = Math.max(0, holdFrames - 1);
    }
    _micAnimFrame = requestAnimationFrame(checkBlow);
  }
  _micAnimFrame = requestAnimationFrame(checkBlow);

  btn.onclick = function () {
    _teardownMic();
    hint.style.display = "none";
    blowCandle();
  };
}

function _setupBlowInteraction() {
  var hint = document.getElementById("mic-hint");
  var btn = document.getElementById("blow-btn");

  if (_micStream) {
    _startBlowAnalyser(_micStream, hint, btn);
  } else if (_micPending) {
    // Still waiting for user to grant — poll briefly then start
    var attempts = 0;
    var poll = setInterval(function () {
      if (_micStream) {
        clearInterval(poll);
        _startBlowAnalyser(_micStream, hint, btn);
      } else if (!_micPending || ++attempts > 20) {
        clearInterval(poll);
        _useBtnFallback(hint, btn);
      }
    }, 150);
  } else {
    _useBtnFallback(hint, btn);
  }
}

function _useBtnFallback(hint, btn) {
  hint.style.display = "none";
  btn.onclick = blowCandle;
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
  _teardownMic();
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
      emoji: "🌸",
      msg: "Hope this year feels a little lighter than the last.\nLess weight, more breathing room.",
    },
    {
      emoji: "☀️",
      msg: "Wishing you more good days than bad ones.\nAnd when the bad ones come, may they pass quickly.",
    },
    {
      emoji: "💌",
      msg: "Hope you feel appreciated today.\nYou deserve more of that.",
    },
    {
      emoji: "🍃",
      msg: "Take care of yourself this year.\nNot just when you have to — regularly.",
    },
    {
      emoji: "✨",
      msg: "Hope something good surprises you this year.\nSomething you didn't even plan for.",
    },
    {
      emoji: "🎯",
      msg: "Whatever you're working towards —\nhope this is the year it starts to click.",
    },
    {
      emoji: "💛",
      msg: "Hope the people around you make life easier.\nAnd if they don't, hope you find better ones.",
    },
    {
      emoji: "🌙",
      msg: "Get more sleep. Drink more water.\nSmall things, but they matter more than we think.",
    },
  ],
  zh: [
    {
      emoji: "🌸",
      msg: "希望今年比去年轻松一点。\n少一些压力，多一些喘息的空间。",
    },
    {
      emoji: "☀️",
      msg: "愿你好日子多过坏日子。\n遇到不顺的时候，希望它快快过去。",
    },
    {
      emoji: "💌",
      msg: "希望你今天感觉到被重视。\n你值得被好好对待。",
    },
    {
      emoji: "🍃",
      msg: "记得照顾自己。\n不是等到撑不住了才开始，是平时就要。",
    },
    {
      emoji: "✨",
      msg: "希望今年有什么好事让你惊喜。\n那种没有预期到的那种。",
    },
    {
      emoji: "🎯",
      msg: "不管你在努力什么，\n希望今年开始慢慢有感觉了。",
    },
    {
      emoji: "💛",
      msg: "希望身边的人让你生活更轻松。\n如果没有，希望你找到对的人。",
    },
    {
      emoji: "🌙",
      msg: "多睡一点，多喝水。\n很小的事，但真的很重要。",
    },
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
        if (g._opening) return; // debounce during animation
        e.stopPropagation();
        g._opening = true;
        g.classList.add("opening");
        setTimeout(function () {
          g.classList.remove("opening");
          g._opening = false;
          openGiftPopup();
        }, 420);
      });
    }
  });
}

/* ── CAKE EATING ── */
var cakeBites = {
  en: [
    {
      emoji: "🍰",
      msg: "One slice in.\nHope the rest of the year is just as sweet.",
    },
    {
      emoji: "😋",
      msg: "Good cake, good company, good year.\nThat's the plan.",
    },
    {
      emoji: "🎂",
      msg: "Birthday cake hits different\nwhen it's actually your birthday.",
    },
    { emoji: "🍓", msg: "Enjoy every bite.\nYou earned this." },
    {
      emoji: "🥄",
      msg: "Here's to you.\nAnd to more cake whenever you want it.",
    },
  ],
  zh: [
    { emoji: "🍰", msg: "吃下第一口了。\n希望今年剩下的日子也这么甜。" },
    { emoji: "😋", msg: "好吃的蛋糕，好的陪伴，好的一年。\n就这样。" },
    { emoji: "🎂", msg: "生日蛋糕在生日这天吃\n就是特别好吃。" },
    { emoji: "🍓", msg: "好好享受每一口。\n你值得。" },
    { emoji: "🥄", msg: "敬你。\n还有以后想吃蛋糕随时都能吃。" },
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

    while (sceneRow.firstChild) sceneRow.removeChild(sceneRow.firstChild);

    var row1 = document.createElement("div");
    row1.className = "mobile-gift-row";
    [g6, g5, g1, g2].forEach(function (g) {
      if (g) row1.appendChild(g);
    });

    var row2 = document.createElement("div");
    row2.className = "mobile-gift-row";
    row2.style.justifyContent = "center";
    if (cakeWrap) row2.appendChild(cakeWrap);

    var row3 = document.createElement("div");
    row3.className = "mobile-gift-row";
    [g3, g4, g7, g8].forEach(function (g) {
      if (g) row3.appendChild(g);
    });

    sceneRow.appendChild(row1);
    sceneRow.appendChild(row2);
    sceneRow.appendChild(row3);
  } else {
    var allGifts = sceneRow.querySelectorAll(".gift-wrap");
    if (allGifts.length === 0) {
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

// ── URL PARAMS (?name=xxx&lang=zh) ──
(function () {
  var params = new URLSearchParams(window.location.search);
  var pName = params.get("name");
  var pLang = params.get("lang");
  if (pName) {
    personName = decodeURIComponent(pName).slice(0, 20);
    var inp = document.getElementById("name-input");
    if (inp) inp.value = personName;
  }
  if (pLang === "zh" || pLang === "en") lang = pLang;
})();

setLang(lang);

// ── PRE-REQUEST MIC on page load ──
// Ask for permission early so there's no delay when the blow page appears.

var _micStream = null,
  _micAnimFrame = null,
  _micPending = false;
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  _micPending = true;
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(function (stream) {
      _micStream = stream;
      _micPending = false;
    })
    .catch(function () {
      _micStream = null;
      _micPending = false;
    });
}
