/* ===== Glowing flight path: a flowing line of light linking the worlds ===== */
/* window.createPathLine(scene, points[], color) */

function createPathLine(scene, points, color) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);

  // Flowing dash texture (a bright streak that scrolls along the tube).
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 4;
  const c = cv.getContext("2d");
  const g = c.createLinearGradient(0, 0, 128, 0);
  g.addColorStop(0.0, "rgba(255,255,255,0)");
  g.addColorStop(0.5, "rgba(255,255,255,0.95)");
  g.addColorStop(1.0, "rgba(255,255,255,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 128, 4);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = 16;

  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 260, 0.34, 8, false),
    new THREE.MeshBasicMaterial({
      map: tex,
      color: color || 0xff9ad5,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  scene.add(tube);

  return {
    tube,
    update(t) {
      tex.offset.x = -t * 0.14;
    },
  };
}

window.createPathLine = createPathLine;
