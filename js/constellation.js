/* ===== Constellation: write a name in stars + connecting lines ===== */
/* window.createConstellation(text, {scene, position, width, color}) */

function createConstellation(text, opts) {
  const W = 900, H = 240, STEP = 8;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const x = cv.getContext("2d");
  x.fillStyle = "#fff";
  x.textAlign = "center";
  x.textBaseline = "middle";
  let fs = 160;
  x.font = `bold ${fs}px Georgia, serif`;
  while (x.measureText(text).width > W - 70 && fs > 24) {
    fs -= 6;
    x.font = `bold ${fs}px Georgia, serif`;
  }
  x.fillText(text, W / 2, H / 2);

  const data = x.getImageData(0, 0, W, H).data;
  const pts = [];
  for (let yy = 0; yy < H; yy += STEP) {
    for (let xx = 0; xx < W; xx += STEP) {
      if (data[(yy * W + xx) * 4 + 3] > 128) {
        pts.push({ x: xx + U.rand(-2, 2), y: yy + U.rand(-2, 2) });
      }
    }
  }

  const scaleW = opts.width || 70;
  const s = scaleW / W;
  const positions = new Float32Array(pts.length * 3);
  pts.forEach((p, i) => {
    positions[i * 3] = (p.x - W / 2) * s;
    positions[i * 3 + 1] = -(p.y - H / 2) * s;
    positions[i * 3 + 2] = U.rand(-1.5, 1.5);
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const starSize = opts.starSize || 1.2;
  const mat = new THREE.PointsMaterial({
    size: starSize,
    map: window.makeStarTexture(),
    color: opts.color || 0xffe9b0,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(geo, mat);

  // Connect each star to up to 2 nearby stars → a constellation web.
  const linePos = [];
  const thr = STEP * 2.3 * s;
  for (let i = 0; i < pts.length; i++) {
    let cnt = 0;
    for (let j = i + 1; j < pts.length && cnt < 2; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) * s;
      if (d < thr) {
        linePos.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        );
        cnt++;
      }
    }
  }
  const lgeo = new THREE.BufferGeometry();
  lgeo.setAttribute("position", new THREE.Float32BufferAttribute(linePos, 3));
  const lmat = new THREE.LineBasicMaterial({
    color: opts.color || 0xffe9b0,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lgeo, lmat);

  const group = new THREE.Group();
  group.add(lines);
  group.add(stars);
  group.position.copy(opts.position);
  opts.scene.add(group);

  return {
    group,
    update(t) {
      mat.size = starSize + Math.sin(t * 2) * 0.28;
      lmat.opacity = 0.2 + Math.sin(t * 1.3) * 0.1;
      group.position.y = opts.position.y + Math.sin(t * 0.6) * 0.6;
    },
  };
}

window.createConstellation = createConstellation;
