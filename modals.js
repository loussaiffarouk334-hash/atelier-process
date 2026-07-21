/* ============================================================================
   modals.js — Formulaires modaux de saisie/édition pour les 6 tables SQL
============================================================================ */

function renderModal(state, data) {
  if (!state.modal.type) return "";
  switch (state.modal.type) {
    case "intervention": return modalIntervention(state, data);
    case "program": return modalProgram(state, data);
    case "machine": return modalMachine(state, data);
    case "scrap": return modalScrap(state, data);
    case "user": return modalUser(state, data);
    default: return "";
  }
}

function modalShell(title, colorClass, formHtml) {
  return `
  <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-action="close-modal-backdrop">
    <div class="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-xl overflow-hidden anim-modal max-h-[90vh] flex flex-col">
      <div class="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
        <h3 class="text-base font-display font-bold text-slate-800">${title}</h3>
        <button type="button" data-action="close-modal" class="text-slate-400 hover:text-slate-600 text-xl cursor-pointer">&times;</button>
      </div>
      <div class="p-6 overflow-y-auto">${formHtml}</div>
    </div>
  </div>`;
}

function field(label, inputHtml, required) {
  return `<div class="flex flex-col gap-1">
    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${label}${required ? ` <span class="text-indigo-600 font-bold">*</span>` : ""}</label>
    ${inputHtml}
  </div>`;
}
const inputCls = "bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors";

