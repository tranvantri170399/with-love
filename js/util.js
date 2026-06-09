/* ===== Tiny math helpers shared across the cosmos ===== */
window.U = {
  clamp01: (x) => Math.max(0, Math.min(1, x)),
  lerp: (a, b, t) => a + (b - a) * t,
  smoothstep: (e0, e1, x) => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  },
  rand: (a, b) => a + Math.random() * (b - a),
  pick: (arr) => arr[(Math.random() * arr.length) | 0],
};
