/* ============================================================================
   charts.js — Moteur de courbes premium (Atelier Process)
   Refonte design uniquement — les signatures sont conservées pour ne rien
   casser dans views_process.js / views_quality.js

   Améliorations :
   - Courbes lissées Catmull-Rom → Bézier (au lieu de segments droits)
   - Remplissage en aire dégradée sous la courbe
   - Halo lumineux (shadow blur) sur la ligne
   - Points lumineux avec pic mis en évidence
   - Barres avec dégradé vertical et coins arrondis
   - Donut avec dégradé diagonal et ombre douce
   ============================================================================ */

const PREMIUM_FONT = "'Outfit', system-ui, sans-serif";
const PREMIUM_MONO = "'JetBrains Mono', monospace";
const PREMIUM_MUTED = "#9a9aa4";
const PREMIUM_LINE = "rgba(255,255,255,0.08)";
const PREMIUM_INK = "#f5f5f7";

/* Lit une variable CSS du thème courant (réactif clair/sombre).
   Utilisé par les graphiques "carte normale" (pas le hero scrap, qui reste
   toujours sombre par design). */
function cv(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v && v.trim() ? v.trim() : fallback;
}
function isLightTheme() {
  return document.documentElement.classList.contains("theme-light");
}

function dpr() { return window.devicePixelRatio || 1; }
function setupCanvas(canvas) {
  const d = dpr();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * d; canvas.height = h * d;
  const ctx = canvas.getContext("2d");
  ctx.scale(d, d);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

/* ---------- Catmull-Rom → Bézier pour des courbes lissées ---------- */
function smoothBezierPath(points, tension = 0.35) {
  if (points.length < 2) return "";
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
   DARK HERO LINE — courbe scrap ultra premium
   - Animation de tracé gauche → droite (aire + ligne)
   - Pic pulsant (halo qui respire)
   - Ligne de moyenne + label
   - Hover crosshair + tooltip date/valeur
   - Callout élégant sur le pic
   ============================================================================ */
function drawLineChartDark(canvas, labels, values, opts = {}) {
  // Stocker l'instance d'animation précédente pour cleanup
  if (canvas._scrapAnim) {
    cancelAnimationFrame(canvas._scrapAnim.rafId);
    canvas.removeEventListener("mousemove", canvas._scrapAnim.onMove);
    canvas.removeEventListener("mouseleave", canvas._scrapAnim.onLeave);
  }

  const padding = { top: 28, right: 56, bottom: 36, left: 44 };
  const peak = Math.max(...values);
  const peakIdx = values.indexOf(peak);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = total / Math.max(1, values.length);
  const n = values.length;

  // Pré-calcul de la géométrie (indépendante du DPR)
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const stepX = n > 1 ? chartW / (n - 1) : 0;
  const pts = values.map((v, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + chartH - (Math.max(1, ...values) > 0 ? (v / Math.max(1, ...values)) * chartH : 0),
  }));

  // ---- Helpers géométrie ----
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  // ---- State d'animation ----
  const state = {
    startTime: performance.now(),
    duration: opts.noAnim ? 0 : 1100,
    hoverIdx: -1,
    hoverX: 0,
    hoverY: 0,
    rafId: null,
  };

  function drawFrame(t) {
    const elapsed = t - state.startTime;
    const progress = Math.min(1, elapsed / Math.max(1, state.duration));
    const eased = easeOutQuart(progress);
    const lineProgress = Math.max(0, Math.min(1, (progress - 0.05) * 1.07));
    const pointsProgress = Math.max(0, (progress - 0.55) * 2.2);
    const maxVal = Math.max(1, ...values);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // ========== GRID ==========
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#71717a";
    ctx.font = `500 10px ${PREMIUM_MONO}`;
    ctx.textAlign = "right";
    const gridLines = 4;
    for (let g = 0; g <= gridLines; g++) {
      const y = padding.top + (chartH / gridLines) * g;
      ctx.beginPath();
      if (g !== gridLines) ctx.setLineDash([2, 4]);
      ctx.moveTo(padding.left, y + 0.5);
      ctx.lineTo(padding.left + chartW, y + 0.5);
      ctx.stroke();
      const val = Math.round(maxVal - (maxVal / gridLines) * g);
      ctx.fillText(val, padding.left - 8, y + 3);
    }
    ctx.setLineDash([]);
    ctx.textAlign = "left";

    // ========== MOYENNE (ligne pointillée horizontale) ==========
    if (avg > 0 && progress > 0.2) {
      const avgY = padding.top + chartH - (avg / maxVal) * chartH;
      const avgAlpha = Math.min(1, (progress - 0.2) * 2);
      ctx.save();
      ctx.globalAlpha = avgAlpha;
      ctx.strokeStyle = "rgba(251, 146, 60, 0.5)"; // orange subtil
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(padding.left, avgY);
      ctx.lineTo(padding.left + chartW, avgY);
      ctx.stroke();
      // Label "Moy"
      ctx.fillStyle = "rgba(251, 146, 60, 0.85)";
      ctx.font = `600 9.5px ${PREMIUM_MONO}`;
      ctx.textAlign = "left";
      const lbl = `MOY · ${Math.round(avg)}`;
      const tw = ctx.measureText(lbl).width;
      // Fond du label
      ctx.fillStyle = "rgba(28, 14, 8, 0.85)";
      const lblX = padding.left + chartW - tw - 12;
      const lblY = avgY - 18;
      roundRect(ctx, lblX, lblY, tw + 16, 16, 5);
      ctx.fill();
      ctx.fillStyle = "#fdba74";
      ctx.fillText(lbl, lblX + 8, lblY + 11.5);
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ========== CHEMIN LIGNE + AIRE ==========
    const linePath = smoothBezierPath(pts);
    const areaPath = linePath + ` L ${pts[n - 1].x} ${padding.top + chartH} L ${pts[0].x} ${padding.top + chartH} Z`;

    // AIRE avec clip animation
    if (lineProgress > 0) {
      const clipX = padding.left + chartW * lineProgress;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, clipX, h);
      ctx.clip();

      const areaGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      areaGrad.addColorStop(0, "rgba(244,63,94,0.50)");
      areaGrad.addColorStop(0.5, "rgba(244,63,94,0.18)");
      areaGrad.addColorStop(1, "rgba(244,63,94,0.00)");
      ctx.fillStyle = areaGrad;
      ctx.fill(new Path2D(areaPath));

      // HALO sous la ligne
      ctx.shadowColor = "rgba(244,63,94,0.7)";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "rgba(244,63,94,0.4)";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(new Path2D(linePath));
      ctx.shadowBlur = 0;

      // LIGNE principale
      const lineGrad = ctx.createLinearGradient(padding.left, 0, padding.left + chartW, 0);
      lineGrad.addColorStop(0, "#fb7185");
      lineGrad.addColorStop(0.5, "#f43f5e");
      lineGrad.addColorStop(1, "#e11d48");
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2.5;
      ctx.stroke(new Path2D(linePath));
      ctx.restore();
    }

    // ========== POINTS (stagger reveal) ==========
    pts.forEach((p, i) => {
      const pp = Math.max(0, Math.min(1, (pointsProgress - i * 0.04) * 2.5));
      if (pp <= 0) return;
      ctx.save();
      ctx.globalAlpha = pp;
      ctx.scale(1, 1);
      const scale = 0.6 + 0.4 * easeOutCubic(pp);
      const isPeak = i === peakIdx;
      const r = isPeak ? 5 : 3.5;
      if (isPeak) {
        ctx.shadowColor = "rgba(244,63,94,0.9)";
        ctx.shadowBlur = 14;
        ctx.fillStyle = "#f43f5e";
      } else {
        ctx.fillStyle = "#fda4af";
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * scale, 0, Math.PI * 2);
      ctx.fill();
      if (!isPeak) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#0c0c10";
        ctx.beginPath();
        ctx.arc(p.x, p.y, (r - 1.5) * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // ========== PIC PULSANT (continu après animation) ==========
    if (progress >= 1 && peakIdx >= 0 && peak > 0) {
      const pp = pts[peakIdx];
      const pulse = 1 + Math.sin(t / 380) * 0.45;
      // Anneau extérieur pulsant
      ctx.save();
      ctx.globalAlpha = 0.35 - (pulse - 0.55) * 0.5;
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(244,63,94,0.9)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 12 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // Anneau 2 (plus grand, plus lent)
      const pulse2 = 1 + Math.sin(t / 700 + 1.2) * 0.7;
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = "#fb7185";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 18 * pulse2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ========== HOVER CROSSHAIR + TOOLTIP ==========
    if (state.hoverIdx >= 0 && state.hoverIdx < n && progress >= 1) {
      const hi = state.hoverIdx;
      const hp = pts[hi];
      const hv = values[hi];
      const hlbl = labels[hi];

      // Ligne verticale en pointillé
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(hp.x, padding.top);
      ctx.lineTo(hp.x, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point mis en évidence
      ctx.fillStyle = "#fafaf9";
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Tooltip
      const tipText1 = hlbl;
      const tipText2 = `${hv} pièce${hv > 1 ? "s" : ""}`;
      ctx.font = `600 10.5px ${PREMIUM_MONO}`;
      const tw1 = ctx.measureText(tipText1).width;
      ctx.font = `700 13px ${PREMIUM_MONO}`;
      const tw2 = ctx.measureText(tipText2).width;
      const tipW = Math.max(tw1, tw2) + 24;
      const tipH = 48;
      let tipX = hp.x - tipW / 2;
      let tipY = hp.y - tipH - 16;
      // Clamp horizontalement
      if (tipX < 4) tipX = 4;
      if (tipX + tipW > w - 4) tipX = w - tipW - 4;
      // Si pas de place en haut, placer en bas
      if (tipY < 4) tipY = hp.y + 16;

      // Fond du tooltip avec ombre
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "rgba(15, 15, 20, 0.96)";
      ctx.strokeStyle = "rgba(244,63,94,0.4)";
      ctx.lineWidth = 1;
      roundRect(ctx, tipX, tipY, tipW, tipH, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Flèche vers le point
      ctx.fillStyle = "rgba(15, 15, 20, 0.96)";
      const arrowX = Math.max(tipX + 8, Math.min(tipX + tipW - 8, hp.x));
      if (tipY < hp.y) {
        ctx.beginPath();
        ctx.moveTo(arrowX, tipY + tipH);
        ctx.lineTo(arrowX - 5, tipY + tipH - 6);
        ctx.lineTo(arrowX + 5, tipY + tipH - 6);
        ctx.closePath();
        ctx.fill();
      }

      // Textes
      ctx.fillStyle = "#a1a1aa";
      ctx.font = `500 9.5px ${PREMIUM_MONO}`;
      ctx.textAlign = "left";
      ctx.fillText(tipText1.toUpperCase(), tipX + 12, tipY + 17);
      ctx.fillStyle = "#fafaf9";
      ctx.font = `700 13px ${PREMIUM_MONO}`;
      ctx.fillText(tipText2, tipX + 12, tipY + 36);
      ctx.textAlign = "left";
      ctx.restore();
    }

    // ========== CALLOUT DU PIC (badge élégant permanent) ==========
    if (progress >= 1 && peakIdx >= 0 && peak > 0) {
      const pp = pts[peakIdx];
      const calloutText = `MAX · ${peak}`;
      ctx.save();
      ctx.font = `700 10.5px ${PREMIUM_MONO}`;
      const ctw = ctx.measureText(calloutText).width;
      let cx = pp.x - ctw / 2 - 10;
      let cy = pp.y - 36;
      // Clamp (marge de sécurité généreuse pour ne jamais toucher le bord de la carte)
      if (cx < 8) cx = 8;
      if (cx + ctw + 20 > w - 10) cx = w - ctw - 30;
      // Badge avec dégradé rouge + glow
      ctx.shadowColor = "rgba(244,63,94,0.6)";
      ctx.shadowBlur = 16;
      const grad = ctx.createLinearGradient(cx, cy, cx, cy + 22);
      grad.addColorStop(0, "#f43f5e");
      grad.addColorStop(1, "#e11d48");
      ctx.fillStyle = grad;
      roundRect(ctx, cx, cy, ctw + 20, 22, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Texte
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(calloutText, cx + (ctw + 20) / 2, cy + 11);
      // Petite flèche vers le point
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.moveTo(pp.x, cy + 22);
      ctx.lineTo(pp.x - 4, cy + 22 - 5);
      ctx.lineTo(pp.x + 4, cy + 22 - 5);
      ctx.closePath();
      ctx.fill();
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.restore();
    }

    // ========== AXIS LABELS X (avec stagger subtil) ==========
    const labelStagger = Math.max(0, (progress - 0.3) * 1.5);
    ctx.fillStyle = "#a1a1aa";
    ctx.font = `500 10.5px ${PREMIUM_FONT}`;
    ctx.textAlign = "center";
    labels.forEach((lbl, i) => {
      const lp = Math.max(0, Math.min(1, (labelStagger - i * 0.02) * 2));
      ctx.globalAlpha = lp;
      ctx.fillText(lbl, pts[i].x, h - 10);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";

    // Continue l'animation pour pulse + hover
    state.rafId = requestAnimationFrame(drawFrame);
  }

  // ---- Event handlers (hover) ----
  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relX = x - padding.left;
    if (relX < 0 || relX > chartW || n === 0) {
      state.hoverIdx = -1;
    } else {
      const idx = Math.max(0, Math.min(n - 1, Math.round(relX / stepX)));
      state.hoverIdx = idx;
    }
    state.hoverX = x;
    state.hoverY = y;
  }
  function onLeave() {
    state.hoverIdx = -1;
  }

  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mouseleave", onLeave);
  // Cleanup cursor
  canvas.style.cursor = "crosshair";

  canvas._scrapAnim = { rafId: null, onMove, onLeave };

  // Lance l'animation
  state.rafId = requestAnimationFrame((t) => {
    state.startTime = t;
    drawFrame(t);
  });

  return { padding, chartW, chartH, stepX, count: n };
}

/* ---------- Helper: rounded rectangle path ---------- */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
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
   BAR CHART LIGHT — fond clair, dégradé + arrondi
   ============================================================================ */
function drawBarChartLight(canvas, labels, values, color = "#4f46e5") {
  const { ctx, w, h } = setupCanvas(canvas);
  const padding = { top: 20, right: 8, bottom: 36, left: 24 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const maxVal = Math.max(1, ...values);
  const lineColor = cv("--line", PREMIUM_LINE);
  const inkColor = cv("--ink", PREMIUM_INK);
  const mutedColor = cv("--muted", PREMIUM_MUTED);

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartH + 0.5);
  ctx.lineTo(padding.left + chartW, padding.top + chartH + 0.5);
  ctx.stroke();

  const barGap = 8;
  const barW = Math.max(6, chartW / values.length - barGap);
  values.forEach((v, idx) => {
    const x = padding.left + idx * (barW + barGap) + barGap / 2;
    const barH = maxVal > 0 ? (v / maxVal) * chartH : 0;
    const y = padding.top + chartH - barH;

    const grad = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + "22");
    ctx.fillStyle = barH > 0 ? grad : lineColor;

    ctx.beginPath();
    const r = 4;
    ctx.moveTo(x, padding.top + chartH);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + barW - r, y);
    ctx.arcTo(x + barW, y, x + barW, y + r, r);
    ctx.lineTo(x + barW, padding.top + chartH);
    ctx.closePath();
    ctx.fill();

    if (v > 0) {
      ctx.fillStyle = inkColor;
      ctx.font = `600 10.5px ${PREMIUM_MONO}`;
      ctx.textAlign = "center";
      ctx.fillText(v, x + barW / 2, y - 5);
    }

    ctx.fillStyle = mutedColor;
    ctx.font = `500 10.5px ${PREMIUM_FONT}`;
    ctx.textAlign = "center";
    const lbl = String(labels[idx]);
    ctx.fillText(lbl.length > 12 ? lbl.slice(0, 11) + "…" : lbl, x + barW / 2, h - 8);
  });
  ctx.textAlign = "left";
}

/* ============================================================================
   BAR CHART (dark) — courbe des barres rouge néon
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

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(148,163,184,0.7)";
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
    grad.addColorStop(0, "#fb7185");
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
   BAR CHART HORIZONTAL — fond clair, dégradé + arrondi
   ============================================================================ */
function drawHBarChart(canvas, labels, values, color = "#4f46e5") {
  const dpr = window.devicePixelRatio || 1;
  const rowH = 30;
  const cssWidth = canvas.clientWidth || 400;
  const cssHeight = Math.max(canvas.clientHeight || 0, labels.length * rowH + 16);
  canvas.style.height = cssHeight + "px";
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  ctx.font = `600 11px ${PREMIUM_MONO}`;
  const measured = labels.map((l) => ctx.measureText(l).width);
  const labelW = Math.min(Math.max(...measured, 40) + 10, cssWidth * 0.42);
  const valueW = 32;
  const chartW = cssWidth - labelW - valueW - 8;
  const maxVal = Math.max(1, ...values);
  const inkColor = cv("--ink-2", "#e4e4e9");
  const trackColor = cv("--line-soft", "#1a1a21");
  const valueColor = cv("--ink", "#f5f5f7");

  values.forEach((v, idx) => {
    const y = 8 + idx * rowH;
    const barH = 16;
    const barW = maxVal > 0 ? Math.max((v / maxVal) * chartW, 2) : 0;

    ctx.fillStyle = inkColor;
    ctx.font = `600 11px ${PREMIUM_MONO}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let label = labels[idx];
    // Si le libellé ne tient toujours pas (colonne plafonnée à 42% de la largeur), on tronque proprement avec "…"
    if (measured[idx] > labelW - 10) {
      while (label.length > 1 && ctx.measureText(label + "…").width > labelW - 10) {
        label = label.slice(0, -1);
      }
      label += "…";
    }
    ctx.fillText(label, 0, y + barH / 2);

    // track
    ctx.fillStyle = trackColor;
    const tr = 5;
    ctx.beginPath();
    ctx.moveTo(labelW, y);
    ctx.lineTo(labelW + chartW - tr, y);
    ctx.arcTo(labelW + chartW, y, labelW + chartW, y + tr, tr);
    ctx.lineTo(labelW + chartW, y + barH - tr);
    ctx.arcTo(labelW + chartW, y + barH, labelW + chartW - tr, y + barH, tr);
    ctx.lineTo(labelW, y + barH);
    ctx.closePath();
    ctx.fill();

    // bar dégradée
    if (barW > 0) {
      const grad = ctx.createLinearGradient(labelW, 0, labelW + barW, 0);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + "cc");
      ctx.fillStyle = grad;
      ctx.beginPath();
      const br = Math.min(5, barW / 2);
      ctx.moveTo(labelW, y);
      ctx.lineTo(labelW + barW - br, y);
      ctx.arcTo(labelW + barW, y, labelW + barW, y + br, br);
      ctx.lineTo(labelW + barW, y + barH - br);
      ctx.arcTo(labelW + barW, y + barH, labelW + barW - br, y + barH, br);
      ctx.lineTo(labelW, y + barH);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = valueColor;
    ctx.font = `700 11.5px ${PREMIUM_MONO}`;
    ctx.textAlign = "right";
    ctx.fillText(String(v), cssWidth, y + barH / 2);
    ctx.textAlign = "left";
  });
  ctx.textBaseline = "alphabetic";
}

/* ============================================================================
   DONUT — dégradé + ombre douce
   ============================================================================ */
function drawDonutChart(canvas, segments) {
  const { ctx, w, h } = setupCanvas(canvas);
  const cx = w / 2, cy = h / 2;
  const R = Math.min(cx, cy) - 6;
  const r = R * 0.6;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 14;
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
    g.addColorStop(1, seg.color + "cc");
    ctx.fillStyle = g;
    ctx.fill();
    a += slice;
  });
  ctx.restore();

  ctx.fillStyle = cv("--ink", "#f5f5f7");
  ctx.font = `700 20px ${PREMIUM_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(total), cx, cy);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}