/* --------------------------------------- INTERVENTION --------------------------------------- */
function modalIntervention(state, data) {
  const id = state.modal.editingId;
  const item = id ? data.interventions.find((i) => i.id === id) : null;
  const now = new Date();
  const machines = data.machines;
  const pns = Array.from(new Set(data.partNumbers.map((p) => p.part_number)));
  // L'équipe "maintenance" n'intervient que sur les machines (jamais sur les
  // programmes de couture) : le champ Type est verrouillé sur "Machine".
  const isMaintenance = state.currentUser && state.currentUser.role === "maintenance";

  const v = item || {
    date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5),
    technician: localStorage.getItem(LAST_TECH_KEY) || "", operator: "",
    type: isMaintenance ? "Machine" : "Programme", machine_id: machines[0]?.machine_id || "", part_number: "", section: "",
    corr_type: CORR_TYPES[0], before_val: 0, after_val: 0, cause: CAUSES_INTERVENTION[3],
    scrap: 0, scrap_qty: 0, comment: "", route_cause: "", action_pilote: "", duration_minutes: "",
    projet: PROJETS[0], ligne: machines[0]?.ligne || "",
  };
  // Compat rétroactive : les anciens enregistrements stockaient le texte dans
  // "comment" ; on le récupère comme route cause si le nouveau champ est vide.
  const routeCauseValue = v.route_cause || v.comment || "";

  const formHtml = `
    <form data-action="submit-form" data-form="intervention" data-id="${id || ""}" class="space-y-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        ${field("Date", `<input type="date" name="date" required value="${v.date}" class="${inputCls}" />`, true)}
        ${field("Heure", `<input type="time" name="time" required value="${v.time}" class="${inputCls}" />`, true)}
        ${field("Technicien", `<input type="text" name="technician" required value="${esc(v.technician)}" class="${inputCls}" />`, true)}
        ${field("Opérateur", `<input type="text" name="operator" value="${esc(v.operator)}" class="${inputCls}" />`)}
        ${field("Type", isMaintenance
            ? `<select name="type" id="intervention-type" class="${inputCls}"><option value="Machine" selected>Machine</option></select>`
            : `<select name="type" id="intervention-type" class="${inputCls}">
            <option value="Programme" ${v.type === "Programme" ? "selected" : ""}>Programme</option>
            <option value="Machine" ${v.type === "Machine" ? "selected" : ""}>Machine</option>
          </select>`)}
        ${field("Machine", `<select name="machine_id" id="intervention-machine" class="${inputCls} font-mono">
            ${machines.map((m) => `<option value="${esc(m.machine_id)}" data-ligne="${esc(m.ligne)}" ${v.machine_id === m.machine_id ? "selected" : ""}>${esc(m.machine_id)}</option>`).join("")}
          </select>`)}
        ${field("Part Number", `<select name="part_number" id="intervention-partnumber" class="${inputCls} font-mono">
            <option value="">—</option>
            ${pns.map((pn) => `<option value="${esc(pn)}" ${v.part_number === pn ? "selected" : ""}>${esc(pn)}</option>`).join("")}
          </select>`)}
        <div id="intervention-section-wrapper" style="${v.type === "Programme" ? "" : "display:none;"}">
          ${field("Section", `<select name="section" class="${inputCls}">${SECTIONS.map((s) => `<option value="${s}" ${v.section === s ? "selected" : ""}>${s}</option>`).join("")}</select>`)}
        </div>
        ${field("Type de correction", `<select name="corr_type" class="${inputCls}">${CORR_TYPES.map((c) => `<option value="${c}" ${v.corr_type === c ? "selected" : ""}>${c}</option>`).join("")}</select>`)}
        ${field("Cause", `<select name="cause" class="${inputCls}">${CAUSES_INTERVENTION.map((c) => `<option value="${c}" ${v.cause === c ? "selected" : ""}>${c}</option>`).join("")}</select>`)}
        ${field("Avant", `<input type="number" step="0.01" name="before_val" value="${v.before_val}" class="${inputCls} font-mono" />`)}
        ${field("Après", `<input type="number" step="0.01" name="after_val" value="${v.after_val}" class="${inputCls} font-mono" />`)}
        ${field("Projet", `<select name="projet" class="${inputCls}">${PROJETS.map((p) => `<option value="${p}" ${v.projet === p ? "selected" : ""}>${p}</option>`).join("")}</select>`)}
        ${field("Ligne", `<input type="text" name="ligne" id="intervention-ligne-input" readonly value="${esc(v.ligne)}" class="bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-500 font-mono font-bold cursor-not-allowed" />`)}
        ${field(t("field.duration"), `<input type="number" min="0" step="1" name="duration_minutes" value="${esc(v.duration_minutes)}" placeholder="ex: 45" class="${inputCls} font-mono" />`)}
      </div>

      <div class="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg p-3">
        <label class="flex items-center gap-2 text-xs font-bold text-red-700 cursor-pointer">
          <input type="checkbox" name="scrap" ${v.scrap ? "checked" : ""} class="w-4 h-4" /> Cette intervention génère du scrap
        </label>
        <input type="number" min="0" name="scrap_qty" value="${v.scrap_qty}" placeholder="Qté" class="${inputCls} font-mono w-24 ml-auto" />
      </div>

      ${field(t("field.routeCause"), `<textarea name="route_cause" required rows="2" placeholder="Cause racine identifiée : pourquoi le problème est survenu" class="${inputCls}">${esc(routeCauseValue)}</textarea>`, true)}
      ${field(t("field.actionPilote"), `<textarea name="action_pilote" required rows="2" placeholder="Action concrète réalisée pour résoudre ce problème (ex: remplacement du ressort tendeur, recalibrage du capteur...)" class="${inputCls}">${esc(v.action_pilote)}</textarea>`, true)}

      <div class="flex gap-2 justify-end pt-4 border-t border-slate-100">
        <button type="button" data-action="close-modal" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">Annuler</button>
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg cursor-pointer">Enregistrer</button>
      </div>
    </form>`;

  return modalShell(item ? "Modifier l'intervention" : "Nouvelle intervention", "indigo", formHtml);
}

/* --------------------------------------- PROGRAM (Part Number) --------------------------------------- */
function modalProgram(state, data) {
  const id = state.modal.editingId;
  const item = id ? data.partNumbers.find((p) => p.id === id) : null;
  const v = item || { part_number: "", sewing_job_id: "", section: "Section 1", min: 0, max: 0, nominal: 0, correction: 0 };

  const formHtml = `
    <form data-action="submit-form" data-form="program" data-id="${id || ""}" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        ${field("Part Number", `<input type="text" name="part_number" required value="${esc(v.part_number)}" class="${inputCls} font-mono" />`, true)}
        ${field("Sewing Job ID", `<input type="text" name="sewing_job_id" value="${esc(v.sewing_job_id)}" class="${inputCls} font-mono" />`)}
        ${field("Section", `<select name="section" class="${inputCls}">${SECTIONS.map((s) => `<option value="${s}" ${v.section === s ? "selected" : ""}>${s}</option>`).join("")}</select>`)}
        ${field("Nominal", `<input type="number" step="0.01" name="nominal" value="${v.nominal}" class="${inputCls} font-mono" />`)}
        ${field("Min", `<input type="number" step="0.01" name="min" value="${v.min}" class="${inputCls} font-mono" />`)}
        ${field("Max", `<input type="number" step="0.01" name="max" value="${v.max}" class="${inputCls} font-mono" />`)}
        ${field("Correction", `<input type="number" step="0.01" name="correction" value="${v.correction}" class="${inputCls} font-mono" />`)}
      </div>
      <div class="flex gap-2 justify-end pt-4 border-t border-slate-100">
        <button type="button" data-action="close-modal" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">Annuler</button>
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg cursor-pointer">Enregistrer</button>
      </div>
    </form>`;
  return modalShell(item ? "Modifier le Part Number" : "Nouveau Part Number", "indigo", formHtml);
}

