/* ============================================================================
   views_process.js — Espace "Process" (protégé) : sidebar, topbar, et pages
============================================================================ */

const PROCESS_NAV = [
  { section: "Suivi", items: [
    { key: "dashboard", label: "Tableau de bord", icon: "grid" },
    { key: "journal", label: "Journal interventions", icon: "list" },
  ]},
  { section: "Référentiels", items: [
    { key: "programmes", label: "Programmes (Part Number)", icon: "layers" },
    { key: "machines", label: "Machines", icon: "cpu" },
  ]},
  { section: "Administration", items: [
    { key: "users", label: "Utilisateurs & Mots de passe", icon: "user" },
    { key: "export", label: "Export / Import", icon: "save" },
  ]},
];

const ICONS = {
  grid: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  list: `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>`,
  layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  cpu: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/>`,
  user: `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  save: `<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>`,
  menu: `<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>`,
  logout: `<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
};
function icon(name, cls) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

const PAGE_TITLES = {
  dashboard: "Tableau de bord",
  journal: "Journal interventions",
  programmes: "Programmes (Part Number)",
  machines: "Machines",
  users: "Utilisateurs & Mots de passe",
  export: "Export / Import",
};

function renderProcessShell(state, data) {
  const shiftDate = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const activeTech = localStorage.getItem(LAST_TECH_KEY) || "non défini";

  return `
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans select-none relative">
    <div class="bg-slate-900 text-slate-300 text-center py-2 px-4 font-semibold text-xs tracking-wide shadow-inner border-b border-slate-950 relative z-30">
      🔒 Espace Process — Base SQLite locale (sql.js)
    </div>

    <div class="flex flex-1 relative">
      ${state.mobileMenuOpen ? `<div data-action="close-mobile-menu" class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 md:hidden"></div>` : ""}

      <aside class="bg-slate-950 text-slate-100 flex flex-col justify-between fixed md:sticky top-0 left-0 bottom-0 h-[calc(100vh-32px)] w-60 z-40 transition-transform duration-200 transform ${state.mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} shadow-xl border-r border-slate-900">
        <div class="flex-1 flex flex-col overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center gap-3">
              <div class="relative w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center border border-indigo-500/20 shadow-md">
                ${icon("cpu", "w-4 h-4 text-white")}
              </div>
              <div>
                <h1 class="text-sm font-display font-extrabold tracking-tight text-white leading-none">ATELIER PROCESS</h1>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-1.5">Traçabilité Airbag</span>
              </div>
            </div>
          </div>
          <div class="h-px bg-slate-800 mx-6 mb-4"></div>

          <nav class="px-3 space-y-1">
            ${PROCESS_NAV.map((sec) => `
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2">${sec.section}</div>
              ${sec.items.map((it) => `
                <button data-action="nav" data-page="${it.key}"
                  class="sidebar-link w-full text-left font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${state.activePage === it.key ? "active" : ""}">
                  ${icon(it.icon, "w-4 h-4 text-slate-400")}
                  ${it.label}
                </button>
              `).join("")}
            `).join("")}
          </nav>
        </div>
        <div class="p-4 bg-slate-950/40 border-t border-slate-950 text-[10px] text-slate-400 leading-relaxed font-sans">
          <div class="stitch-line-light h-0.5 mb-2.5"></div>
          Base SQL locale • sql.js (SQLite/WASM) • Toutes les écritures sont persistées automatiquement.
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">
        <div class="bg-white border-b border-slate-200 py-3.5 px-6 flex items-center justify-between gap-4 flex-wrap relative z-20">
          <div class="flex items-center gap-3">
            <button data-action="toggle-mobile-menu" class="md:hidden p-1 text-slate-600 hover:text-slate-900 cursor-pointer">${icon("menu", "w-5 h-5")}</button>
            <h2 class="text-base font-display font-bold text-slate-900 tracking-tight">${PAGE_TITLES[state.activePage]}</h2>
          </div>
          <div class="flex items-center gap-4 text-xs font-sans">
            <div class="hidden sm:flex items-center gap-1.5 font-semibold text-slate-500">
              <span class="w-2 h-2 rounded-full bg-emerald-500 badge-pulse"></span>
              <span class="font-mono text-[10.5px] uppercase tracking-wider">SQL LOCAL</span>
            </div>
            <div class="hidden lg:block text-slate-500 font-medium">Poste &bull; <span class="font-mono font-semibold">${shiftDate}</span></div>
            <div class="hidden sm:flex items-center gap-1 text-slate-600 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg">
              ${icon("user", "w-3.5 h-3.5 text-slate-400")}
              <span class="text-[11px]">Technicien : <strong class="font-mono">${esc(activeTech)}</strong></span>
            </div>
            <button data-action="lock-station" class="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] py-1 px-3 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors">
              ${icon("logout", "w-3.5 h-3.5")} Retour
            </button>
          </div>
        </div>

        <div class="p-6 flex-1 overflow-y-auto" id="page-content">
          ${renderPage(state, data)}
        </div>
      </div>
    </div>
  </div>`;
}

function renderPage(state, data) {
  switch (state.activePage) {
    case "dashboard": return renderDashboard(state, data);
    case "journal": return renderJournal(state, data);
    case "programmes": return renderProgrammes(state, data);
    case "machines": return renderMachines(state, data);
    case "users": return renderUsers(state, data);
    case "export": return renderExportPage(state, data);
    default: return "";
  }
}

/* ------------------------------------- DASHBOARD ------------------------------------- */
function renderDashboard(state, data) {
  const interventions = data.interventions;
  const scrapLog = data.scrapLog;
  const scrapDeclarations = data.scrapDeclarations;

  const isThisMonth = (d) => {
    const dt = new Date(d);
    const now = new Date();
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
  };
  const thisMonthCount = interventions.filter((i) => isThisMonth(i.date)).length;
  const totalScrapQty = scrapLog.reduce((s, e) => s + Number(e.qty || 0), 0);
  const totalDeclarations = scrapDeclarations.length;
  const nokCount = interventions.filter((i) => i.scrap).length;

  const kpis = [
    { label: "Interventions (mois)", value: thisMonthCount, sub: `${interventions.length} au total`, color: "indigo" },
    { label: "Scrap total (qté)", value: totalScrapQty, sub: `${scrapLog.length} événements`, color: "rose" },
    { label: "Déclarations qualité", value: totalDeclarations, sub: "table scrap_declarations", color: "emerald" },
    { label: "Interventions avec scrap", value: nokCount, sub: "table interventions", color: "amber" },
  ];

  // Courbe scrap par mois (12 derniers mois) à partir de scrap_log
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(d);
  }
  const monthLabels = months.map((d) => d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }));
  const monthKeys = months.map((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  const monthValues = months.map((d) =>
    scrapLog.filter((e) => {
      const ed = new Date(e.date + "T00:00:00");
      return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
    }).reduce((s, e) => s + Number(e.qty || 0), 0)
  );

  const drill = state.drill;
  let chartLabels = monthLabels, chartValues = monthValues, chartKeys = monthKeys, chartTitle = "Courbe scrap — 12 derniers mois";
  if (drill.level === "day" && drill.monthKey) {
    const [y, m] = drill.monthKey.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    chartLabels = []; chartValues = []; chartKeys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      chartLabels.push(String(d));
      chartKeys.push(dateStr);
      chartValues.push(scrapLog.filter((e) => e.date === dateStr).reduce((s, e) => s + Number(e.qty || 0), 0));
    }
    const label = months.find((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === drill.monthKey);
    chartTitle = `Courbe scrap — ${label ? label.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : drill.monthKey}`;
  }

  const recentDeclarations = scrapDeclarations.slice(0, 5);
  const recentNok = interventions.filter((i) => i.scrap).slice(0, 5);

  return `
  <div class="space-y-6" id="dashboard-root">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      ${kpis.map((k) => `
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${k.label}</div>
          <div class="text-2xl font-display font-extrabold text-${k.color}-600 mt-1.5">${k.value}</div>
          <div class="text-[11px] text-slate-400 mt-1">${k.sub}</div>
        </div>
      `).join("")}
    </div>

    <div class="bg-slate-950 rounded-2xl p-5 shadow-lg border border-slate-900 relative overflow-hidden">
      <div class="flex items-center justify-between mb-4 relative z-10">
        <div class="flex items-center gap-2 text-slate-200 text-sm font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 neon-glow"></span>
          ${chartTitle}
        </div>
        ${drill.level === "day" ? `<button data-action="drill-back" class="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1">← retour aux mois</button>` : `<span class="text-[10px] text-slate-500 font-mono">clic sur un mois pour détailler</span>`}
      </div>
      <div class="relative z-10 bg-slate-950/50 rounded-xl p-2">
        <canvas id="scrap-chart-canvas" style="width:100%; height:220px;"></canvas>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span>
          <span>Déclarations qualité récentes</span>
          <span class="text-xs text-slate-400 font-normal">table scrap_declarations</span>
        </div>
        <span class="bg-slate-100 text-slate-700 font-mono text-xs px-2 py-0.5 rounded-full">${scrapDeclarations.length}</span>
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">Date / Heure</th><th class="py-3 px-3">Opérateur</th><th class="py-3 px-3">Tech. Qualité</th>
              <th class="py-3 px-3">Machine</th><th class="py-3 px-3">Ligne</th><th class="py-3 px-3">Part Number</th>
              <th class="py-3 px-3">Projet</th><th class="py-3 px-3">Cause</th><th class="py-3 px-3 text-right">Qté</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${recentDeclarations.length ? recentDeclarations.map((sd) => `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-3 font-mono font-medium whitespace-nowrap">${fmtDate(sd.date)} &middot; ${esc(sd.time)}</td>
                <td class="py-3 px-3 font-medium text-slate-800">${esc(sd.operator_name) || "—"}</td>
                <td class="py-3 px-3">${esc(sd.quality_tech) || "—"}</td>
                <td class="py-3 px-3 font-mono">${esc(sd.machine_id) || "—"}</td>
                <td class="py-3 px-3 font-mono">${esc(sd.ligne) || "—"}</td>
                <td class="py-3 px-3 font-mono text-slate-800">${esc(sd.part_number) || "—"}</td>
                <td class="py-3 px-3 font-semibold text-slate-700">${esc(sd.projet) || "—"}</td>
                <td class="py-3 px-3"><span class="text-slate-600 italic">${causeLabel(sd.cause)}</span></td>
                <td class="py-3 px-3 text-right"><span class="inline-flex items-center gap-1 bg-red-50 text-red-700 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border border-red-100"><span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>${sd.qty || 0}</span></td>
              </tr>
            `).join("") : `<tr><td colspan="9" class="py-8 text-center text-slate-400">Aucune déclaration qualité.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded bg-rose-600 inline-block"></span> Dernières interventions avec scrap
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">Date</th><th class="py-3 px-3">Machine</th><th class="py-3 px-3">Part Number</th>
              <th class="py-3 px-3">Section</th><th class="py-3 px-3">Cause</th><th class="py-3 px-3 text-right">Qté scrap</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${recentNok.length ? recentNok.map((i) => `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-3 font-mono whitespace-nowrap">${fmtDate(i.date)}</td>
                <td class="py-3 px-3 font-mono font-bold text-slate-700">${esc(i.machine_id) || "—"}</td>
                <td class="py-3 px-3 font-mono text-slate-700">${esc(i.part_number) || "—"}</td>
                <td class="py-3 px-3 font-medium">${esc(i.section) || "—"}</td>
                <td class="py-3 px-3 text-slate-600">${causeLabel(i.cause)}</td>
                <td class="py-3 px-3 text-right"><span class="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border border-rose-100">${i.scrap_qty || 0}</span></td>
              </tr>
            `).join("") : `<tr><td colspan="6" class="py-8 text-center text-slate-400">Aucune intervention avec scrap.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* ---------------- Renderers for chart drawing, called after DOM insert (see app.js) ---------------- */
function paintDashboardChart(state, data) {
  const canvas = document.getElementById("scrap-chart-canvas");
  if (!canvas) return;
  const scrapLog = data.scrapLog;
  const drill = state.drill;

  let labels, values, keys;
  if (drill.level === "day" && drill.monthKey) {
    const [y, m] = drill.monthKey.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    labels = []; values = []; keys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      labels.push(String(d));
      keys.push(dateStr);
      values.push(scrapLog.filter((e) => e.date === dateStr).reduce((s, e) => s + Number(e.qty || 0), 0));
    }
  } else {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); months.push(d);
    }
    labels = months.map((d) => d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }));
    keys = months.map((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    values = months.map((d) => scrapLog.filter((e) => {
      const ed = new Date(e.date + "T00:00:00");
      return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
    }).reduce((s, e) => s + Number(e.qty || 0), 0));
  }

  const geometry = drawBarChart(canvas, labels, values, {});
  attachBarChartClick(canvas, geometry, (idx) => {
    if (drill.level !== "day") {
      state.drill = { level: "day", monthKey: keys[idx] };
      renderApp();
    }
  });
}

