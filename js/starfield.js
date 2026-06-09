/* ===== Starfield: thousands of drifting stars in a sphere ===== */
/* Exposes window.createStarfield(scene) -> { points, update(t) } */

function makeStarTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.Texture(c);
  tex.needsUpdate = true;
  return tex;
}

function createStarfield(scene) {
  const COUNT = 6500;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const palette = [
    [1.0, 1.0, 1.0],   // white
    [0.78, 0.85, 1.0], // blue-white
    [1.0, 0.73, 0.9],  // pink
    [1.0, 0.85, 0.6],  // gold
  ];

  for (let i = 0; i < COUNT; i++) {
    // Distribute on a shell with random radius for depth
    const r = 120 + Math.random() * 680;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const col = palette[(Math.random() * palette.length) | 0];
    const tw = 0.6 + Math.random() * 0.4;
    colors[i * 3] = col[0] * tw;
    colors[i * 3 + 1] = col[1] * tw;
    colors[i * 3 + 2] = col[2] * tw;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 2.6,
    map: makeStarTexture(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  return {
    points,
    update(t, warp = 0) {
      points.rotation.y = t * 0.012;
      points.rotation.x = Math.sin(t * 0.05) * 0.04;
      // Twinkle + grow into streaks during a warp (fast scroll).
      mat.size = 2.6 + Math.sin(t * 2) * 0.4 + warp * 6;
      mat.opacity = 1;
    },
  };
}

window.createStarfield = createStarfield;
window.makeStarTexture = makeStarTexture;
