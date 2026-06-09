/* ===== Nebula clouds: layered soft sprites with additive glow ===== */

function makeCloudTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  // Build a soft, irregular blob from many faded radial gradients.
  for (let i = 0; i < 14; i++) {
    const cx = U.rand(60, 196);
    const cy = U.rand(60, 196);
    const r = U.rand(40, 110);
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255,255,255,${U.rand(0.05, 0.14)})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.Texture(c);
  tex.needsUpdate = true;
  return tex;
}

function createNebula(scene, opts) {
  const group = new THREE.Group();
  const tex = makeCloudTexture();
  const count = opts.count || 14;
  const sprites = [];

  for (let i = 0; i < count; i++) {
    const mat = new THREE.SpriteMaterial({
      map: tex,
      color: U.pick(opts.colors),
      transparent: true,
      opacity: U.rand(0.18, 0.5),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const s = new THREE.Sprite(mat);
    const spread = opts.spread || 70;
    s.position.set(
      U.rand(-spread, spread),
      U.rand(-spread * 0.5, spread * 0.5),
      U.rand(-spread, spread)
    );
    const scale = U.rand(opts.minScale || 30, opts.maxScale || 90);
    s.scale.set(scale, scale, 1);
    s.userData.phase = Math.random() * Math.PI * 2;
    s.userData.baseScale = scale;
    group.add(s);
    sprites.push(s);
  }

  group.position.copy(opts.pos);
  scene.add(group);

  return {
    group,
    update(t) {
      group.rotation.z = t * 0.01;
      for (const s of sprites) {
        const pulse = 1 + Math.sin(t * 0.4 + s.userData.phase) * 0.06;
        const sc = s.userData.baseScale * pulse;
        s.scale.set(sc, sc, 1);
      }
    },
  };
}

window.createNebula = createNebula;
window.makeCloudTexture = makeCloudTexture;
