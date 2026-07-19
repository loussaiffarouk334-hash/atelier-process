/* ============================================================================
   views_process.js — Espace "Process" (protégé) : sidebar, topbar, et pages
============================================================================ */

function PROCESS_NAV(state) {
  const isAdmin = !!(state && state.currentUser && state.currentUser.role === "admin");
  const adminItems = [];
  if (isAdmin) adminItems.push({ key: "users", label: t("nav.users"), icon: "user" });
  adminItems.push({ key: "export", label: t("nav.export"), icon: "save" });
  return [
    { section: t("nav.section.suivi"), items: [
      { key: "dashboard", label: t("nav.dashboard"), icon: "grid" },
      { key: "journal", label: t("nav.journal"), icon: "list" },
    ]},
    { section: t("nav.section.ref"), items: [
      { key: "programmes", label: t("nav.programs"), icon: "layers" },
      { key: "machines", label: t("nav.machines"), icon: "cpu" },
    ]},
    { section: t("nav.section.admin"), items: adminItems },
  ];
}

const ICONS = {
  grid: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  list: `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>`,
  layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  cpu: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/>`,
  user: `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  save: `<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>`,
  menu: `<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>`,
  logout: `<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
  swap: `<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>`,
  sun: `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`,
  moon: `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>`,
  clipboard: `<path d="M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1z"/><rect x="5" y="4" width="14" height="17" rx="2"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/>`,
  calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  shieldAlert: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
  zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  alertTriangle: `<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  trash: `<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`,
};
function icon(name, cls) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

/* Bouton bascule thème sombre / clair — réutilisable partout (topbars + portail)
   Affiche l'icône du thème vers lequel on va basculer en cliquant. */
function themeToggleButton(extraCls) {
  return `
    <button data-action="toggle-theme" title="Thème sombre / clair" aria-label="Changer de thème" class="${extraCls || ""} relative flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-indigo-500 hover:border-indigo-500/40 transition-colors cursor-pointer">
      <span class="theme-icon-to-light">${icon("sun", "w-4 h-4")}</span>
      <span class="theme-icon-to-dark">${icon("moon", "w-4 h-4")}</span>
    </button>`;
}

function PAGE_TITLE(page) {
  return {
    dashboard: t("nav.dashboard"),
    journal: t("nav.journal"),
    programmes: t("nav.programs"),
    machines: t("nav.machines"),
    users: t("nav.users"),
    export: t("nav.export"),
  }[page];
}

function renderProcessShell(state, data) {
  const lang = getLang();
  const shiftDate = new Date().toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const activeTech = localStorage.getItem(LAST_TECH_KEY) || t("topbar.notdefined");

  return `
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans select-none relative">
    <div class="flex flex-1 relative">
      ${state.mobileMenuOpen ? `<div data-action="close-mobile-menu" class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 md:hidden"></div>` : ""}

      <aside class="bg-slate-950 text-slate-100 flex flex-col justify-between fixed md:sticky top-0 left-0 bottom-0 h-screen w-60 z-40 transition-transform duration-200 transform ${state.mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} shadow-xl border-r border-slate-900">
        <div class="flex-1 flex flex-col overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center gap-3">
              <div class="relative w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center border border-indigo-500/20 shadow-md">
                ${icon("cpu", "w-4 h-4 text-white")}
              </div>
              <div>
                <h1 class="text-sm font-display font-extrabold tracking-tight text-white leading-none">ATELIER PROCESS</h1>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-1.5">${t("brand.sub")}</span>
              </div>
            </div>
          </div>
          <div class="h-px bg-slate-800 mx-6 mb-4"></div>

          <div class="px-6 flex gap-1.5 mb-4">
            <button data-action="set-lang" data-lang="fr" class="flex-1 font-mono font-bold text-[10px] py-1.5 rounded-md border text-center cursor-pointer tracking-wider transition-colors ${lang === "fr" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}">FRANÇAIS</button>
            <button data-action="set-lang" data-lang="en" class="flex-1 font-mono font-bold text-[10px] py-1.5 rounded-md border text-center cursor-pointer tracking-wider transition-colors ${lang === "en" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}">ENGLISH</button>
          </div>

          <nav class="px-3 space-y-1">
            ${PROCESS_NAV(state).map((sec) => `
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2">${sec.section}</div>
              ${sec.items.map((it) => `
                <button data-action="nav" data-page="${it.key}"
                  class="sidebar-link w-full text-left font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${state.activePage === it.key ? "active" : ""}">
                  ${icon(it.icon, "w-4 h-4 text-slate-400")}
                  ${it.label}
                </button>
              `).join("")}
            `).join("")}
            ${state.currentUser && state.currentUser.role === "admin" ? `
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2">${t("nav.section.admin")}</div>
              <button data-action="switch-screen" data-screen="quality"
                class="sidebar-link w-full text-left font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-3 transition-colors cursor-pointer">
                ${icon("swap", "w-4 h-4 text-slate-400")}
                ${t("nav.switchQuality")}
              </button>
            ` : ""}
          </nav>
        </div>
        <div class="p-4 bg-slate-950/40 border-t border-slate-950 text-[10px] text-slate-400 leading-relaxed font-sans">
          <div class="stitch-line-light h-0.5 mb-2.5"></div>
          SQL cloud • Supabase (partagé)
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">
        <div class="bg-white border-b border-slate-200 py-3.5 px-6 flex items-center justify-between gap-4 flex-wrap relative z-20">
          <div class="flex items-center gap-3">
            <button data-action="toggle-mobile-menu" class="md:hidden p-1 text-slate-600 hover:text-slate-900 cursor-pointer">${icon("menu", "w-5 h-5")}</button>
            <h2 class="text-base font-display font-bold text-slate-900 tracking-tight">${PAGE_TITLE(state.activePage)}</h2>
          </div>
          <div class="flex items-center gap-4 text-xs font-sans">
            <div class="hidden sm:flex items-center gap-1.5 font-semibold text-slate-500">
              <span class="w-2 h-2 rounded-full bg-emerald-500 badge-pulse"></span>
              <span class="font-mono text-[10.5px] uppercase tracking-wider">CLOUD SYNC</span>
            </div>
            <div class="hidden lg:block text-slate-500 font-medium">${t("topbar.poste")} &bull; <span class="font-mono font-semibold">${shiftDate}</span></div>
            <div class="hidden sm:flex items-center gap-1 text-slate-600 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg">
              ${icon("user", "w-3.5 h-3.5 text-slate-400")}
              <span class="text-[11px]">${t("topbar.tech")} : <strong class="font-mono">${esc(activeTech)}</strong></span>
            </div>
            <button data-action="lock-station" class="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] py-1 px-3 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors">
              ${icon("logout", "w-3.5 h-3.5")} ${t("topbar.back")}
            </button>
            ${themeToggleButton()}
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
    case "users": return (state.currentUser && state.currentUser.role === "admin") ? renderUsers(state, data) : renderDashboard(state, data);
    case "export": return renderExportPage(state, data);
    default: return "";
  }
}

