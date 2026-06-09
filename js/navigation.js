/* ===== Snap navigation: one gesture = fly to the next world ===== */
/* Hijacks wheel / touch / keys; eases the page to each station so the
   scroll-driven camera flies and aligns to that planet automatically. */

(function () {
  const stages = Array.from(document.querySelectorAll(".stage"));
  if (!stages.length) return;

  let index = 0;
  let animating = false;
  let cooldown = false;

  const top = (i) => stages[i].offsetTop;
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function goTo(i) {
    i = Math.max(0, Math.min(stages.length - 1, i));
    if (animating) return;
    const start = window.scrollY;
    const end = top(i);
    if (Math.abs(end - start) < 1) { index = i; return; }
    index = i;
    animating = true;
    const dur = 1150;
    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur);
      window.scrollTo(0, start + (end - start) * easeInOutCubic(p));
      if (p < 1) requestAnimationFrame(step);
      else animating = false;
    }
    requestAnimationFrame(step);
  }
  window.__goStation = goTo;

  function nudge(dir) {
    if (animating || cooldown) return;
    cooldown = true;
    setTimeout(() => (cooldown = false), 1250);
    goTo(index + dir);
  }

  function nearest() {
    let best = 0, bd = Infinity;
    stages.forEach((s, i) => {
      const d = Math.abs(s.offsetTop - window.scrollY);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  // Wheel / trackpad
  window.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 6) return;
    nudge(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  // Touch swipe
  let ty = null;
  window.addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchmove", (e) => { e.preventDefault(); }, { passive: false });
  window.addEventListener("touchend", (e) => {
    if (ty === null) return;
    const dy = ty - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 45) nudge(dy > 0 ? 1 : -1);
    ty = null;
  }, { passive: true });

  // Keyboard (accessibility)
  window.addEventListener("keydown", (e) => {
    if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); nudge(1); }
    else if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); nudge(-1); }
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(stages.length - 1);
  });

  window.addEventListener("resize", () => {
    if (!animating) { index = nearest(); window.scrollTo(0, top(index)); }
  });
})();