/* --------------------------------------- JOURNAL --------------------------------------- */
function renderJournal(state, data) {
  const f = state.filters.journal;
  let rows = [...data.interventions];
  if (f.search) {
    const q = f.search.toLowerCase();
    rows = rows.filter((i) => [i.machine_id, i.part_number, i.operator, i.technician, i.cause].join(" ").toLowerCase().includes(q));
  }
  if (f.type) rows = rows.filter((i) => i.type === f.type);
  if (f.projet) rows = rows.filter((i) => i.projet === f.projet);
  if (f.dateFrom) rows = rows.filter((i) => i.date >= f.dateFrom);
  if (f.dateTo) rows = rows.filter((i) => i.date <= f.dateTo);

  return `
  <div class="space-y-4">
    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">Recherche</label>
        <input id="journal-search" type="text" value="${esc(f.search)}" placeholder="Machine, PN, opérateur..." class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs w-56 focus:border-indigo-600" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">Type</label>
        <select id="journal-type" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs">
          <option value="">Tous</option>
          <option value="Programme" ${f.type === "Programme" ? "selected" : ""}>Programme</option>
          <option value="Machine" ${f.type === "Machine" ? "selected" : ""}>Machine</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">Projet</label>
        <select id="journal-projet" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs">
          <option value="">Tous</option>
          ${PROJETS.map((p) => `<option value="${p}" ${f.projet === p ? "selected" : ""}>${p}</option>`).join("")}
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">Du</label>
        <input id="journal-date-from" type="date" value="${f.dateFrom}" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">Au</label>
        <input id="journal-date-to" type="date" value="${f.dateTo}" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs" />
      </div>
      <button data-action="open-modal" data-modal="intervention" class="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">+ Nouvelle intervention</button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse data-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">Date / Heure</th><th class="py-3 px-3">Technicien</th><th class="py-3 px-3">Opérateur</th>
              <th class="py-3 px-3">Type</th><th class="py-3 px-3">Machine</th><th class="py-3 px-3">Part Number</th>
              <th class="py-3 px-3">Section</th><th class="py-3 px-3">Cause</th><th class="py-3 px-3">Avant→Après</th>
              <th class="py-3 px-3 text-center">Scrap</th><th class="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="journal-tbody">${renderJournalRows(rows)}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
function renderJournalRows(rows) {
  if (!rows.length) return `<tr><td colspan="11" class="py-8 text-center text-slate-400">Aucune intervention.</td></tr>`;
  return rows.map((i) => `
    <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
      <td class="py-3 px-3 font-mono whitespace-nowrap">${fmtDate(i.date)} &middot; ${esc(i.time)}</td>
      <td class="py-3 px-3">${esc(i.technician) || "—"}</td>
      <td class="py-3 px-3">${esc(i.operator) || "—"}</td>
      <td class="py-3 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${i.type === "Programme" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}">${esc(i.type)}</span></td>
      <td class="py-3 px-3 font-mono font-bold">${esc(i.machine_id) || "—"}</td>
      <td class="py-3 px-3 font-mono">${esc(i.part_number) || "—"}</td>
      <td class="py-3 px-3">${esc(i.section) || "—"}</td>
      <td class="py-3 px-3">${causeLabel(i.cause)}</td>
      <td class="py-3 px-3 font-mono">${i.before_val} → ${i.after_val}</td>
      <td class="py-3 px-3 text-center">${i.scrap ? `<span class="bg-red-50 text-red-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border border-red-100">${i.scrap_qty}</span>` : "—"}</td>
      <td class="py-3 px-3 text-right whitespace-nowrap">
        <button data-action="open-modal" data-modal="intervention" data-id="${i.id}" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold mr-2">Modifier</button>
        <button data-action="delete-item" data-type="intervention" data-id="${i.id}" class="text-rose-600 hover:text-rose-800 text-xs font-bold">Suppr.</button>
      </td>
    </tr>
  `).join("");
}

/* --------------------------------------- PROGRAMMES --------------------------------------- */
function renderProgrammes(state, data) {
  const f = state.filters.programmes;
  let rows = [...data.partNumbers];
  if (f.search) {
    const q = f.search.toLowerCase();
    rows = rows.filter((p) => [p.part_number, p.sewing_job_id, p.section].join(" ").toLowerCase().includes(q));
  }
  return `
  <div class="space-y-4">
    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">Recherche</label>
        <input id="programmes-search" type="text" value="${esc(f.search)}" placeholder="Part Number, section..." class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs w-64 focus:border-indigo-600" />
      </div>
      <button data-action="open-modal" data-modal="program" class="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">+ Nouveau Part Number</button>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse data-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">Part Number</th><th class="py-3 px-3">Sewing Job ID</th><th class="py-3 px-3">Section</th>
              <th class="py-3 px-3 text-right">Min</th><th class="py-3 px-3 text-right">Max</th>
              <th class="py-3 px-3 text-right">Nominal</th><th class="py-3 px-3 text-right">Correction</th>
              <th class="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="programmes-tbody">${renderProgrammesRows(rows)}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
function renderProgrammesRows(rows) {
  if (!rows.length) return `<tr><td colspan="8" class="py-8 text-center text-slate-400">Aucun Part Number enregistré.</td></tr>`;
  return rows.map((p) => `
    <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
      <td class="py-3 px-3 font-mono font-bold text-slate-800">${esc(p.part_number)}</td>
      <td class="py-3 px-3 font-mono">${esc(p.sewing_job_id) || "—"}</td>
      <td class="py-3 px-3">${esc(p.section)}</td>
      <td class="py-3 px-3 text-right font-mono">${p.min}</td>
      <td class="py-3 px-3 text-right font-mono">${p.max}</td>
      <td class="py-3 px-3 text-right font-mono">${p.nominal}</td>
      <td class="py-3 px-3 text-right font-mono font-bold ${p.correction != 0 ? "text-indigo-600" : ""}">${p.correction}</td>
      <td class="py-3 px-3 text-right whitespace-nowrap">
        <button data-action="open-modal" data-modal="program" data-id="${p.id}" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold mr-2">Modifier</button>
        <button data-action="delete-item" data-type="program" data-id="${p.id}" class="text-rose-600 hover:text-rose-800 text-xs font-bold">Suppr.</button>
      </td>
    </tr>
  `).join("");
}

/* --------------------------------------- MACHINES --------------------------------------- */
function renderMachines(state, data) {
  const f = state.filters.machines;
  let rows = [...data.machines];
  if (f.search) {
    const q = f.search.toLowerCase();
    rows = rows.filter((m) => [m.machine_id, m.sn_amatec, m.projet, m.ligne].join(" ").toLowerCase().includes(q));
  }
  return `
  <div class="space-y-4">
    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">Recherche</label>
        <input id="machines-search" type="text" value="${esc(f.search)}" placeholder="Machine, S/N, projet..." class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs w-64 focus:border-indigo-600" />
      </div>
      <button data-action="open-modal" data-modal="machine" class="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">+ Nouvelle machine</button>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse data-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">Machine</th><th class="py-3 px-3">S/N Amatec</th><th class="py-3 px-3">Code</th>
              <th class="py-3 px-3">Projet</th><th class="py-3 px-3">Ligne</th><th class="py-3 px-3">IP</th>
              <th class="py-3 px-3">PCB</th><th class="py-3 px-3">Version</th>
              <th class="py-3 px-3 text-right">Corr. Points</th><th class="py-3 px-3 text-right">Corr. Tension</th>
              <th class="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="machines-tbody">${renderMachinesRows(rows)}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
function renderMachinesRows(rows) {
  if (!rows.length) return `<tr><td colspan="11" class="py-8 text-center text-slate-400">Aucune machine enregistrée.</td></tr>`;
  return rows.map((m) => `
    <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
      <td class="py-3 px-3 font-mono font-bold text-slate-800">${esc(m.machine_id)}</td>
      <td class="py-3 px-3 font-mono">${esc(m.sn_amatec) || "—"}</td>
      <td class="py-3 px-3">${esc(m.code_id) || "—"}</td>
      <td class="py-3 px-3 font-semibold">${esc(m.projet) || "—"}</td>
      <td class="py-3 px-3 font-mono">${esc(m.ligne) || "—"}</td>
      <td class="py-3 px-3 font-mono text-[11px]">${esc(m.ip) || "—"}</td>
      <td class="py-3 px-3">${esc(m.pcb) || "—"}</td>
      <td class="py-3 px-3 font-mono">${esc(m.version) || "—"}</td>
      <td class="py-3 px-3 text-right font-mono">${m.correction_points}</td>
      <td class="py-3 px-3 text-right font-mono">${m.correction_tension}</td>
      <td class="py-3 px-3 text-right whitespace-nowrap">
        <button data-action="open-modal" data-modal="machine" data-id="${m.id}" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold mr-2">Modifier</button>
        <button data-action="delete-item" data-type="machine" data-id="${m.id}" class="text-rose-600 hover:text-rose-800 text-xs font-bold">Suppr.</button>
      </td>
    </tr>
  `).join("");
}

/* --------------------------------------- UTILISATEURS --------------------------------------- */
function renderUsers(state, data) {
  const rows = data.users;
  return `
  <div class="space-y-4">
    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
      <p class="text-xs text-slate-500 max-w-lg">Table SQL <code class="font-mono bg-slate-100 px-1.5 py-0.5 rounded">users</code> — gère les comptes et mots de passe utilisés pour déverrouiller les espaces <strong>Process</strong> et <strong>Qualité</strong> depuis l'accueil.</p>
      <button data-action="open-modal" data-modal="user" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">+ Nouvel utilisateur</button>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse data-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">Identifiant</th><th class="py-3 px-3">Mot de passe</th><th class="py-3 px-3">Rôle</th>
              <th class="py-3 px-3 text-center">Actif</th><th class="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map((u) => `
              <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td class="py-3 px-3 font-semibold text-slate-800">${esc(u.username)}</td>
                <td class="py-3 px-3 font-mono">${"•".repeat(Math.min(10, String(u.password).length))}</td>
                <td class="py-3 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === "admin" ? "bg-slate-800 text-white" : u.role === "process" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"}">${esc(u.role)}</span></td>
                <td class="py-3 px-3 text-center">${u.active ? `<span class="text-emerald-600">●</span>` : `<span class="text-slate-300">●</span>`}</td>
                <td class="py-3 px-3 text-right whitespace-nowrap">
                  <button data-action="open-modal" data-modal="user" data-id="${u.id}" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold mr-2">Modifier</button>
                  <button data-action="delete-item" data-type="user" data-id="${u.id}" class="text-rose-600 hover:text-rose-800 text-xs font-bold">Suppr.</button>
                </td>
              </tr>
            `).join("") : `<tr><td colspan="5" class="py-8 text-center text-slate-400">Aucun utilisateur.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* --------------------------------------- EXPORT / IMPORT --------------------------------------- */
function renderExportPage(state, data) {
  return `
  <div class="space-y-6 max-w-2xl">
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 class="text-sm font-display font-bold text-slate-900 mb-2">Sauvegarde de la base SQL</h3>
      <p class="text-xs text-slate-500 mb-4">Télécharge le fichier <code class="font-mono bg-slate-100 px-1.5 py-0.5 rounded">.sqlite</code> complet (6 tables : part_numbers, machines, interventions, scrap_declarations, scrap_log, users).</p>
      <button data-action="export-sqlite" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">⬇ Télécharger la base .sqlite</button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 class="text-sm font-display font-bold text-slate-900 mb-2">Restaurer une base SQL</h3>
      <p class="text-xs text-slate-500 mb-4">Importer un fichier <code class="font-mono bg-slate-100 px-1.5 py-0.5 rounded">.sqlite</code> précédemment exporté. Cela remplace entièrement la base actuelle.</p>
      <input id="import-sqlite-input" type="file" accept=".sqlite,.db" class="text-xs" />
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 class="text-sm font-display font-bold text-slate-900 mb-2">Export CSV — déclarations scrap</h3>
      <p class="text-xs text-slate-500 mb-4">Export de la table <code class="font-mono bg-slate-100 px-1.5 py-0.5 rounded">scrap_log</code> (courbe scrap consolidée) au format CSV.</p>
      <button data-action="export-scrap-csv" class="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">⬇ Exporter scrap_log.csv</button>
    </div>

    <div class="bg-rose-50 border border-rose-200 rounded-xl p-6">
      <h3 class="text-sm font-display font-bold text-rose-800 mb-2">Réinitialiser la base</h3>
      <p class="text-xs text-rose-700 mb-4">Supprime toutes les données et recharge le jeu de données de démonstration. Action irréversible.</p>
      <button data-action="reset-database" class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">Réinitialiser</button>
    </div>
  </div>`;
}