/* Filtre le scrap_log selon le niveau de zoom courant de la courbe (mois / jour / heure / minute) */
function scrapLogInDrillScope(scrapLog, drill) {
  let rows = [...scrapLog];
  if (drill.monthKey) {
    const [y, m] = drill.monthKey.split("-").map(Number);
    rows = rows.filter((e) => { const ed = new Date(e.date + "T00:00:00"); return ed.getFullYear() === y && ed.getMonth() + 1 === m; });
  } else {
    // Niveau "mois" : on limite aux 12 derniers mois affichés dans la courbe
    const cutoff = new Date(); cutoff.setDate(1); cutoff.setMonth(cutoff.getMonth() - 11);
    rows = rows.filter((e) => new Date(e.date + "T00:00:00") >= cutoff);
  }
  if (drill.dayKey) rows = rows.filter((e) => e.date === drill.dayKey);
  if (drill.hourKey) rows = rows.filter((e) => e.time && e.time.slice(0, 2) === drill.hourKey);
  if (drill.minuteKey) {
    const mn = Number(drill.minuteKey);
    rows = rows.filter((e) => {
      if (!e.time) return false;
      const em = Number(e.time.slice(3, 5));
      return em >= mn && em < mn + 5;
    });
  }
  return rows.sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
}

/* Construit le fil d'Ariane texte du drill scrap : mois → jour → heure → minute.
   Chaque segment (sauf le dernier, actif) est cliquable et ramène directement
   à ce niveau de zoom, en plus du bouton "retour" classique. */
function renderScrapBreadcrumb(drill, months) {
  const lang = getLang();
  const locale = lang === "en" ? "en-US" : "fr-FR";
  const crumbs = [];

  crumbs.push({ label: t("chart.allMonths"), level: "month", active: drill.level === "month" });

  if (drill.monthKey) {
    const [y, m] = drill.monthKey.split("-").map(Number);
    const monthLabel = new Date(y, m - 1, 1).toLocaleDateString(locale, { month: "long", year: "numeric" });
    crumbs.push({ label: monthLabel, level: "day", monthKey: drill.monthKey, active: drill.level === "day" });
  }
  if (drill.dayKey) {
    const dayLabel = new Date(drill.dayKey + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "long" });
    crumbs.push({ label: dayLabel, level: "hour", monthKey: drill.monthKey, dayKey: drill.dayKey, active: drill.level === "hour" && !drill.hourKey });
  }
  if (drill.hourKey) {
    const dayLabel = new Date(drill.dayKey + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "long" });
    crumbs.push({ label: `${dayLabel} ${drill.hourKey}h`, level: "minute", monthKey: drill.monthKey, dayKey: drill.dayKey, hourKey: drill.hourKey, active: drill.level === "hour" && drill.hourKey && !drill.minuteKey });
  }
  if (drill.minuteKey) {
    const dayLabel = new Date(drill.dayKey + "T00:00:00").toLocaleDateString(locale, { day: "2-digit", month: "long" });
    crumbs.push({ label: `${dayLabel} ${drill.hourKey}h${drill.minuteKey}`, level: "minute", monthKey: drill.monthKey, dayKey: drill.dayKey, hourKey: drill.hourKey, active: true, terminal: true });
  }

  return `
  <div class="flex flex-wrap items-center gap-1.5 mb-4 relative z-10 font-mono text-[11px]">
    ${crumbs.map((c, i) => `
      ${i > 0 ? `<span class="text-slate-600">→</span>` : ""}
      ${c.active
        ? `<span class="px-2.5 py-1 rounded-md bg-red-600/20 text-red-300 font-bold border border-red-500/30">${esc(c.label)}</span>`
        : `<button type="button" data-action="drill-to" data-level="${c.level}" data-month-key="${esc(c.monthKey || "")}" data-day-key="${esc(c.dayKey || "")}" data-hour-key="${esc(c.hourKey || "")}"
            class="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer transition-colors">${esc(c.label)}</button>`}
    `).join("")}
  </div>`;
}

/* ============================================================================
   ANALYSE DES INTERVENTIONS — durée, efficacité, problème (route cause) → solution
   (action pilote), pour répondre au besoin : "je veux analyser la durée et
   l'action de l'intervention, efficace ou non, et le problème et la solution
   pour chaque problème".

   Règle d'efficacité retenue (simple et explicable) : une intervention est
   jugée "efficace" si AUCUNE autre intervention pour la même machine et la
   même cause n'a été enregistrée dans les 7 jours suivants (pas de récidive).
   Si le recul est encore < 7 jours depuis l'intervention, elle est marquée
   "en observation" plutôt que jugée trop tôt.
============================================================================ */
function computeInterventionEffectiveness(interventions) {
  const toDate = (i) => new Date(`${i.date}T${i.time || "00:00"}:00`);
  const now = new Date();
  return interventions.map((iv) => {
    const t0 = toDate(iv);
    const cutoff = new Date(t0.getTime() + 7 * 24 * 3600 * 1000);
    const recurrence = interventions.some((other) => {
      if (other.id === iv.id) return false;
      if (other.machine_id !== iv.machine_id || other.cause !== iv.cause) return false;
      const t1 = toDate(other);
      return t1 > t0 && t1 <= cutoff;
    });
    let status = "effective";
    if (recurrence) status = "ineffective";
    else if (now < cutoff) status = "pending";
    return { ...iv, effectiveness: status };
  });
}

