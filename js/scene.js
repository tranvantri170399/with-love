/* ===== Scene orchestration: fly the camera through the cosmos on scroll ===== */

(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05010f, 0.0014);

  const camera = new THREE.PerspectiveCamera(
    62, window.innerWidth / window.innerHeight, 0.1, 3000
  );

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const journey = window.createJourney();

  // ---- Lighting: the heart is the warm sun of this universe ----
  scene.add(new THREE.AmbientLight(0x5a5a82, 1.5));
  const heartLight = new THREE.PointLight(0xff7ec8, 3.2, 900, 1.3);
  heartLight.position.copy(journey.heartPos);
  scene.add(heartLight);
  const fill = new THREE.DirectionalLight(0x7d8bff, 0.6);
  fill.position.set(-1, 0.6, 1);
  scene.add(fill);
  // Headlight: travels with the camera so worlds we approach catch the light.
  const headlight = new THREE.PointLight(0xcfe0ff, 1.5, 240, 1.6);
  scene.add(headlight);

  // ---- Cosmos contents ----
  const starfield = window.createStarfield(scene);

  const nebulae = [
    window.createNebula(scene, {
      pos: journey.beside(0.32, 1, 70, 10),
      colors: [0xff7ec8, 0xb388ff, 0x7c5cff], spread: 80, count: 16,
    }),
    window.createNebula(scene, {
      pos: journey.beside(0.62, -1, 80, -6),
      colors: [0x5cc8ff, 0x7c5cff, 0xff9ad5], spread: 90, count: 16,
    }),
    window.createNebula(scene, {
      pos: journey.heartPos.clone().add(new THREE.Vector3(0, 0, -8)),
      colors: [0xff5ea0, 0xff9ad5, 0xffd98e], spread: 70, count: 18,
      minScale: 50, maxScale: 130,
    }),
  ];

  const planets = [
    // Reasons planet — ringed gas giant on the right of the route
    window.createPlanet({
      radius: 11, c1: "#5ad0ff", c2: "#2a5c9c", banded: true,
      glow: 0x6fd0ff, rings: "#bfe6ff", spin: 0.05,
    }),
    // Gallery planet — warm rosy world on the left
    window.createPlanet({
      radius: 13, c1: "#ffae8b", c2: "#9c3b6e", banded: true,
      glow: 0xff9ad5, spin: 0.04,
    }),
    // Decorative distant worlds for depth
    window.createPlanet({ radius: 6, c1: "#c9b6ff", c2: "#5b3aa6", glow: 0xb388ff, spin: 0.08 }),
    window.createPlanet({ radius: 5, c1: "#ffe6a3", c2: "#b07b2e", glow: 0xffd98e, spin: 0.1 }),
  ];
  // Stations are evenly spaced along the scroll (4 sections -> frac 0, 1/3, 2/3, 1).
  // Story planets sit just ahead of their station so they frame on arrival.
  const S1 = 1 / 3, S2 = 2 / 3;
  planets[0].group.position.copy(journey.beside(S1, 1, 30, 4, 0.05));   // reasons (right)
  planets[1].group.position.copy(journey.beside(S2, -1, 34, -4, 0.05)); // gallery (left)
  planets[2].group.position.copy(journey.beside(0.16, -1, 56, 26));     // flyby
  planets[3].group.position.copy(journey.beside(0.5, 1, 54, -22));      // flyby
  planets.forEach((p) => scene.add(p.group));

  // ---- The heart: giant glowing finale ----
  const heart = window.createHeart(scene, { position: journey.heartPos, scale: 2.4 });
  const sun = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: window.makeCloudTexture(), color: 0xff6eb0,
      transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  sun.position.copy(journey.heartPos);
  sun.scale.set(120, 120, 1);
  scene.add(sun);

  // ---- Her name written in the stars, above the heart ----
  const herName = (window.CONFIG && window.CONFIG.herName) || "Em Yêu";
  const constellation = window.createConstellation(herName, {
    scene,
    position: journey.heartPos.clone().add(new THREE.Vector3(0, 19, 6)),
    width: 58,
    color: 0xfff0c0,
  });

  // ---- Glowing flight path linking the worlds ----
  const pathline = window.createPathLine(
    scene,
    [
      new THREE.Vector3(0, 2, 34),
      planets[0].group.position.clone(),
      planets[1].group.position.clone(),
      journey.heartPos.clone(),
    ],
    0xff9ad5
  );

  // ---- Shooting stars ----
  const meteors = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.18, 7),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    );
    m.userData.reset = true;
    scene.add(m);
    meteors.push(m);
  }
  function flyMeteor(m, camPos) {
    const origin = camPos.clone().add(new THREE.Vector3(U.rand(-120, 120), U.rand(40, 120), U.rand(-160, -40)));
    m.position.copy(origin);
    m.userData.vel = new THREE.Vector3(U.rand(-1, 1), U.rand(-1.4, -0.4), U.rand(-0.4, 0.6)).normalize().multiplyScalar(U.rand(1.6, 3.2));
    m.userData.life = U.rand(0.6, 1.4);
    m.userData.age = 0;
    m.lookAt(origin.clone().add(m.userData.vel));
  }

  // ---- Mouse parallax + scroll-driven progress ----
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  let targetFrac = 0;
  function onScroll() {
    const max = document.body.scrollHeight - window.innerHeight;
    targetFrac = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const clock = new THREE.Clock();
  let frac = 0, lastFrac = 0;
  const tmpUp = new THREE.Vector3();
  const right = new THREE.Vector3();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Track the eased page-scroll closely (navigation.js carries the cinematics).
    frac += (targetFrac - frac) * 0.14;
    const speed = Math.abs(frac - lastFrac);
    lastFrac = frac;
    const warp = U.smoothstep(0.0006, 0.02, speed);

    // Smooth mouse parallax.
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Camera position on the path + subtle parallax sway.
    const camP = journey.at(frac);
    const tan = journey.tangentAt(frac);
    right.crossVectors(tan, tmpUp.set(0, 1, 0)).normalize();
    camera.position.copy(camP)
      .addScaledVector(right, mouse.x * 3.5)
      .add(tmpUp.set(0, -mouse.y * 2.6, 0));

    const look = journey.lookTarget(frac)
      .addScaledVector(right, mouse.x * 5)
      .add(new THREE.Vector3(0, -mouse.y * 4, 0));
    camera.lookAt(look);

    // Headlight rides slightly ahead of the camera, down its view direction.
    headlight.position.copy(camera.position).addScaledVector(tan, 6);

    // Warp: widen the lens a touch when scrolling fast.
    camera.fov = 62 + warp * 16;
    camera.updateProjectionMatrix();

    // Update everything.
    starfield.update(t, warp);
    nebulae.forEach((n) => n.update(t));
    planets.forEach((p) => p.update(t));
    heart.update(t);
    constellation.update(t);
    pathline.update(t);
    sun.material.opacity = 0.42 + Math.sin(t * 1.8) * 0.1;

    meteors.forEach((m) => {
      if (m.userData.reset) {
        if (Math.random() < 0.004) { flyMeteor(m, camera.position); m.userData.reset = false; }
        return;
      }
      m.userData.age += 0.016;
      m.position.add(m.userData.vel);
      const k = m.userData.age / m.userData.life;
      m.material.opacity = Math.sin(Math.min(1, k) * Math.PI);
      if (k >= 1) { m.material.opacity = 0; m.userData.reset = true; }
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Expose progress for the UI (dots + progress bar).
  window.__journeyFrac = () => frac;
})();
