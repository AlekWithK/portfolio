(function () {
  const canvas = document.getElementById('contour-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Simple pseudo-noise field built from layered sine waves.
  function fieldValue(x, y, t) {
    const s1 = Math.sin(x * 0.0028 + t * 0.00012) * Math.cos(y * 0.0032 - t * 0.00009);
    const s2 = Math.sin((x + y) * 0.0016 - t * 0.00015) * 0.6;
    const s3 = Math.cos(x * 0.0011 - y * 0.0014 + t * 0.0001) * 0.4;
    return s1 + s2 + s3;
  }

  const LEVELS = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9];

  function colorForLevel(i) {
    // alternate teal / ochre / sage at low opacity, echoing the legend palette
    const palette = ['#3D8C8C', '#3D8C8C', '#8FA89B', '#C97D4A', '#8FA89B', '#3D8C8C', '#3D8C8C'];
    return palette[i % palette.length];
  }

  // Draws flowing isoline-style contours: for each elevation level, scan a
  // horizontal baseline and displace it vertically by the noise field's value.
  function drawSmooth(t) {
    ctx.clearRect(0, 0, width, height);
    const rowStep = 22;

    LEVELS.forEach((level, idx) => {
      ctx.beginPath();
      ctx.strokeStyle = colorForLevel(idx);
      ctx.lineWidth = 1.1;
      ctx.globalAlpha = 0.3;

      for (let y = -rowStep; y < height + rowStep; y += rowStep) {
        let started = false;
        for (let x = 0; x <= width; x += 6) {
          const v = fieldValue(x, y, t);
          const offset = v * 38; // displacement amplitude
          const py = y + offset;
          if (!started) {
            ctx.moveTo(x, py);
            started = true;
          } else {
            ctx.lineTo(x, py);
          }
        }
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  resize();
  window.addEventListener('resize', resize);

  if (prefersReducedMotion) {
    drawSmooth(0);
  } else {
    let frame;
    function loop(timestamp) {
      drawSmooth(timestamp);
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);
  }
})();
