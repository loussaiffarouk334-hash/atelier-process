/* ============================================================================
   views.js — Génération du HTML (mêmes classes / mêmes codes couleur que
   la maquette originale React). Chaque fonction renvoie une chaîne HTML.
============================================================================ */

const CAUSES_INTERVENTION = ["Tension Over Limit", "Stitches Over Limit", "Stitches Under Limit", "Préventif", "Réglage qualité", "Autre"];
const CAUSES_SCRAP = ["Overlimit", "Underlimit", "Hors Tension", "Paused Sewing", "Problem IT"];
const PROJETS = ["MBEAM", "NCAR", "DCROSS", "AYGO"];
const SECTIONS = ["Section 1", "Section 2", "Section 3", "Section 4"];
const CORR_TYPES = ["Correction Points", "Correction Tension"];
const ROLES = [
  { value: "process", label: "Process" },
  { value: "qualite", label: "Qualité" },
  { value: "admin", label: "Administrateur" },
];

function esc(v) {
  if (v === null || v === undefined) return "";
  return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function causeLabel(c) {
  return c || "—";
}

/* ------------------------------------ PORTAIL ------------------------------------ */
function renderPortal() {
  return `
  <div class="min-h-screen bg-slate-50 flex flex-col justify-between p-6 relative overflow-hidden select-none">
    <div class="absolute inset-0 portal-bg-grid pointer-events-none"></div>
    <div class="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

    <div class="flex flex-col items-center text-center mt-12 relative z-10">
      <div class="relative w-14 h-14 bg-indigo-600 rounded-xl shadow-md flex items-center justify-center mb-4 border border-indigo-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      </div>
      <h1 class="text-slate-900 font-display text-3xl font-extrabold tracking-tight">ATELIER PROCESS</h1>
      <p class="text-slate-400 font-sans text-xs uppercase tracking-widest font-bold mt-1.5">Traçabilité Airbag</p>
    </div>

    <div class="max-w-4xl mx-auto w-full my-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 px-4">
      <button data-action="open-portal-password" data-role="process" class="group text-left bg-white border border-slate-200 hover:border-indigo-500/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between h-[280px] cursor-pointer">
        <div>
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <h2 class="text-xl font-display font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">PROCESS PRODUCTION</h2>
          <p class="text-slate-500 font-sans text-sm mt-3 leading-relaxed">Suivi des interventions techniques, réglages des sections de points, correctifs de tensions, et historique machines. Accès restreint.</p>
        </div>
        <div class="flex items-center text-xs font-bold text-indigo-600/80 group-hover:text-indigo-600 mt-4">
          <span class="mr-1">Accéder à l'espace technique</span> &rarr;
        </div>
      </button>

      <button data-action="open-portal-password" data-role="qualite" class="group text-left bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between h-[280px] cursor-pointer">
        <div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/></svg>
          </div>
          <h2 class="text-xl font-display font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">CONTRÔLE QUALITÉ</h2>
          <p class="text-slate-500 font-sans text-sm mt-3 leading-relaxed">Déclarations et statistiques de scrap de production en temps réel. Accès protégé par mot de passe.</p>
        </div>
        <div class="flex items-center text-xs font-bold text-emerald-600/80 group-hover:text-emerald-600 mt-4">
          <span class="mr-1">Déclarer &amp; analyser les rebuts</span> &rarr;
        </div>
      </button>
    </div>

    <div class="text-center text-xs text-slate-400 font-medium relative z-10 mb-4 uppercase tracking-wider">
      Sélectionnez un espace pour continuer
    </div>
  </div>`;
}

function renderPasswordModal(role, errorMsg) {
  const cfg = role === "process"
    ? { title: "Espace Process Protégé", label: "Mot de passe d'accès", color: "indigo" }
    : { title: "Espace Qualité Protégé", label: "Mot de passe d'accès", color: "emerald" };
  return `
  <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-action="close-password-modal-backdrop">
    <div class="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-xl overflow-hidden anim-modal" onclick="event.stopPropagation()">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-display font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-${cfg.color}-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            ${cfg.title}
          </h3>
          <button data-action="close-password-modal" class="text-slate-400 hover:text-slate-600 text-xl cursor-pointer">&times;</button>
        </div>
        <form data-action="submit-password" data-role="${role}" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">${cfg.label}</label>
            <input type="password" name="password" placeholder="••••••••" autofocus
              class="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-800 text-sm focus:outline-none focus:border-${cfg.color}-600 font-mono" />
            ${errorMsg ? `<p class="text-rose-600 text-xs mt-2 flex items-center gap-1">⚠ ${esc(errorMsg)}</p>` : ""}
          </div>
          <div class="flex gap-2 justify-end pt-2">
            <button type="button" data-action="close-password-modal" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs py-2.5 px-4 rounded-lg cursor-pointer">Retour</button>
            <button type="submit" class="bg-${cfg.color}-600 hover:bg-${cfg.color}-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg cursor-pointer shadow-sm">Déverrouiller l'accès</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
}

/* --------------------------------- Toast helper (JS) --------------------------------- */
function showToast(msg) {
  const box = document.getElementById("global-toast");
  const msgEl = document.getElementById("global-toast-msg");
  msgEl.textContent = msg;
  box.classList.remove("hidden");
  box.classList.add("flex", "anim-toast");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    box.classList.add("hidden");
    box.classList.remove("flex");
  }, 2800);
}
