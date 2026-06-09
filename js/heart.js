/* ===== Particle heart: thousands of glowing dots forming a 3D heart ===== */
/* Exposes window.createHeart(scene) -> { group, update(t) } */

// Implicit 2D heart test: inside when f(x,y) <= 0
function insideHeart(x, y) {
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

function createHeart(scene, opts = {}) {
  const COUNT = 5200;
  const baseScale = opts.scale || 1;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT); // for per-particle pulse phase

  let placed = 0;
  while (placed < COUNT) {
    // Rejection sample inside the heart region
    const x = (Math.random() * 2 - 1) * 1.4;
    const y = (Math.random() * 2 - 1) * 1.4;
    if (!insideHeart(x, y)) continue;

    const z = (Math.random() * 2 - 1) * 0.42 * (1 - Math.abs(x) * 0.5);
    const i = placed * 3;
    // Heart math has y pointing down for the dimple; flip y so tip is at bottom
    positions[i] = x * 6;
    positions[i + 1] = y * 6 + 1.2;
    positions[i + 2] = z * 6;

    // Pink -> red -> gold gradient by height
    const h = (y + 1.2) / 2.4;
    colors[i] = 1.0;
    colors[i + 1] = 0.25 + h * 0.4;
    colors[i + 2] = 0.45 + h * 0.25;

    seeds[placed] = Math.random() * Math.PI * 2;
    placed++;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const basePos = positions.slice();

  const mat = new THREE.PointsMaterial({
    size: 0.9,
    map: window.makeStarTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const heart = new THREE.Points(geo, mat);
  const group = new THREE.Group();
  group.add(heart);
  group.position.copy(opts.position || new THREE.Vector3(0, 2, -8));
  scene.add(group);

  const pos = geo.attributes.position.array;

  return {
    group,
    update(t) {
      const beat = 1 + Math.sin(t * 1.8) * 0.05 + Math.max(0, Math.sin(t * 1.8)) * 0.04;
      // Breathing scale + gentle sway (stays front-facing, never edge-on)
      group.scale.setScalar(beat * baseScale);
      group.rotation.y = Math.sin(t * 0.4) * 0.45;
      group.rotation.z = Math.sin(t * 0.3) * 0.04;
      // Subtle per-particle shimmer outward
      for (let k = 0; k < COUNT; k++) {
        const i = k * 3;
        const f = 1 + Math.sin(t * 3 + seeds[k]) * 0.012;
        pos[i] = basePos[i] * f;
        pos[i + 1] = basePos[i + 1] * f;
        pos[i + 2] = basePos[i + 2] * f;
      }
      geo.attributes.position.needsUpdate = true;
      mat.size = 0.9 + Math.sin(t * 1.8) * 0.15;
    },
  };
}

window.createHeart = createHeart;
