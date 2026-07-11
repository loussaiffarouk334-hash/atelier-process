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
