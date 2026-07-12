/* ============================================================================
   charts.js — Rendu graphique "courbe scrap" (canvas natif, sans dépendance)
   Style repris de l'écran Dashboard original : fond sombre + barres néon rouge.
============================================================================ */

function drawBarChart(canvas, labels, values, opts = {}) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 600;
  const cssHeight = canvas.clientHeight || 220;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const padding = { top: 16, right: 12, bottom: 28, left: 32 };
  const chartW = cssWidth - padding.left - padding.right;
  const chartH = cssHeight - padding.top - padding.bottom;
  const maxVal = Math.max(1, ...values);

  // Grille horizontale
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  const gridLines = 4;
  ctx.fillStyle = "rgba(148,163,184,0.6)";
  ctx.font = "10px JetBrains Mono, monospace";
  for (let g = 0; g <= gridLines; g++) {
    const y = padding.top + (chartH / gridLines) * g;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
    const val = Math.round(maxVal - (maxVal / gridLines) * g);
    ctx.fillText(String(val), 4, y + 3);
  }

  const barGap = 6;
  const barW = Math.max(4, chartW / values.length - barGap);

  values.forEach((v, idx) => {
    const x = padding.left + idx * (barW + barGap) + barGap / 2;
    const barH = maxVal > 0 ? (v / maxVal) * chartH : 0;
    const y = padding.top + chartH - barH;

    const grad = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
    grad.addColorStop(0, "#f87171");
    grad.addColorStop(1, "#7f1d1d");
    ctx.fillStyle = v > 0 ? grad : "rgba(148,163,184,0.15)";

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

    if (opts.highlightIndex === idx) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Labels (affiche 1 sur n si trop nombreux)
    const skip = Math.ceil(values.length / 16);
    if (idx % skip === 0) {
      ctx.fillStyle = "rgba(148,163,184,0.8)";
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(labels[idx], x + barW / 2, cssHeight - 10);
      ctx.textAlign = "left";
    }
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

/* ------------------------------- Ligne rouge néon (scrap interactif) ------------------------------- */
function drawLineChartDark(canvas, labels, values, opts = {}) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 600;
  const cssHeight = canvas.clientHeight || 220;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const padding = { top: 24, right: 16, bottom: 28, left: 28 };
  const chartW = cssWidth - padding.left - padding.right;
  const chartH = cssHeight - padding.top - padding.bottom;
  const maxVal = Math.max(1, ...values);
  const stepX = values.length > 1 ? chartW / (values.length - 1) : chartW;

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.fillStyle = "rgba(148,163,184,0.7)";
  ctx.font = "10px JetBrains Mono, monospace";
  const gridLines = 3;
  for (let g = 0; g <= gridLines; g++) {
    const y = padding.top + (chartH / gridLines) * g;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
    const val = Math.round(maxVal - (maxVal / gridLines) * g);
    ctx.fillText(String(val), 2, y + 3);
  }
  ctx.setLineDash([]);

  const pts = values.map((v, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + chartH - (maxVal > 0 ? (v / maxVal) * chartH : 0),
  }));

  // Ligne
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "rgba(239,68,68,0.6)";
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Points + valeurs
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, opts.highlightIndex === i ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#fca5a5";
    ctx.fill();
    if (values[i] > 0) {
      ctx.fillStyle = "#fecaca";
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(values[i]), p.x, p.y - 8);
    }
    const skip = Math.ceil(values.length / 14);
    if (i % skip === 0) {
      ctx.fillStyle = "rgba(148,163,184,0.8)";
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(labels[i], p.x, cssHeight - 8);
    }
  });
  ctx.textAlign = "left";

  return { padding, chartW, chartH, stepX, count: values.length };
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

/* ------------------------------- Barres verticales (fond clair) ------------------------------- */
function drawBarChartLight(canvas, labels, values, color = "#4f46e5") {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 400;
  const cssHeight = canvas.clientHeight || 180;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const padding = { top: 20, right: 8, bottom: 34, left: 20 };
  const chartW = cssWidth - padding.left - padding.right;
  const chartH = cssHeight - padding.top - padding.bottom;
  const maxVal = Math.max(1, ...values);

  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartH);
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.stroke();

  const barGap = 10;
  const barW = Math.max(6, chartW / values.length - barGap);
  values.forEach((v, idx) => {
    const x = padding.left + idx * (barW + barGap) + barGap / 2;
    const barH = maxVal > 0 ? (v / maxVal) * chartH : 0;
    const y = padding.top + chartH - barH;
    ctx.fillStyle = color;
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

    ctx.fillStyle = "#334155";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    if (v > 0) ctx.fillText(String(v), x + barW / 2, y - 4);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "8.5px Inter, sans-serif";
    ctx.save();
    ctx.translate(x + barW / 2, cssHeight - 6);
    const lbl = labels[idx].length > 12 ? labels[idx].slice(0, 11) + "…" : labels[idx];
    ctx.fillText(lbl, 0, 0);
    ctx.restore();
    ctx.textAlign = "left";
  });
}

/* ------------------------------- Barres horizontales (fond clair) ------------------------------- */
function drawHBarChart(canvas, labels, values, color = "#4f46e5") {
  const dpr = window.devicePixelRatio || 1;
  const rowH = 28;
  const cssWidth = canvas.clientWidth || 400;
  const cssHeight = Math.max(canvas.clientHeight || 0, labels.length * rowH + 16);
  canvas.style.height = cssHeight + "px";
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const labelW = 64;
  const valueW = 34;
  const chartW = cssWidth - labelW - valueW - 12;
  const maxVal = Math.max(1, ...values);

  values.forEach((v, idx) => {
    const y = 8 + idx * rowH;
    const barH = 14;
    const barW = maxVal > 0 ? (v / maxVal) * chartW : 0;

    ctx.fillStyle = "#334155";
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.textAlign = "left";
    ctx.fillText(labels[idx], 0, y + barH - 3);

    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(labelW, y, chartW, barH);
    ctx.fillStyle = color;
    ctx.fillRect(labelW, y, Math.max(barW, 2), barH);

    ctx.fillStyle = "#334155";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText(String(v), labelW + chartW + 6, y + barH - 3);
  });
}

/* ------------------------------- Donut ------------------------------- */
function drawDonutChart(canvas, segments) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 200;
  const cssHeight = canvas.clientHeight || 200;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const cx = cssWidth / 2, cy = cssHeight / 2;
  const outerR = Math.min(cx, cy) - 6;
  const innerR = outerR * 0.6;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let angle = -Math.PI / 2;
  segments.forEach((seg) => {
    const slice = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    angle += slice;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 20px Space Grotesk, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(total), cx, cy);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}