function effectivenessBadge(status) {
  if (status === "ineffective") return `<span class="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-rose-100">${t("analysis.ineffective")}</span>`;
  if (status === "pending") return `<span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-100">${t("analysis.pending")}</span>`;
  return `<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-100">${t("analysis.effective")}</span>`;
}

function renderInterventionAnalysis(interventions) {
  if (!interventions.length) return "";
  const withEff = computeInterventionEffectiveness(interventions);

  // --- Regroupement par cause : nb, durée moyenne, % efficace (parmi celles jugeables) ---
  const byCause = {};
  withEff.forEach((iv) => {
    const c = iv.cause || "—";
    if (!byCause[c]) byCause[c] = { count: 0, durationSum: 0, durationN: 0, effective: 0, judged: 0 };
    byCause[c].count += 1;
    if (iv.duration_minutes !== null && iv.duration_minutes !== undefined && iv.duration_minutes !== "") {
      byCause[c].durationSum += Number(iv.duration_minutes);
      byCause[c].durationN += 1;
    }
    if (iv.effectiveness !== "pending") {
      byCause[c].judged += 1;
      if (iv.effectiveness === "effective") byCause[c].effective += 1;
    }
  });
  const causeEntries = Object.entries(byCause).sort((a, b) => b[1].count - a[1].count);

  // --- Détail problème → solution, les plus récentes en premier ---
  const detailRows = [...withEff]
    .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))
    .slice(0, 25);

  return `
  <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
    <div>
      <h3 class="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block"></span>
        ${t("analysis.title")}
      </h3>
      <p class="text-[11.5px] text-slate-400 mt-1">${t("analysis.sub")}</p>
    </div>

    <div>
      <h4 class="text-xs font-bold text-slate-700 mb-2">${t("analysis.byCause.title")}</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-2 px-3">${t("analysis.th.cause")}</th>
              <th class="py-2 px-3 text-right">${t("analysis.th.count")}</th>
              <th class="py-2 px-3 text-right">${t("analysis.th.avgDuration")}</th>
              <th class="py-2 px-3 text-right">${t("analysis.th.effectiveness")}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${causeEntries.map(([cause, s]) => {
              const avgDur = s.durationN ? Math.round(s.durationSum / s.durationN) : null;
              const pct = s.judged ? Math.round((s.effective / s.judged) * 100) : null;
              const pctColor = pct === null ? "text-slate-400" : pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-rose-600";
              return `
              <tr class="hover:bg-slate-50">
                <td class="py-2 px-3 italic">${causeLabel(cause)}</td>
                <td class="py-2 px-3 text-right font-mono">${s.count}</td>
                <td class="py-2 px-3 text-right font-mono">${avgDur !== null ? avgDur + " min" : "—"}</td>
                <td class="py-2 px-3 text-right font-mono font-bold ${pctColor}">${pct !== null ? pct + "%" : "—"}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <h4 class="text-xs font-bold text-slate-700 mb-2">${t("analysis.detail.title")}</h4>
      <div class="overflow-x-auto max-h-80 overflow-y-auto rounded-lg border border-slate-100">
        <table class="w-full text-left text-[11px] text-slate-600 border-collapse">
          <thead class="sticky top-0 bg-slate-50">
            <tr class="border-b border-slate-200 text-[9.5px] text-slate-400 uppercase font-mono">
              <th class="py-2 px-3">${t("th.datetime")}</th>
              <th class="py-2 px-3">${t("th.machine")}</th>
              <th class="py-2 px-3">${t("analysis.th.routeCause")}</th>
              <th class="py-2 px-3">${t("analysis.th.actionPilote")}</th>
              <th class="py-2 px-3 text-right">${t("analysis.th.duration")}</th>
              <th class="py-2 px-3 text-right">${t("analysis.th.status")}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${detailRows.length ? detailRows.map((iv) => `
              <tr class="hover:bg-slate-50 cursor-pointer" data-action="open-modal" data-modal="intervention" data-id="${iv.id}">
                <td class="py-2 px-3 font-mono whitespace-nowrap">${fmtDate(iv.date)} &middot; ${esc(iv.time)}</td>
                <td class="py-2 px-3 font-mono font-bold">${esc(iv.machine_id) || "—"}</td>
                <td class="py-2 px-3 max-w-[220px] truncate" title="${esc(iv.route_cause || iv.comment || "")}">${esc(iv.route_cause || iv.comment) || "—"}</td>
                <td class="py-2 px-3">${esc(iv.action_pilote) || "—"}</td>
                <td class="py-2 px-3 text-right font-mono">${iv.duration_minutes !== null && iv.duration_minutes !== undefined && iv.duration_minutes !== "" ? iv.duration_minutes + " min" : "—"}</td>
                <td class="py-2 px-3 text-right">${effectivenessBadge(iv.effectiveness)}</td>
              </tr>
            `).join("") : `<tr><td colspan="6" class="py-6 text-center text-slate-400">${t("analysis.empty")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
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

  // --- KPI % NOK, hors tension, hors limite (identiques à la logique de l'app d'origine) ---
  const progRows = interventions.filter((i) => i.type === "Programme");
  const progNokCount = progRows.filter((i) => {
    const count = interventions.filter((x) => x.type === "Programme" && x.part_number === i.part_number && x.section === i.section).length;
    return count >= 2;
  }).length;
  const pctProgNok = progRows.length ? Math.round((progNokCount / progRows.length) * 100) : 0;

  const machineRows = interventions.filter((i) => i.type === "Machine");
  const tensionRows = machineRows.filter((i) => i.cause === "Tension Over Limit");
  const pctTension = machineRows.length ? Math.round((tensionRows.length / machineRows.length) * 100) : 0;

  const limitBreachRows = progRows.filter((i) => {
    const prog = data.partNumbers.find((p) => p.part_number === i.part_number && p.section === i.section);
    if (!prog) return false;
    const actual = Number(prog.nominal) + Number(i.after_val || 0);
    return actual > prog.max || actual < prog.min;
  });
  const pctLimit = progRows.length ? Math.round((limitBreachRows.length / progRows.length) * 100) : 0;

  const kpis = [
    { label: t("kpi.total"), value: interventions.length, sub: t("kpi.total.sub"), color: "text-slate-800", accent: "border-indigo-500", icon: "clipboard", iconColor: "text-indigo-500 bg-indigo-50" },
    { label: t("kpi.month"), value: thisMonthCount, sub: t("kpi.month.sub"), color: "text-slate-800", accent: "border-indigo-500", icon: "calendar", iconColor: "text-indigo-500 bg-indigo-50" },
    { label: t("kpi.nok"), value: pctProgNok + "%", sub: `${progNokCount} sur ${progRows.length}`, color: "text-rose-600", accent: "border-rose-500", icon: "shieldAlert", iconColor: "text-rose-500 bg-rose-50" },
    { label: t("kpi.tension"), value: pctTension + "%", sub: `${tensionRows.length} sur ${machineRows.length}`, color: "text-amber-600", accent: "border-amber-500", icon: "zap", iconColor: "text-amber-500 bg-amber-50" },
    { label: t("kpi.limit"), value: pctLimit + "%", sub: `${limitBreachRows.length} sur ${progRows.length}`, color: "text-orange-600", accent: "border-orange-500", icon: "alertTriangle", iconColor: "text-orange-500 bg-orange-50" },
    { label: t("kpi.scrap"), value: totalScrapQty, sub: t("kpi.scrap.sub"), color: "text-rose-600", accent: "border-rose-500", icon: "trash", iconColor: "text-rose-500 bg-rose-50" },
  ];

  // --- Interventions par cause ---
  const causeCount = {};
  interventions.forEach((i) => { const c = i.cause || "—"; causeCount[c] = (causeCount[c] || 0) + 1; });
  const causeEntries = Object.entries(causeCount).sort((a, b) => b[1] - a[1]);

  // --- Répartition Programme / Machine ---
  const progCount = interventions.filter((i) => i.type === "Programme").length;
  const machCount = interventions.filter((i) => i.type === "Machine").length;

  // --- Interventions par machine ---
  const machMap = {};
  interventions.forEach((i) => { const m = i.machine_id || "—"; machMap[m] = (machMap[m] || 0) + 1; });
  const machEntries = Object.entries(machMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // --- Interventions par Programme (part_number) ---
  const pnMap = {};
  interventions.filter((i) => i.type === "Programme").forEach((i) => {
    const pn = i.part_number || "—";
    pnMap[pn] = (pnMap[pn] || 0) + 1;
  });
  const pnEntries = Object.entries(pnMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // --- Vue d'ensemble de l'efficacité (7 derniers jours vs 7 jours précédents) ---
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const dayLabels = days.map((d) => d.toLocaleDateString(getLang() === "en" ? "en-US" : "fr-FR", { weekday: "short" }));
  const thisWeekValues = days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    return interventions.filter((i) => i.date === key).length;
  });
  const lastWeekValues = days.map((d) => {
    const prev = new Date(d); prev.setDate(prev.getDate() - 7);
    const key = prev.toISOString().slice(0, 10);
    return interventions.filter((i) => i.date === key).length;
  });

  // --- Courbe scrap (drill mois -> jour) ---
  const months = [];
  for (let i = 11; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); months.push(d); }
  const monthLabels = months.map((d) => d.toLocaleDateString(getLang() === "en" ? "en-US" : "fr-FR", { month: "short", year: "2-digit" }));

  const drill = state.drill;
  let chartTitle = t("chart.scrapInteractif");
  let backAction = "noop", backLabel = t("chart.allMonths");
  if (drill.level === "day" && drill.monthKey) {
    const [y, m] = drill.monthKey.split("-").map(Number);
    const label = months.find((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === drill.monthKey);
    chartTitle = `${t("chart.scrapInteractif")} — ${label ? label.toLocaleDateString(getLang() === "en" ? "en-US" : "fr-FR", { month: "long", year: "numeric" }) : drill.monthKey}`;
    backAction = "drill-back"; backLabel = t("chart.backMonths");
  } else if (drill.level === "hour" && drill.dayKey && !drill.hourKey) {
    chartTitle = `${t("chart.scrapInteractif")} — ${fmtDate(drill.dayKey)}`;
    backAction = "drill-back"; backLabel = t("chart.backDays");
  } else if (drill.level === "hour" && drill.dayKey && drill.hourKey && !drill.minuteKey) {
    chartTitle = `${t("chart.scrapInteractif")} — ${fmtDate(drill.dayKey)} · ${drill.hourKey}h`;
    backAction = "drill-back"; backLabel = t("chart.backHours");
  } else if (drill.level === "hour" && drill.dayKey && drill.hourKey && drill.minuteKey) {
    chartTitle = `${t("chart.scrapInteractif")} — ${fmtDate(drill.dayKey)} · ${drill.hourKey}h${drill.minuteKey}`;
    backAction = "drill-back"; backLabel = t("chart.backMinutes");
  }

  // --- Détail scrap (mois / jour / heure / minute) lié à l'intervention ou à la déclaration d'origine ---
  const scrapDetailRows = scrapLogInDrillScope(scrapLog, drill);
  let scrapDetailSub = t("table.scrapDetail.month");
  if (drill.level === "day") scrapDetailSub = t("table.scrapDetail.day");
  else if (drill.level === "hour" && !drill.hourKey) scrapDetailSub = t("table.scrapDetail.hour");
  else if (drill.level === "hour" && drill.hourKey && !drill.minuteKey) scrapDetailSub = t("table.scrapDetail.minute");
  else if (drill.level === "hour" && drill.hourKey && drill.minuteKey) scrapDetailSub = t("table.scrapDetail.minuteRange");

  const recentDeclarations = scrapDeclarations.slice(0, 5);
  const recentNok = interventions.filter((i) => i.scrap).slice(0, 5);

  return `
  <div class="space-y-6" id="dashboard-root">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      ${kpis.map((k) => `
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-l-4 ${k.accent}">
          <div class="flex items-start justify-between gap-2">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">${k.label}</div>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${k.iconColor}">${icon(k.icon, "w-3.5 h-3.5")}</div>
          </div>
          <div class="text-xl font-display font-extrabold ${k.color} mt-1.5">${k.value}</div>
          <div class="text-[10.5px] text-slate-400 mt-1">${k.sub}</div>
        </div>
      `).join("")}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>${t("chart.cause")}</h3>
        <canvas id="chart-cause" style="width:100%; height:180px;"></canvas>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
        <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>${t("chart.repartition")}</h3>
        <div class="flex items-center gap-6 flex-1">
          <canvas id="chart-donut-type" style="width:150px; height:150px;"></canvas>
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span> Programme <strong class="font-mono">${progCount}</strong></div>
            <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded bg-slate-300 inline-block"></span> Machine <strong class="font-mono">${machCount}</strong></div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>${t("chart.byMachine")}</h3>
        <canvas id="chart-by-machine" style="width:100%; height:${Math.max(machEntries.length * 28 + 16, 80)}px;"></canvas>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span>${t("chart.byProgram")}</h3>
        <canvas id="chart-by-program" style="width:100%; height:${Math.max(pnEntries.length * 28 + 16, 80)}px;"></canvas>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>${t("chart.efficacite")}</h3>
      <p class="text-xs text-slate-400 mb-3">${t("chart.efficacite.sub")}</p>
      <div class="flex items-center gap-4 text-xs mb-2">
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span>${t("chart.thisWeek")}</span>
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-slate-300 inline-block"></span>${t("chart.lastWeek")}</span>
      </div>
      <canvas id="chart-efficacite" style="width:100%; height:160px;"></canvas>
    </div>

    <div class="bg-slate-950 rounded-2xl p-6 shadow-lg border border-slate-900 relative overflow-hidden">
      <div class="flex items-center gap-2 text-slate-100 text-base font-display font-bold uppercase tracking-wide relative z-10">
        <span class="w-2.5 h-2.5 rounded-full bg-red-500 neon-glow"></span>
        ${t("chart.scrapInteractif")}
      </div>
      <p class="text-[12px] text-slate-400 mt-1.5 mb-3 relative z-10">${t("chart.scrapInteractif.sub")}</p>
      ${renderScrapBreadcrumb(drill, months)}
      <button data-action="${backAction}" class="text-[11px] font-mono font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg px-4 py-2 mb-4 relative z-10 cursor-pointer transition-colors">
        ${backLabel}
      </button>
      <div class="relative z-10 bg-slate-950/50 rounded-xl p-2">
        <canvas id="scrap-chart-canvas" style="width:100%; height:240px;"></canvas>
      </div>

      <div class="relative z-10 mt-5 bg-slate-950/50 rounded-xl overflow-hidden border border-slate-900">
        <div class="px-4 py-3 flex items-center justify-between flex-wrap gap-1 border-b border-slate-900">
          <h4 class="text-xs font-display font-bold text-slate-100">${t("table.scrapDetail")}</h4>
          <span class="text-[11px] text-slate-400">${scrapDetailSub} &middot; ${scrapDetailRows.length}</span>
        </div>
        <div class="overflow-x-auto max-h-72 overflow-y-auto">
          <table class="w-full text-left text-[11px] text-slate-300 border-collapse">
            <thead class="sticky top-0">
              <tr class="bg-slate-900 text-[9.5px] text-slate-500 uppercase font-mono">
                <th class="py-2.5 px-3">${t("th.datetime")}</th>
                <th class="py-2.5 px-3">${t("th.machine")}</th>
                <th class="py-2.5 px-3">${t("th.partnumber")}</th>
                <th class="py-2.5 px-3">${t("th.cause")}</th>
                <th class="py-2.5 px-3">${t("th.source")}</th>
                <th class="py-2.5 px-3">${t("th.operator")}</th>
                <th class="py-2.5 px-3 text-right">${t("th.qty")}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-900">
              ${scrapDetailRows.length ? scrapDetailRows.map((e) => `
                <tr class="hover:bg-slate-900/60 transition-colors cursor-pointer" data-action="open-modal" data-modal="${e.source === "intervention" ? "intervention" : "scrap"}" data-id="${e.source_id}">
                  <td class="py-2 px-3 font-mono whitespace-nowrap">${fmtDate(e.date)} &middot; ${esc(e.time)}</td>
                  <td class="py-2 px-3 font-mono">${esc(e.machine_id) || "—"}</td>
                  <td class="py-2 px-3 font-mono">${esc(e.part_number) || "—"}</td>
                  <td class="py-2 px-3 italic text-slate-400">${causeLabel(e.cause)}</td>
                  <td class="py-2 px-3">
                    <span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold ${e.source === "intervention" ? "bg-indigo-500/15 text-indigo-300" : "bg-emerald-500/15 text-emerald-300"}">
                      ${e.source === "intervention" ? t("source.intervention") : t("source.qualite")}
                    </span>
                  </td>
                  <td class="py-2 px-3">${esc(e.operator_name) || "—"}</td>
                  <td class="py-2 px-3 text-right"><span class="inline-flex items-center gap-1 bg-red-500/15 text-red-300 font-mono font-bold text-[10.5px] px-2 py-0.5 rounded-full">${e.qty || 0}</span></td>
                </tr>
              `).join("") : `<tr><td colspan="7" class="py-6 text-center text-slate-500">${t("empty.scrap")}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    ${renderInterventionAnalysis(interventions)}

    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span>
          <span>${t("table.qualityRecent")}</span>
        </div>
        <span class="bg-slate-100 text-slate-700 font-mono text-xs px-2 py-0.5 rounded-full">${scrapDeclarations.length}</span>
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">${t("th.datetime")}</th><th class="py-3 px-3">${t("th.operator")}</th><th class="py-3 px-3">Tech. Qualité</th>
              <th class="py-3 px-3">${t("th.machine")}</th><th class="py-3 px-3">${t("th.ligne")}</th><th class="py-3 px-3">${t("th.partnumber")}</th>
              <th class="py-3 px-3">${t("th.projet")}</th><th class="py-3 px-3">${t("th.cause")}</th><th class="py-3 px-3 text-right">${t("th.qty")}</th>
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
            `).join("") : `<tr><td colspan="9" class="py-8 text-center text-slate-400">${t("empty.scrap")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded bg-rose-600 inline-block"></span> ${t("table.nokRecent")}
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">${t("th.date")}</th><th class="py-3 px-3">${t("th.machine")}</th><th class="py-3 px-3">${t("th.partnumber")}</th>
              <th class="py-3 px-3">${t("th.section")}</th><th class="py-3 px-3">${t("th.cause")}</th><th class="py-3 px-3 text-right">${t("th.qty")}</th>
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
            `).join("") : `<tr><td colspan="6" class="py-8 text-center text-slate-400">${t("empty.interventions")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* ---------------- Peinture de tous les graphiques du dashboard (appelée après insertion DOM) ---------------- */
function paintDashboardChart(state, data) {
  const interventions = data.interventions;
  const scrapLog = data.scrapLog;

  // Interventions par cause
  const causeCanvas = document.getElementById("chart-cause");
  if (causeCanvas) {
    const causeCount = {};
    interventions.forEach((i) => { const c = i.cause || "—"; causeCount[c] = (causeCount[c] || 0) + 1; });
    const entries = Object.entries(causeCount).sort((a, b) => b[1] - a[1]);
    drawBarChartLight(causeCanvas, entries.map((e) => e[0]), entries.map((e) => e[1]), "#4f46e5");
  }

  // Donut Programme / Machine
  const donutCanvas = document.getElementById("chart-donut-type");
  if (donutCanvas) {
    const progCount = interventions.filter((i) => i.type === "Programme").length;
    const machCount = interventions.filter((i) => i.type === "Machine").length;
    drawDonutChart(donutCanvas, [
      { label: "Programme", value: progCount, color: "#4f46e5" },
      { label: "Machine", value: machCount, color: "#cbd5e1" },
    ]);
  }

  // Interventions par machine
  const machCanvas = document.getElementById("chart-by-machine");
  if (machCanvas) {
    const machMap = {};
    interventions.forEach((i) => { const m = i.machine_id || "—"; machMap[m] = (machMap[m] || 0) + 1; });
    const entries = Object.entries(machMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    drawHBarChart(machCanvas, entries.map((e) => e[0]), entries.map((e) => e[1]), "#f97316");
  }

  // Interventions par Programme
  const pnCanvas = document.getElementById("chart-by-program");
  if (pnCanvas) {
    const pnMap = {};
    interventions.filter((i) => i.type === "Programme").forEach((i) => {
      const pn = i.part_number || "—";
      pnMap[pn] = (pnMap[pn] || 0) + 1;
    });
    const entries = Object.entries(pnMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    drawHBarChart(pnCanvas, entries.map((e) => e[0]), entries.map((e) => e[1]), "#e11d48");
  }

  // Vue d'ensemble efficacité (semaine actuelle vs précédente, superposées)
  const effCanvas = document.getElementById("chart-efficacite");
  if (effCanvas) {
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const dayLabels = days.map((d) => d.toLocaleDateString(getLang() === "en" ? "en-US" : "fr-FR", { weekday: "short" }));
    const thisWeek = days.map((d) => interventions.filter((i) => i.date === d.toISOString().slice(0, 10)).length);
    drawBarChartLight(effCanvas, dayLabels, thisWeek, "#4f46e5");
  }

  // Courbe scrap interactive (mois -> jour -> heure -> minute)
  const canvas = document.getElementById("scrap-chart-canvas");
  if (canvas) {
    const drill = state.drill;
    let labels, values, keys;

    if (drill.level === "hour" && drill.dayKey && drill.hourKey) {
      // Niveau minute : tranches de 5 minutes dans l'heure sélectionnée
      labels = []; values = []; keys = [];
      for (let mn = 0; mn < 60; mn += 5) {
        const rangeEnd = mn + 5;
        labels.push(String(mn).padStart(2, "0"));
        keys.push(String(mn).padStart(2, "0"));
        values.push(scrapLog.filter((e) => {
          if (e.date !== drill.dayKey || !e.time) return false;
          const [eh, em] = e.time.split(":").map(Number);
          return eh === Number(drill.hourKey) && em >= mn && em < rangeEnd;
        }).reduce((s, e) => s + Number(e.qty || 0), 0));
      }
    } else if (drill.level === "hour" && drill.dayKey) {
      // Niveau heure : 24 tranches horaires du jour sélectionné
      labels = []; values = []; keys = [];
      for (let h = 0; h < 24; h++) {
        const hh = String(h).padStart(2, "0");
        labels.push(hh + "h");
        keys.push(hh);
        values.push(scrapLog.filter((e) => e.date === drill.dayKey && e.time && e.time.slice(0, 2) === hh).reduce((s, e) => s + Number(e.qty || 0), 0));
      }
    } else if (drill.level === "day" && drill.monthKey) {
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
      for (let i = 11; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); months.push(d); }
      labels = months.map((d) => d.toLocaleDateString(getLang() === "en" ? "en-US" : "fr-FR", { month: "short", year: "2-digit" }));
      keys = months.map((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      values = months.map((d) => scrapLog.filter((e) => {
        const ed = new Date(e.date + "T00:00:00");
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      }).reduce((s, e) => s + Number(e.qty || 0), 0));
    }

    const geometry = drawLineChartDark(canvas, labels, values, {});
    attachLineChartClick(canvas, geometry, (idx) => {
      if (drill.level === "month") {
        state.drill = { level: "day", monthKey: keys[idx], dayKey: null, hourKey: null };
        renderApp();
      } else if (drill.level === "day") {
        state.drill = { level: "hour", monthKey: drill.monthKey, dayKey: keys[idx], hourKey: null };
        renderApp();
      } else if (drill.level === "hour" && !drill.hourKey) {
        state.drill = { level: "hour", monthKey: drill.monthKey, dayKey: drill.dayKey, hourKey: keys[idx], minuteKey: null };
        renderApp();
      } else if (drill.level === "hour" && drill.hourKey) {
        // Niveau minute (feuille du drill) : filtre le tableau de détail sur la
        // tranche de 5 minutes cliquée et met à jour le fil d'Ariane.
        state.drill = { level: "hour", monthKey: drill.monthKey, dayKey: drill.dayKey, hourKey: drill.hourKey, minuteKey: keys[idx] };
        renderApp();
      }
    });
  }
}

/* --------------------------------------- JOURNAL --------------------------------------- */
function renderJournal(state, data) {
  const f = state.filters.journal;
  const lignes = Array.from(new Set(data.machines.map((m) => m.ligne).filter(Boolean))).sort();
  let rows = computeInterventionEffectiveness(data.interventions);
  if (f.search) {
    const q = f.search.toLowerCase();
    rows = rows.filter((i) => [i.machine_id, i.part_number, i.operator, i.technician, i.cause].join(" ").toLowerCase().includes(q));
  }
  if (f.type) rows = rows.filter((i) => i.type === f.type);
  if (f.projet) rows = rows.filter((i) => i.projet === f.projet);
  if (f.ligne) rows = rows.filter((i) => i.ligne === f.ligne);
  if (f.dateFrom) rows = rows.filter((i) => i.date >= f.dateFrom);
  if (f.dateTo) rows = rows.filter((i) => i.date <= f.dateTo);

  return `
  <div class="space-y-4">
    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">${t("btn.search")}</label>
        <input id="journal-search" type="text" value="${esc(f.search)}" placeholder="Machine, PN, opérateur..." class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs w-56 focus:border-indigo-600" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">${t("th.type")}</label>
        <select id="journal-type" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs">
          <option value="">—</option>
          <option value="Programme" ${f.type === "Programme" ? "selected" : ""}>Programme</option>
          <option value="Machine" ${f.type === "Machine" ? "selected" : ""}>Machine</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">${t("th.projet")}</label>
        <select id="journal-projet" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs">
          <option value="">—</option>
          ${PROJETS.map((p) => `<option value="${p}" ${f.projet === p ? "selected" : ""}>${p}</option>`).join("")}
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase">${t("th.ligne")}</label>
        <select id="journal-ligne" class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono">
          <option value="">—</option>
          ${lignes.map((l) => `<option value="${esc(l)}" ${f.ligne === l ? "selected" : ""}>${esc(l)}</option>`).join("")}
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
      <button data-action="open-modal" data-modal="intervention" class="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">${t("btn.newIntervention")}</button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse data-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">${t("th.datetime")}</th><th class="py-3 px-3">${t("th.technician")}</th><th class="py-3 px-3">${t("th.operator")}</th>
              <th class="py-3 px-3">${t("th.type")}</th><th class="py-3 px-3">${t("th.machine")}</th><th class="py-3 px-3">${t("th.partnumber")}</th>
              <th class="py-3 px-3">${t("th.section")}</th><th class="py-3 px-3">${t("th.cause")}</th><th class="py-3 px-3">${t("th.beforeAfter")}</th>
              <th class="py-3 px-3 text-center">${t("th.scrap")}</th><th class="py-3 px-3 text-right">${t("analysis.th.duration")}</th>
              <th class="py-3 px-3 text-center">${t("analysis.th.status")}</th><th class="py-3 px-3 text-right">${t("th.actions")}</th>
            </tr>
          </thead>
          <tbody id="journal-tbody">${renderJournalRows(rows)}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
