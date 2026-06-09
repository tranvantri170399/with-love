/* ===== The flight path: a spline through the cosmos =====
   Maps scroll fraction (0..1) to camera position + look target.
   Also helps place planets just beside the path so we fly past them. */

function createJourney() {
  const V = THREE.Vector3;

  // Camera weaves left/right while diving deeper into space (−Z).
  const waypoints = [
    new V(0, 0, 96),
    new V(-22, 8, 38),
    new V(26, -10, -34),
    new V(-18, 6, -108),
    new V(12, 2, -182),
    new V(0, 6, -236),
  ];
  const curve = new THREE.CatmullRomCurve3(waypoints, false, "catmullrom", 0.5);

  // The heart is the sun of this universe — the final destination, beyond the path.
  const heartPos = new V(0, 7, -272);
  // At the finale the camera gazes slightly upward, framing the heart low and
  // the name-in-stars above it.
  const finaleLook = new V(0, 13, -270);

  const at = (f) => curve.getPointAt(U.clamp01(f));
  const tangentAt = (f) => curve.getTangentAt(U.clamp01(f));

  // Where the camera looks: ahead along the path, easing upward at the end.
  function lookTarget(f) {
    const c = U.clamp01(f);
    const ahead = curve.getPointAt(Math.min(1, c + 0.06));
    const toHeart = U.smoothstep(0.68, 1.0, c);
    return ahead.lerp(finaleLook, toHeart);
  }

  // A point offset perpendicular to the path — for parking a planet beside the route.
  // side: -1 (left) / +1 (right) relative to flight direction. up: vertical nudge.
  function beside(f, side, dist, up = 0, ahead = 0) {
    const c = U.clamp01(f + ahead);
    const p = curve.getPointAt(c);
    const tan = curve.getTangentAt(c);
    const right = new V().crossVectors(tan, new V(0, 1, 0)).normalize();
    return p.clone().addScaledVector(right, side * dist).add(new V(0, up, 0));
  }

  return { curve, heartPos, at, tangentAt, lookTarget, beside };
}

window.createJourney = createJourney;