/* --------------------------------------- MACHINE --------------------------------------- */
function modalMachine(state, data) {
  const id = state.modal.editingId;
  const item = id ? data.machines.find((m) => m.id === id) : null;
  const v = item || { machine_id: "", sn_amatec: "", code_id: "", projet: PROJETS[0], ligne: "", ip: "", pcb: "V3", version: "", correction_points: 0, correction_tension: 0 };

  const formHtml = `
    <form data-action="submit-form" data-form="machine" data-id="${id || ""}" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        ${field("Machine ID", `<input type="text" name="machine_id" required value="${esc(v.machine_id)}" class="${inputCls} font-mono" />`, true)}
        ${field("S/N Amatec", `<input type="text" name="sn_amatec" value="${esc(v.sn_amatec)}" class="${inputCls} font-mono" />`)}
        ${field("Code ID", `<input type="text" name="code_id" value="${esc(v.code_id)}" class="${inputCls}" />`)}
        ${field("Projet", `<select name="projet" class="${inputCls}">${PROJETS.map((p) => `<option value="${p}" ${v.projet === p ? "selected" : ""}>${p}</option>`).join("")}</select>`)}
        ${field("Ligne", `<input type="text" name="ligne" value="${esc(v.ligne)}" class="${inputCls} font-mono" />`)}
        ${field("Adresse IP", `<input type="text" name="ip" value="${esc(v.ip)}" class="${inputCls} font-mono" />`)}
        ${field("PCB", `<input type="text" name="pcb" value="${esc(v.pcb)}" class="${inputCls}" />`)}
        ${field("Version", `<input type="text" name="version" value="${esc(v.version)}" class="${inputCls} font-mono" />`)}
        ${field("Correction Points", `<input type="number" step="0.01" name="correction_points" value="${v.correction_points}" class="${inputCls} font-mono" />`)}
        ${field("Correction Tension", `<input type="number" step="0.01" name="correction_tension" value="${v.correction_tension}" class="${inputCls} font-mono" />`)}
      </div>
      <div class="flex gap-2 justify-end pt-4 border-t border-slate-100">
        <button type="button" data-action="close-modal" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">Annuler</button>
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg cursor-pointer">Enregistrer</button>
      </div>
    </form>`;
  return modalShell(item ? "Modifier la machine" : "Nouvelle machine", "indigo", formHtml);
}

