/* ============================================================================
   ATELIER PROCESS — Premium Charts Engine
   Remplace js/charts.js — conserve les mêmes signatures de fonction
   pour ne rien casser dans views_process.js / views_quality.js.
   ============================================================================
   Améliorations clés :
   - Courbes lissées Catmull-Rom → Bézier (au lieu de segments droits)
   - Remplissage en aire dégradée sous la courbe
   - Halo lumineux (shadow blur) sur la ligne
   - Points de données lumineux avec pic mis en évidence
   - Barres avec dégradé vertical
   - Donut avec dégradé diagonal et ombre douce
   - Polices : Outfit + JetBrains Mono
   ============================================================================ */

const PREMIUM_FONT = "'Outfit', system-ui, sans-serif";
const PREMIUM_MONO = "'JetBrains Mono', monospace";
const PREMIUM_MUTED = '#71717a';
const PREMIUM_LINE = '#e7e5e4';
const PREMIUM_INK = '#0a0a0a';

function dpr() { return window.devicePixelRatio || 1; }
function setupCanvas(canvas) {
  const d = dpr();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * d; canvas.height = h * d;
  const ctx = canvas.getContext('2d');
  ctx.scale(d, d);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

/* ---------- Catmull-Rom → Bezier path for smooth curves ---------- */
function smoothBezierPath(points, tension = 0.35) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ============================================================================
   SCRAP CURVE — premium dark hero (bezier + area + glow)
   ============================================================================ */
function drawLineChartDark(canvas, labels, values, opts = {}) {
  const { ctx, w, h } = setupCanvas(canvas);
  const pad = { top: 24, right: 20, bottom: 32, left: 36 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const maxVal = Math.max(1, ...values);
  const n = values.length;
  const stepX = n > 1 ? cw / (n - 1) : 0;

  // Y grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#71717a';
  ctx.font = `500 10px ${PREMIUM_MONO}`;
  ctx.textAlign = 'right';
  const gridLines = 4;
  for (let g = 0; g <= gridLines; g++) {
    const y = pad.top + (ch / gridLines) * g;
    ctx.beginPath();
    if (g !== gridLines) ctx.setLineDash([2, 4]);
    ctx.moveTo(pad.left, y + 0.5);
    ctx.lineTo(pad.left + cw, y + 0.5);
    ctx.stroke();
    const val = Math.round(maxVal - (maxVal / gridLines) * g);
    ctx.fillText(val, pad.left - 8, y + 3);
  }
  ctx.setLineDash([]);
  ctx.textAlign = 'left';

  const pts = values.map((v, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + ch - (maxVal > 0 ? (v / maxVal) * ch : 0),
  }));

  const linePath = smoothBezierPath(pts);
  const areaPath = linePath + ` L ${pts[pts.length - 1].x} ${pad.top + ch} L ${pts[0].x} ${pad.top + ch} Z`;

  // AREA (gradient)
  const areaGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
  areaGrad.addColorStop(0, 'rgba(244,63,94,0.45)');
  areaGrad.addColorStop(0.5, 'rgba(244,63,94,0.18)');
  areaGrad.addColorStop(1, 'rgba(244,63,94,0.00)');
  ctx.fillStyle = areaGrad;
  ctx.fill(new Path2D(areaPath));

  // GLOW LINE
  ctx.save();
  ctx.shadowColor = 'rgba(244,63,94,0.7)';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = 'rgba(244,63,94,0.4)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(linePath));
  ctx.restore();

  // MAIN LINE
  const lineGrad = ctx.createLinearGradient(pad.left, 0, pad.left + cw, 0);
  lineGrad.addColorStop(0, '#fb7185');
  lineGrad.addColorStop(0.5, '#f43f5e');
  lineGrad.addColorStop(1, '#e11d48');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(linePath));

  // POINTS
  const peak = Math.max(...values);
  pts.forEach((p, i) => {
    const isPeak = values[i] === peak;
    const r = isPeak ? 5 : 3.5;
    if (isPeak) {
      ctx.save();
      ctx.shadowColor = 'rgba(244,63,94,0.9)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0c0c10';
      ctx.beginPath();
      ctx.arc(p.x, p.y, r - 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (values[i] > 0) {
      ctx.fillStyle = '#fafaf9';
      ctx.font = `600 10.5px ${PREMIUM_MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText(values[i], p.x, p.y - 12);
    }
  });

  // X labels
  ctx.fillStyle = '#a1a1aa';
  ctx.font = `500 10.5px ${PREMIUM_FONT}`;
  ctx.textAlign = 'center';
  labels.forEach((lbl, i) => ctx.fillText(lbl, pts[i].x, h - 10));
  ctx.textAlign = 'left';

  return { padding: pad, chartW: cw, chartH: ch, stepX, count: n };
}

function attachLineChartClick(canvas, geometry, onClickIndex) {
  canvas.onclick = (evt) => {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const relX = x - geometry.padding.left;
    const idx = Math.round(relX / geometry.stepX);
    if (idx >= 0 && idx < geometry.count) onClickIndex(idx);
  };
}

/* ============================================================================
   BAR CHART LIGHT — gradient + rounded
   ============================================================================ */
function drawBarChartLight(canvas, labels, values, color = '#4f46e5', secondary = null) {
  const { ctx, w, h } = setupCanvas(canvas);
  const pad = { top: 20, right: 8, bottom: 36, left: 24 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const maxVal = Math.max(1, ...values, ...(secondary || []));

  // baseline
  ctx.strokeStyle = PREMIUM_LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top + ch + 0.5);
  ctx.lineTo(pad.left + cw, pad.top + ch + 0.5);
  ctx.stroke();

  const barW = (cw / values.length) * 0.62;
  const gap = (cw / values.length) * 0.38;

  values.forEach((v, i) => {
    const x = pad.left + i * (barW + gap) + gap / 2;
    const barH = maxVal > 0 ? (v / maxVal) * ch : 0;
    const y = pad.top + ch - barH;

    const g = ctx.createLinearGradient(0, y, 0, pad.top + ch);
    g.addColorStop(0, color);
    g.addColorStop(1, color + '20');
    ctx.fillStyle = barH > 0 ? g : PREMIUM_LINE + '60';

    const r = 4;
    ctx.beginPath();
    ctx.moveTo(x, pad.top + ch);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + barW - r, y);
    ctx.arcTo(x + barW, y, x + barW, y + r, r);
    ctx.lineTo(x + barW, pad.top + ch);
    ctx.closePath();
    ctx.fill();

    if (v > 0) {
      ctx.fillStyle = PREMIUM_INK;
      ctx.font = `600 10.5px ${PREMIUM_MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText(v, x + barW / 2, y - 5);
    }
    ctx.fillStyle = PREMIUM_MUTED;
    ctx.font = `500 10.5px ${PREMIUM_FONT}`;
    ctx.textAlign = 'center';
    const lbl = String(labels[i]);
    ctx.fillText(lbl.length > 12 ? lbl.slice(0, 11) + '…' : lbl, x + barW / 2, h - 8);
  });
  ctx.textAlign = 'left';
}

/* ============================================================================
   BAR CHART (dark) — used for the old "drawBarChart"
   ============================================================================ */
function drawBarChart(canvas, labels, values, opts = {}) {
  const { ctx, w, h } = setupCanvas(canvas);
  const padding = { top: 16, right: 12, bottom: 28, left: 32 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const maxVal = Math.max(1, ...values);

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(148,163,184,0.7)';
  ctx.font = `500 10px ${PREMIUM_MONO}`;
  const gridLines = 4;
  for (let g = 0; g <= gridLines; g++) {
    const y = padding.top + (chartH / gridLines) * g;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
    const val = Math.round(maxVal - (maxVal / gridLines) * g);
    ctx.fillText(val, 4, y + 3);
  }

  const barGap = 6;
  const barW = Math.max(4, chartW / values.length - barGap);
  values.forEach((v, idx) => {
    const x = padding.left + idx * (barW + barGap) + barGap / 2;
    const barH = maxVal > 0 ? (v / maxVal) * chartH : 0;
    const y = padding.top + chartH - barH;

    const grad = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
    grad.addColorStop(0, '#f87171');
    grad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = v > 0 ? grad : 'rgba(148,163,184,0.15)';

    ctx.beginPath();
    const r = 3;
    ctx.moveTo(x, y + Math.max(barH, 1));
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + barW - r, y);
    ctx.arcTo(x + barW, y, x + barW, y + r, r);
    ctx.lineTo(x + barW, y + Math.max(barH, 1));
    ctx.closePath();
    ctx.fill();
  });
  return { padding, chartW, chartH, barW, barGap, count: values.length };
}

function attachBarChartClick(canvas, geometry, onClickIndex) {
  canvas.onclick = (evt) => {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const relX = x - geometry.padding.left;
    if (relX < 0) return;
    const idx = Math.floor(relX / (geometry.barW + geometry.barGap));
    if (idx >= 0 && idx < geometry.count) onClickIndex(idx);
  };
}

/* ============================================================================
   HORIZONTAL BAR CHART
   ============================================================================ */
function drawHBarChart(canvas, labels, values, color = '#4f46e5') {
  const d = dpr();
  const rowH = 30;
  const cssW = canvas.clientWidth;
  const cssH = Math.max(canvas.clientHeight || 0, labels.length * rowH + 8);
  canvas.style.height = cssH + 'px';
  canvas.width = cssW * d; canvas.height = cssH * d;
  const ctx = canvas.getContext('2d'); ctx.scale(d, d); ctx.clearRect(0, 0, cssW, cssH);

  const lblW = 78;
  const valW = 32;
  const trackX = lblW + 4;
  const trackW = cssW - lblW - valW - 8;
  const maxVal = Math.max(1, ...values);

  values.forEach((v, idx) => {
    const y = 4 + idx * rowH;
    const barH = 16;
    const barW = maxVal > 0 ? Math.max((v / maxVal) * trackW, 2) : 0;

    ctx.fillStyle = PREMIUM_INK;
    ctx.font = `600 11px ${PREMIUM_MONO}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[idx], 0, y + barH / 2);

    // track
    ctx.fillStyle = '#f5f5f4';
    const tr = 5;
    ctx.beginPath();
    ctx.moveTo(trackX, y);
    ctx.lineTo(trackX + trackW - tr, y);
    ctx.arcTo(trackX + trackW, y, trackX + trackW, y + tr, tr);
    ctx.lineTo(trackX + trackW, y + barH - tr);
    ctx.arcTo(trackX + trackW, y + barH, trackX + trackW - tr, y + barH, tr);
    ctx.lineTo(trackX, y + barH);
    ctx.closePath();
    ctx.fill();

    if (barW > 0) {
      const g = ctx.createLinearGradient(trackX, 0, trackX + barW, 0);
      g.addColorStop(0, color);
      g.addColorStop(1, color + 'cc');
      ctx.fillStyle = g;
      ctx.beginPath();
      const br = Math.min(5, barW / 2);
      ctx.moveTo(trackX, y);
      ctx.lineTo(trackX + barW - br, y);
      ctx.arcTo(trackX + barW, y, trackX + barW, y + br, br);
      ctx.lineTo(trackX + barW, y + barH - br);
      ctx.arcTo(trackX + barW, y + barH, trackX + barW - br, y + barH, br);
      ctx.lineTo(trackX, y + barH);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = PREMIUM_INK;
    ctx.font = `700 11.5px ${PREMIUM_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(v, cssW, y + barH / 2);
    ctx.textAlign = 'left';
  });
  ctx.textBaseline = 'alphabetic';
}

/* ============================================================================
   DONUT — gradient + soft shadow
   ============================================================================ */
function drawDonutChart(canvas, segments) {
  const { ctx, w, h } = setupCanvas(canvas);
  const cx = w / 2, cy = h / 2;
  const R = Math.min(cx, cy) - 6;
  const r = R * 0.6;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.06)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 2;

  let a = -Math.PI / 2 - 0.06;
  const gap = 0.04;
  segments.forEach((seg, i) => {
    const slice = (seg.value / total) * Math.PI * 2;
    if (i > 0) a += gap;
    ctx.beginPath();
    ctx.arc(cx, cy, R, a, a + slice);
    ctx.arc(cx, cy, r, a + slice, a, true);
    ctx.closePath();
    const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    g.addColorStop(0, seg.color);
    g.addColorStop(1, seg.color + 'cc');
    ctx.fillStyle = g;
    ctx.fill();
    a += slice;
  });
  ctx.restore();

  ctx.fillStyle = '#0f172a';
  ctx.font = `700 20px ${PREMIUM_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(total), cx, cy);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}
