/* ===== Planets: procedural surface + atmosphere rim-glow + optional rings ===== */

// Fresnel rim glow (atmosphere). cameraPosition is injected by three.js.
function makeGlowMaterial(color, power, coeff) {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      power: { value: power || 3.0 },
      coeff: { value: coeff || 0.62 },
    },
    vertexShader: `
      varying vec3 vWorldN;
      varying vec3 vWorldP;
      void main() {
        vWorldN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldP = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float power;
      uniform float coeff;
      varying vec3 vWorldN;
      varying vec3 vWorldP;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldP);
        float rim = pow(clamp(coeff - dot(vWorldN, viewDir), 0.0, 1.0), power);
        gl_FragColor = vec4(glowColor, rim);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  });
}

// Procedural planet skin: gradient base + gas bands + soft blotches.
function makePlanetTexture(c1, c2, banded) {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 512;
  const x = cv.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 512);

  if (banded) {
    for (let i = 0; i < 26; i++) {
      const y = Math.random() * 512;
      const h = U.rand(6, 34);
      x.fillStyle = `rgba(255,255,255,${U.rand(0.03, 0.12)})`;
      x.fillRect(0, y, 1024, h);
      x.fillStyle = `rgba(0,0,0,${U.rand(0.04, 0.14)})`;
      x.fillRect(0, y + h, 1024, U.rand(4, 14));
    }
  }
  for (let i = 0; i < 90; i++) {
    const r = U.rand(8, 60);
    x.beginPath();
    x.ellipse(Math.random() * 1024, Math.random() * 512, r, r * U.rand(0.4, 0.9), 0, 0, 7);
    x.fillStyle = Math.random() > 0.5
      ? `rgba(255,255,255,${U.rand(0.02, 0.08)})`
      : `rgba(0,0,0,${U.rand(0.03, 0.1)})`;
    x.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function makeRingTexture(color) {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 16;
  const x = cv.getContext("2d");
  for (let i = 0; i < 256; i++) {
    const a = (Math.sin(i * 0.5) * 0.5 + 0.5) * U.rand(0.15, 0.6);
    x.fillStyle = `rgba(255,255,255,${a})`;
    x.fillRect(i, 0, 1, 16);
  }
  const tex = new THREE.CanvasTexture(cv);
  return tex;
}

function createPlanet(opts) {
  const group = new THREE.Group();
  const radius = opts.radius || 8;

  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 64),
    new THREE.MeshStandardMaterial({
      map: makePlanetTexture(opts.c1, opts.c2, opts.banded),
      roughness: 0.95,
      metalness: 0.0,
    })
  );
  surface.rotation.z = U.rand(-0.4, 0.4);
  group.add(surface);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.22, 48, 48),
    makeGlowMaterial(opts.glow || opts.c1, opts.glowPower, opts.glowCoeff)
  );
  group.add(glow);

  if (opts.rings) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 1.5, radius * 2.5, 96),
      new THREE.MeshBasicMaterial({
        map: makeRingTexture(opts.rings),
        color: opts.rings,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      })
    );
    ring.rotation.x = Math.PI / 2 - U.rand(0.2, 0.5);
    ring.rotation.y = U.rand(-0.3, 0.3);
    group.add(ring);
  }

  const spin = opts.spin || 0.06;
  return {
    group,
    update(t) {
      surface.rotation.y = t * spin;
    },
  };
}

window.createPlanet = createPlanet;