function renderJournalRows(rows) {
  if (!rows.length) return `<tr><td colspan="13" class="py-8 text-center text-slate-400">${t("empty.interventions")}</td></tr>`;
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
      <td class="py-3 px-3 text-right font-mono">${i.duration_minutes !== null && i.duration_minutes !== undefined && i.duration_minutes !== "" ? i.duration_minutes + " min" : "—"}</td>
      <td class="py-3 px-3 text-center">${effectivenessBadge(i.effectiveness)}</td>
      <td class="py-3 px-3 text-right whitespace-nowrap">
        <button data-action="open-modal" data-modal="intervention" data-id="${i.id}" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold mr-2">${t("btn.edit")}</button>
        <button data-action="delete-item" data-type="intervention" data-id="${i.id}" class="text-rose-600 hover:text-rose-800 text-xs font-bold">${t("btn.delete")}</button>
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
    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase">${t("btn.search")}</label>
          <input id="programmes-search" type="text" value="${esc(f.search)}" placeholder="Part Number, section..." class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs w-64 focus:border-indigo-600" />
        </div>
        <button data-action="csv-template" data-target="programmes" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer flex items-center gap-1.5">⬇ ${t("btn.csvTemplate")}</button>
        <label class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer flex items-center gap-1.5">
          ⬆ ${t("btn.csvImport")}
          <input type="file" id="programmes-csv-input" accept=".csv" class="hidden" />
        </label>
        <button data-action="open-modal" data-modal="program" class="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">${t("btn.newProgram")}</button>
      </div>
      <p class="text-[11px] text-slate-400">💡 Colonnes CSV attendues : PartNumber, SewingJobId, Section, Min, Max, Nominal, Correction.</p>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse data-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">Part Number</th><th class="py-3 px-3">Sewing Job ID</th><th class="py-3 px-3">${t("th.section")}</th>
              <th class="py-3 px-3 text-right">Min</th><th class="py-3 px-3 text-right">Max</th>
              <th class="py-3 px-3 text-right">Nominal</th><th class="py-3 px-3 text-right">Correction</th>
              <th class="py-3 px-3 text-right">${t("th.actions")}</th>
            </tr>
          </thead>
          <tbody id="programmes-tbody">${renderProgrammesRows(rows)}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
function renderProgrammesRows(rows) {
  if (!rows.length) return `<tr><td colspan="8" class="py-8 text-center text-slate-400">${t("empty.programs")}</td></tr>`;
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
        <button data-action="open-modal" data-modal="program" data-id="${p.id}" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold mr-2">${t("btn.edit")}</button>
        <button data-action="delete-item" data-type="program" data-id="${p.id}" class="text-rose-600 hover:text-rose-800 text-xs font-bold">${t("btn.delete")}</button>
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
    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase">${t("btn.search")}</label>
          <input id="machines-search" type="text" value="${esc(f.search)}" placeholder="Machine, S/N, projet..." class="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs w-64 focus:border-indigo-600" />
        </div>
        <button data-action="csv-template" data-target="machines" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer flex items-center gap-1.5">⬇ ${t("btn.csvTemplate")}</button>
        <label class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer flex items-center gap-1.5">
          ⬆ ${t("btn.csvImport")}
          <input type="file" id="machines-csv-input" accept=".csv" class="hidden" />
        </label>
        <button data-action="open-modal" data-modal="machine" class="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">${t("btn.newMachine")}</button>
      </div>
      <p class="text-[11px] text-slate-400">💡 Colonnes CSV attendues : MachineId, SnAmatec, CodeId, Projet, Ligne, Ip, Pcb, Version, CorrectionPoints, CorrectionTension.</p>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse data-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">${t("th.machine")}</th><th class="py-3 px-3">S/N Amatec</th><th class="py-3 px-3">Code</th>
              <th class="py-3 px-3">${t("th.projet")}</th><th class="py-3 px-3">${t("th.ligne")}</th><th class="py-3 px-3">IP</th>
              <th class="py-3 px-3">PCB</th><th class="py-3 px-3">Version</th>
              <th class="py-3 px-3 text-right">Corr. Points</th><th class="py-3 px-3 text-right">Corr. Tension</th>
              <th class="py-3 px-3 text-right">${t("th.actions")}</th>
            </tr>
          </thead>
          <tbody id="machines-tbody">${renderMachinesRows(rows)}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
function renderMachinesRows(rows) {
  if (!rows.length) return `<tr><td colspan="11" class="py-8 text-center text-slate-400">${t("empty.machines")}</td></tr>`;
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
        <button data-action="open-modal" data-modal="machine" data-id="${m.id}" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold mr-2">${t("btn.edit")}</button>
        <button data-action="delete-item" data-type="machine" data-id="${m.id}" class="text-rose-600 hover:text-rose-800 text-xs font-bold">${t("btn.delete")}</button>
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
      <button data-action="open-modal" data-modal="user" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">${t("btn.newUser")}</button>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 border-collapse data-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono">
              <th class="py-3 px-3">Identifiant</th><th class="py-3 px-3">Mot de passe</th><th class="py-3 px-3">Rôle</th>
              <th class="py-3 px-3 text-center">Actif</th><th class="py-3 px-3 text-right">${t("th.actions")}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map((u) => `
              <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td class="py-3 px-3 font-semibold text-slate-800">${esc(u.username)}</td>
                <td class="py-3 px-3 font-mono">${esc(u.password)}</td>
                <td class="py-3 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === "admin" ? "bg-slate-800 text-white" : u.role === "process" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"}">${esc(u.role)}</span></td>
                <td class="py-3 px-3 text-center">${u.active ? `<span class="text-emerald-600">●</span>` : `<span class="text-slate-300">●</span>`}</td>
                <td class="py-3 px-3 text-right whitespace-nowrap">
                  <button data-action="open-modal" data-modal="user" data-id="${u.id}" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold mr-2">${t("btn.edit")}</button>
                  <button data-action="delete-item" data-type="user" data-id="${u.id}" class="text-rose-600 hover:text-rose-800 text-xs font-bold">${t("btn.delete")}</button>
                </td>
              </tr>
            `).join("") : `<tr><td colspan="5" class="py-8 text-center text-slate-400">${t("empty.users")}</td></tr>`}
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
    <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 badge-pulse"></span>
      <p class="text-xs text-emerald-800 font-semibold">Base connectée à Supabase — toutes les données sont partagées en temps réel entre tous les postes.</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 class="text-sm font-display font-bold text-slate-900 mb-2">Sauvegarde de la base (JSON)</h3>
      <p class="text-xs text-slate-500 mb-4">Télécharge une copie complète des 6 tables au format <code class="font-mono bg-slate-100 px-1.5 py-0.5 rounded">.json</code>, à conserver en lieu sûr.</p>
      <button data-action="export-json" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">⬇ Télécharger la sauvegarde .json</button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 class="text-sm font-display font-bold text-slate-900 mb-2">Restaurer une sauvegarde</h3>
      <p class="text-xs text-slate-500 mb-4">Importer un fichier <code class="font-mono bg-slate-100 px-1.5 py-0.5 rounded">.json</code> précédemment exporté. Cela remplace ENTIÈREMENT la base partagée, pour tous les postes connectés.</p>
      <input id="import-json-input" type="file" accept=".json" class="text-xs" />
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 class="text-sm font-display font-bold text-slate-900 mb-2">Export CSV — courbe scrap</h3>
      <p class="text-xs text-slate-500 mb-4">Export de la table <code class="font-mono bg-slate-100 px-1.5 py-0.5 rounded">scrap_log</code> au format CSV.</p>
      <button data-action="export-scrap-csv" class="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">⬇ Exporter scrap_log.csv</button>
    </div>

    <div class="bg-rose-50 border border-rose-200 rounded-xl p-6">
      <h3 class="text-sm font-display font-bold text-rose-800 mb-2">Réinitialiser la base</h3>
      <p class="text-xs text-rose-700 mb-4">Supprime toutes les données (sur tous les postes) et recharge le jeu de données de démonstration. Action irréversible.</p>
      <button data-action="reset-database" class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">Réinitialiser</button>
    </div>
  </div>`;
}
