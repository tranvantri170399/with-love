/* ===== Generative ambient pad: a warm, copyright-free cosmic drone =====
   Used as the music fallback when no real song file is configured. */

function createAmbientPad() {
  let ctx, master, filter, lfo, voices = [], playing = false;

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  }

  function start() {
    if (playing) return;
    ensureCtx();
    const now = ctx.currentTime;

    master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.16, now + 3.5);
    master.connect(ctx.destination);

    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    filter.connect(master);

    // Warm chord (A major flavour): A2, E3, A3, C#4
    [110, 164.81, 220, 277.18].forEach((f, i) => {
      const g = ctx.createGain();
      g.gain.value = 0.26 / (i + 1);
      g.connect(filter);
      const o1 = ctx.createOscillator();
      o1.type = i === 0 ? "sine" : "triangle";
      o1.frequency.value = f;
      const o2 = ctx.createOscillator(); // subtle detune shimmer
      o2.type = "sine";
      o2.frequency.value = f * 1.0035;
      o1.connect(g);
      o2.connect(g);
      o1.start();
      o2.start();
      voices.push(o1, o2);
    });

    // Slow filter swell so the pad breathes.
    lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 420;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    voices.push(lfo);

    playing = true;
  }

  function stop() {
    if (!playing) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(0, now + 1.2);
    const dying = voices.slice();
    setTimeout(() => dying.forEach((v) => { try { v.stop(); } catch (e) {} }), 1400);
    voices = [];
    playing = false;
  }

  return { start, stop, isPlaying: () => playing };
}

window.createAmbientPad = createAmbientPad;
