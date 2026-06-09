/* ===== Content injection + scroll reveals + floating hearts + music ===== */

(function () {
  const C = window.CONFIG || {};

  // ---- Helper ----
  const $ = (sel) => document.querySelector(sel);
  const setText = (sel, txt) => {
    const el = $(sel);
    if (el && txt != null) el.textContent = txt;
  };

  // ---- Hero ----
  setText("#hero-eyebrow", C.hero?.eyebrow);
  setText("#hero-title", C.hero?.title);
  setText("#her-name", C.herName);
  setText("#hero-sub", C.hero?.subtitle);
  setText("#scroll-hint", C.hero?.scrollHint);
  document.title = `Gửi ${C.herName || "Em Yêu"} 💖`;

  // ---- Reasons ----
  setText("#reasons-title", C.reasonsTitle);
  setText("#reasons-intro", C.reasonsIntro);
  const cards = $("#reason-cards");
  (C.reasons || []).forEach((r) => {
    const div = document.createElement("div");
    div.className = "card reveal";
    div.innerHTML =
      `<div class="card-icon">${r.icon || "♥"}</div>` +
      `<h3></h3><p></p>`;
    div.querySelector("h3").textContent = r.title || "";
    div.querySelector("p").textContent = r.text || "";
    cards.appendChild(div);
  });

  // ---- Gallery ----
  setText("#gallery-title", C.galleryTitle);
  setText("#gallery-intro", C.galleryIntro);
  const grid = $("#gallery-grid");
  (C.gallery || []).forEach((g) => {
    const fr = document.createElement("div");
    fr.className = "frame reveal";
    if (g.src) {
      const img = document.createElement("img");
      img.src = g.src;
      img.alt = g.caption || "";
      fr.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "placeholder";
      ph.textContent = "📷";
      fr.appendChild(ph);
    }
    if (g.caption) {
      const cap = document.createElement("div");
      cap.className = "caption";
      cap.textContent = g.caption;
      fr.appendChild(cap);
    }
    grid.appendChild(fr);
  });

  // ---- Letter ----
  setText("#letter-title", C.letterTitle);
  const letterBody = $("#letter-body");
  (C.letter || []).forEach((para) => {
    const p = document.createElement("p");
    p.textContent = para;
    letterBody.appendChild(p);
  });
  const sign = document.createElement("p");
  sign.className = "sign";
  sign.textContent = C.signature || "";
  letterBody.appendChild(sign);
  const signName = document.createElement("p");
  signName.className = "sign-name";
  signName.textContent = C.signatureName || "";
  letterBody.appendChild(signName);

  // ---- Scroll reveal ----
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // ---- Journey progress: constellation dots + top bar ----
  const stages = Array.from(document.querySelectorAll(".stage"));
  const dotsNav = $("#dots");
  const bar = $("#progress-bar");
  const dots = stages.map((st, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Đến phần " + (i + 1));
    b.addEventListener("click", () =>
      window.__goStation
        ? window.__goStation(i)
        : st.scrollIntoView({ behavior: "smooth" })
    );
    dotsNav.appendChild(b);
    return b;
  });
  function updateProgress() {
    const max = document.body.scrollHeight - window.innerHeight;
    const f = max > 0 ? window.scrollY / max : 0;
    if (bar) bar.style.width = f * 100 + "%";
    const mid = window.scrollY + window.innerHeight / 2;
    let active = 0, best = Infinity;
    stages.forEach((st, i) => {
      const c = st.offsetTop + st.offsetHeight / 2;
      const d = Math.abs(c - mid);
      if (d < best) { best = d; active = i; }
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === active));
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  // ---- Floating hearts ----
  const HEARTS = ["💖", "💕", "💗", "🩷", "✨", "💫"];
  function spawnHeart() {
    const h = document.createElement("div");
    h.className = "float-heart";
    h.textContent = HEARTS[(Math.random() * HEARTS.length) | 0];
    h.style.left = Math.random() * 100 + "vw";
    h.style.fontSize = 14 + Math.random() * 26 + "px";
    h.style.animationDuration = 6 + Math.random() * 6 + "s";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 12000);
  }
  setInterval(spawnHeart, 900);

  // ---- Loader ----
  window.addEventListener("load", () => {
    setTimeout(() => $("#loader")?.classList.add("hidden"), 600);
  });

  // ---- Envelope: click to open the letter ----
  const envelope = $("#envelope");
  const openBtn = $("#open-letter");
  const letterEl = $("#letter-body");
  if (openBtn && envelope && letterEl) {
    openBtn.addEventListener("click", () => {
      envelope.classList.add("opening");
      for (let i = 0; i < 20; i++) setTimeout(spawnHeart, i * 55);
      setTimeout(() => {
        envelope.style.display = "none";
        letterEl.classList.add("show");
      }, 850);
    });
  }

  // ---- Music: real song if configured, else a warm generative pad ----
  const btn = $("#music-btn");
  if (btn) {
    let playing = false;
    let audio = null;
    let pad = null;
    btn.addEventListener("click", () => {
      playing = !playing;
      if (C.musicSrc) {
        if (!audio) { audio = new Audio(C.musicSrc); audio.loop = true; audio.volume = 0.5; }
        playing ? audio.play() : audio.pause();
      } else {
        pad = pad || window.createAmbientPad();
        playing ? pad.start() : pad.stop();
      }
      btn.classList.toggle("playing", playing);
      btn.textContent = playing ? "♫" : "♪";
    });
  }
})();
