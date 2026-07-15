/* ============================================================================
   views_quality.js — Espace "Qualité" (protégé par mot de passe Qualite12345)
============================================================================ */

function renderQuality(state, data) {
  const lang = getLang();
  const f = state.filters.quality;
  let rows = [...data.scrapDeclarations];
  if (f.search) {
    const q = f.search.toLowerCase();
    rows = rows.filter((sd) => [sd.machine_id, sd.ligne, sd.part_number, sd.serial_number, sd.projet, sd.cause, sd.operator_name, sd.quality_tech].join(" ").toLowerCase().includes(q));
  }
  if (f.projet) rows = rows.filter((sd) => sd.projet === f.projet);
  if (f.dateFrom) rows = rows.filter((sd) => sd.date >= f.dateFrom);
  if (f.dateTo) rows = rows.filter((sd) => sd.date <= f.dateTo);

  const totalDeclarations = data.scrapDeclarations.length;
  const totalQty = data.scrapDeclarations.reduce((s, sd) => s + Number(sd.qty || 0), 0);
  const isThisMonth = (d) => { const dt = new Date(d); const now = new Date(); return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth(); };
  const thisMonth = data.scrapDeclarations.filter((sd) => isThisMonth(sd.date)).length;

  const machMap = {};
  data.scrapDeclarations.forEach((sd) => { const m = sd.machine_id || "—"; machMap[m] = (machMap[m] || 0) + Number(sd.qty || 0); });
  const machEntries = Object.entries(machMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const projetMap = {};
  data.scrapDeclarations.forEach((sd) => { const p = sd.projet || "—"; projetMap[p] = (projetMap[p] || 0) + Number(sd.qty || 0); });
  const projetColors = ["#4f46e5", "#f97316", "#10b981", "#e11d48", "#0ea5e9"];
  const projetEntries = Object.entries(projetMap).sort((a, b) => b[1] - a[1]);

  return `
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans select-none">
    <div class="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/></svg>
        </div>
        <div>
          <h1 class="text-base font-display font-extrabold tracking-tight text-slate-900 leading-none">${t("quality.title").toUpperCase()}</h1>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${t("quality.sub")}</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex gap-1.5">
          <button data-action="set-lang" data-lang="fr" class="font-mono font-bold text-[10px] py-1.5 px-3 rounded-md border text-center cursor-pointer tracking-wider transition-colors ${lang === "fr" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-400"}">FR</button>
          <button data-action="set-lang" data-lang="en" class="font-mono font-bold text-[10px] py-1.5 px-3 rounded-md border text-center cursor-pointer tracking-wider transition-colors ${lang === "en" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-400"}">EN</button>
        </div>
        ${state.currentUser && state.currentUser.role === "admin" ? `
          <button data-action="switch-screen" data-screen="process" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] py-1.5 px-3 border border-indigo-200 rounded-lg flex items-center gap-1 cursor-pointer">${t("nav.switchProcess")}</button>
        ` : ""}
        <button data-action="lock-station" class="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] py-1.5 px-3 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer">${t("quality.back")}</button>
        ${themeToggleButton()}
      </div>
    </div>

    <div class="p-6 flex-1 overflow-y-auto space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-emerald-500">
          <div class="flex items-start justify-between gap-2">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${t("quality.total")}</div>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-emerald-500 bg-emerald-50">${icon("trash", "w-3.5 h-3.5")}</div>
          </div>
          <div class="text-2xl font-display font-extrabold text-emerald-600 mt-1.5">${totalDeclarations}</div>
          <div class="text-[11px] text-slate-400 mt-1">${t("quality.total.sub")}</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-indigo-500">
          <div class="flex items-start justify-between gap-2">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${t("kpi.month")}</div>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-indigo-500 bg-indigo-50">${icon("calendar", "w-3.5 h-3.5")}</div>
          </div>
          <div class="text-2xl font-display font-extrabold text-indigo-600 mt-1.5">${thisMonth}</div>
          <div class="text-[11px] text-slate-400 mt-1">${t("kpi.month.sub")}</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-rose-500">
          <div class="flex items-start justify-between gap-2">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${t("quality.volume")}</div>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-rose-500 bg-rose-50">${icon("alertTriangle", "w-3.5 h-3.5")}</div>
          </div>
          <div class="text-2xl font-display font-extrabold text-rose-600 mt-1.5">${totalQty}</div>
          <div class="text-[11px] text-slate-400 mt-1">${t("quality.volume.sub")}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>${t("chart.scrapByMachine")}</h3>
          <canvas id="chart-scrap-machine" style="width:100%; height:${Math.max(machEntries.length * 28 + 16, 80)}px;"></canvas>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>${t("chart.scrapByProjet")}</h3>
          <div class="flex items-center gap-6">
            <canvas id="chart-scrap-projet" style="width:150px; height:150px;"></canvas>
            <div class="space-y-2 text-xs">
              ${projetEntries.map((e, idx) => `<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded inline-block" style="background:${projetColors[idx % projetColors.length]}"></span>${e[0]} <strong class="font-mono">${e[1]}</strong></div>`).join("") || `<span class="text-slate-400">—</span>`}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase">${t("btn.search")}</label>
          <input id="quality-search" type="text" value="${esc(f.search)}" placeholder="Machine, PN, opérateur..." class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs w-56 focus:border-emerald-600" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase">${t("th.projet")}</label>
          <select id="quality-projet" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs">
            <option value="">—</option>
            ${PROJETS.map((p) => `<option value="${p}" ${f.projet === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase">Du</label>
          <input id="quality-date-from" type="date" value="${f.dateFrom}" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase">Au</label>
          <input id="quality-date-to" type="date" value="${f.dateTo}" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs" />
        </div>
        <button data-action="export-scrap-declarations-csv" class="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">⬇ ${t("btn.csvExport")}</button>
        <button data-action="open-modal" data-modal="scrap" class="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">${t("btn.newScrap")}</button>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse data-table">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
                <th class="py-3 px-3">${t("th.datetime")}</th><th class="py-3 px-3">${t("th.operator")}</th><th class="py-3 px-3">Tech. Qualité</th>
                <th class="py-3 px-3">${t("th.machine")}</th><th class="py-3 px-3">${t("th.ligne")}</th><th class="py-3 px-3">${t("th.partnumber")}</th>
                <th class="py-3 px-3">N° série</th><th class="py-3 px-3">${t("th.projet")}</th><th class="py-3 px-3">${t("th.cause")}</th>
                <th class="py-3 px-3 text-right">${t("th.qty")}</th><th class="py-3 px-3 text-right">${t("th.actions")}</th>
              </tr>
            </thead>
            <tbody id="quality-tbody">${renderQualityRows(rows)}</tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`;
}

function renderQualityRows(rows) {
  if (!rows.length) return `<tr><td colspan="11" class="py-8 text-center text-slate-400">${t("empty.scrap")}</td></tr>`;
  return rows.map((sd) => `
    <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
      <td class="py-3 px-3 font-mono font-medium whitespace-nowrap">${fmtDate(sd.date)} &middot; ${esc(sd.time)}</td>
      <td class="py-3 px-3 font-medium text-slate-800">${esc(sd.operator_name) || "—"}</td>
      <td class="py-3 px-3">${esc(sd.quality_tech) || "—"}</td>
      <td class="py-3 px-3 font-mono">${esc(sd.machine_id) || "—"}</td>
      <td class="py-3 px-3 font-mono">${esc(sd.ligne) || "—"}</td>
      <td class="py-3 px-3 font-mono text-slate-800">${esc(sd.part_number) || "—"}</td>
      <td class="py-3 px-3 font-mono">${esc(sd.serial_number) || "—"}</td>
      <td class="py-3 px-3 font-semibold text-slate-700">${esc(sd.projet) || "—"}</td>
      <td class="py-3 px-3"><span class="text-slate-600 italic">${causeLabel(sd.cause)}</span></td>
      <td class="py-3 px-3 text-right"><span class="inline-flex items-center gap-1 bg-red-50 text-red-700 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border border-red-100"><span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>${sd.qty || 0}</span></td>
      <td class="py-3 px-3 text-right whitespace-nowrap">
        <button data-action="open-modal" data-modal="scrap" data-id="${sd.id}" class="text-emerald-700 hover:text-emerald-900 text-xs font-bold mr-2">${t("btn.edit")}</button>
        <button data-action="delete-item" data-type="scrap" data-id="${sd.id}" class="text-rose-600 hover:text-rose-800 text-xs font-bold">${t("btn.delete")}</button>
      </td>
    </tr>
  `).join("");
}

/* Peinture des graphiques Qualité (appelée après insertion DOM) */
function paintQualityCharts(data) {
  const machCanvas = document.getElementById("chart-scrap-machine");
  if (machCanvas) {
    const machMap = {};
    data.scrapDeclarations.forEach((sd) => { const m = sd.machine_id || "—"; machMap[m] = (machMap[m] || 0) + Number(sd.qty || 0); });
    const entries = Object.entries(machMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    drawHBarChart(machCanvas, entries.map((e) => e[0]), entries.map((e) => e[1]), "#059669");
  }
  const projetCanvas = document.getElementById("chart-scrap-projet");
  if (projetCanvas) {
    const projetMap = {};
    data.scrapDeclarations.forEach((sd) => { const p = sd.projet || "—"; projetMap[p] = (projetMap[p] || 0) + Number(sd.qty || 0); });
    const colors = ["#4f46e5", "#f97316", "#10b981", "#e11d48", "#0ea5e9"];
    const entries = Object.entries(projetMap).sort((a, b) => b[1] - a[1]);
    drawDonutChart(projetCanvas, entries.map((e, idx) => ({ label: e[0], value: e[1], color: colors[idx % colors.length] })));
  }
}