/* --------------------------------------- SCRAP (Qualité) --------------------------------------- */
function modalScrap(state, data) {
  const id = state.modal.editingId;
  const item = id ? data.scrapDeclarations.find((s) => s.id === id) : null;
  const now = new Date();
  const machines = data.machines;
  const pns = Array.from(new Set(data.partNumbers.map((p) => p.part_number)));

  const v = item || {
    date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5),
    operator_name: "", quality_tech: localStorage.getItem(LAST_QTECH_KEY) || "",
    machine_id: machines[0]?.machine_id || "", ligne: machines[0]?.ligne || "",
    part_number: "", serial_number: "", projet: PROJETS[0], cause: CAUSES_SCRAP[0], qty: 1, comment: "",
  };

  const formHtml = `
    <form data-action="submit-form" data-form="scrap" data-id="${id || ""}" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        ${field("Date", `<input type="date" name="date" required value="${v.date}" class="${inputCls}" />`, true)}
        ${field("Heure", `<input type="time" name="time" required value="${v.time}" class="${inputCls}" />`, true)}
        ${field("Opérateur", `<input type="text" name="operator_name" required value="${esc(v.operator_name)}" placeholder="Nom opérateur" class="${inputCls}" />`, true)}
        ${field("Technicien Qualité", `<input type="text" name="quality_tech" required value="${esc(v.quality_tech)}" placeholder="Nom inspecteur" class="${inputCls}" />`, true)}
        ${field("Machine", `<select name="machine_id" id="scrap-machine-select" class="${inputCls} font-mono">${machines.map((m) => `<option value="${esc(m.machine_id)}" data-ligne="${esc(m.ligne)}" ${v.machine_id === m.machine_id ? "selected" : ""}>${esc(m.machine_id)}</option>`).join("")}</select>`)}
        ${field("Ligne", `<input type="text" name="ligne" id="scrap-ligne-input" readonly value="${esc(v.ligne)}" class="bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-500 font-mono font-bold cursor-not-allowed" />`)}
        ${field("Part Number", `<select name="part_number" id="scrap-partnumber" required class="${inputCls} font-mono">
            <option value="">—</option>
            ${pns.map((pn) => `<option value="${esc(pn)}" ${v.part_number === pn ? "selected" : ""}>${esc(pn)}</option>`).join("")}
          </select>`, true)}
        ${field("Numéro de série", `<input type="text" name="serial_number" required value="${esc(v.serial_number)}" placeholder="Ex: S/N-98234-X" class="${inputCls} font-mono" />`, true)}
        ${field("Projet", `<select name="projet" class="${inputCls}">${PROJETS.map((p) => `<option value="${p}" ${v.projet === p ? "selected" : ""}>${p}</option>`).join("")}</select>`)}
        ${field("Cause du défaut", `<select name="cause" class="${inputCls}">${CAUSES_SCRAP.map((c) => `<option value="${c}" ${v.cause === c ? "selected" : ""}>${c}</option>`).join("")}</select>`)}
        ${field("Quantité", `<input type="number" min="1" required name="qty" value="${v.qty}" class="${inputCls} font-mono font-bold" />`, true)}
      </div>
      ${field("Commentaire", `<textarea name="comment" required rows="2" class="${inputCls}">${esc(v.comment)}</textarea>`, true)}
      <div class="flex gap-2 justify-end pt-4 border-t border-slate-100">
        <button type="button" data-action="close-modal" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">Annuler</button>
        <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg cursor-pointer">Enregistrer</button>
      </div>
    </form>`;
  return modalShell(item ? "Modifier la déclaration scrap" : "Nouvelle déclaration scrap", "emerald", formHtml);
}

/* --------------------------------------- USER --------------------------------------- */
function modalUser(state, data) {
  const id = state.modal.editingId;
  const item = id ? data.users.find((u) => u.id === id) : null;
  const v = item || { username: "", password: "", role: "process", active: 1 };

  const formHtml = `
    <form data-action="submit-form" data-form="user" data-id="${id || ""}" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        ${field("Identifiant", `<input type="text" name="username" required value="${esc(v.username)}" class="${inputCls}" />`, true)}
        ${field("Mot de passe", `<input type="text" name="password" required value="${esc(v.password)}" class="${inputCls} font-mono" />`, true)}
        ${field("Rôle", `<select name="role" class="${inputCls}">${ROLES.map((r) => `<option value="${r.value}" ${v.role === r.value ? "selected" : ""}>${r.label}</option>`).join("")}</select>`)}
        <div class="flex items-end pb-2">
          <label class="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
            <input type="checkbox" name="active" ${v.active ? "checked" : ""} class="w-4 h-4" /> Compte actif
          </label>
        </div>
      </div>
      <p class="text-[11px] text-slate-400">Le mot de passe saisi ici sera immédiatement utilisable sur l'écran d'accueil pour déverrouiller l'espace <strong>${v.role === "qualite" ? "Qualité" : v.role === "admin" ? "Administration" : v.role === "maintenance" ? "Process (Maintenance — machines uniquement)" : "Process"}</strong>.</p>
      <div class="flex gap-2 justify-end pt-4 border-t border-slate-100">
        <button type="button" data-action="close-modal" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer">Annuler</button>
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg cursor-pointer">Enregistrer</button>
      </div>
    </form>`;
  return modalShell(item ? "Modifier l'utilisateur" : "Nouvel utilisateur", "indigo", formHtml);
}
