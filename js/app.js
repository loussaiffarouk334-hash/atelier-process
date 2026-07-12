/* ============================================================================
   app.js — État de l'application, routage, délégation d'événements
============================================================================ */

const state = {
  screen: "portal", // portal | process | quality
  activePage: "dashboard",
  mobileMenuOpen: false,
  drill: { level: "month", monthKey: null },
  modal: { type: null, editingId: null },
  passwordPrompt: { open: false, role: null, error: null },
  filters: {
    journal: { search: "", type: "", projet: "", dateFrom: "", dateTo: "" },
    programmes: { search: "" },
    machines: { search: "" },
    quality: { search: "", projet: "", dateFrom: "", dateTo: "" },
  },
};

function getAllData() {
  return {
    partNumbers: listPartNumbers(),
    machines: listMachines(),
    interventions: listInterventions(),
    scrapDeclarations: listScrapDeclarations(),
    scrapLog: listScrapLog(),
    users: listUsers(),
  };
}

function renderApp() {
  const data = getAllData();
  const root = document.getElementById("app-root");

  let html = "";
  if (state.screen === "portal") {
    html = renderPortal();
    if (state.passwordPrompt.open) html += renderPasswordModal(state.passwordPrompt.role, state.passwordPrompt.error);
  } else if (state.screen === "process") {
    html = renderProcessShell(state, data);
    html += renderModal(state, data);
  } else if (state.screen === "quality") {
    html = renderQuality(state, data);
    html += renderModal(state, data);
  }
  root.innerHTML = html;

  if (state.screen === "process" && state.activePage === "dashboard") {
    paintDashboardChart(state, data);
  }
  if (state.screen === "quality") {
    paintQualityCharts(data);
  }

  wireFilterInputs(data);
  wireCsvInputs(data);
}

/* ------------------------------- Filtres (mise à jour ciblée, sans perdre le focus) ------------------------------- */
function wireFilterInputs(data) {
  if (state.screen === "process" && state.activePage === "journal") {
    const ids = ["journal-search", "journal-type", "journal-projet", "journal-date-from", "journal-date-to"];
    ids.forEach((elId) => {
      const el = document.getElementById(elId);
      if (!el) return;
      el.addEventListener("input", () => updateJournalFilters(data));
      el.addEventListener("change", () => updateJournalFilters(data));
    });
  }
  if (state.screen === "process" && state.activePage === "programmes") {
    const el = document.getElementById("programmes-search");
    if (el) el.addEventListener("input", () => {
      state.filters.programmes.search = el.value;
      let rows = [...data.partNumbers];
      const q = el.value.toLowerCase();
      if (q) rows = rows.filter((p) => [p.part_number, p.sewing_job_id, p.section].join(" ").toLowerCase().includes(q));
      document.getElementById("programmes-tbody").innerHTML = renderProgrammesRows(rows);
    });
  }
  if (state.screen === "process" && state.activePage === "machines") {
    const el = document.getElementById("machines-search");
    if (el) el.addEventListener("input", () => {
      state.filters.machines.search = el.value;
      let rows = [...data.machines];
      const q = el.value.toLowerCase();
      if (q) rows = rows.filter((m) => [m.machine_id, m.sn_amatec, m.projet, m.ligne].join(" ").toLowerCase().includes(q));
      document.getElementById("machines-tbody").innerHTML = renderMachinesRows(rows);
    });
  }
  if (state.screen === "quality") {
    const ids = ["quality-search", "quality-projet", "quality-date-from", "quality-date-to"];
    ids.forEach((elId) => {
      const el = document.getElementById(elId);
      if (!el) return;
      el.addEventListener("input", () => updateQualityFilters(data));
      el.addEventListener("change", () => updateQualityFilters(data));
    });
  }

  // Machine -> Ligne auto-fill inside scrap modal
  const scrapMachineSelect = document.getElementById("scrap-machine-select");
  if (scrapMachineSelect) {
    scrapMachineSelect.addEventListener("change", () => {
      const opt = scrapMachineSelect.selectedOptions[0];
      document.getElementById("scrap-ligne-input").value = opt ? opt.dataset.ligne || "" : "";
    });
  }
}

function updateJournalFilters(data) {
  state.filters.journal = {
    search: document.getElementById("journal-search").value,
    type: document.getElementById("journal-type").value,
    projet: document.getElementById("journal-projet").value,
    dateFrom: document.getElementById("journal-date-from").value,
    dateTo: document.getElementById("journal-date-to").value,
  };
  const f = state.filters.journal;
  let rows = [...data.interventions];
  if (f.search) { const q = f.search.toLowerCase(); rows = rows.filter((i) => [i.machine_id, i.part_number, i.operator, i.technician, i.cause].join(" ").toLowerCase().includes(q)); }
  if (f.type) rows = rows.filter((i) => i.type === f.type);
  if (f.projet) rows = rows.filter((i) => i.projet === f.projet);
  if (f.dateFrom) rows = rows.filter((i) => i.date >= f.dateFrom);
  if (f.dateTo) rows = rows.filter((i) => i.date <= f.dateTo);
  document.getElementById("journal-tbody").innerHTML = renderJournalRows(rows);
}

function updateQualityFilters(data) {
  state.filters.quality = {
    search: document.getElementById("quality-search").value,
    projet: document.getElementById("quality-projet").value,
    dateFrom: document.getElementById("quality-date-from").value,
    dateTo: document.getElementById("quality-date-to").value,
  };
  const f = state.filters.quality;
  let rows = [...data.scrapDeclarations];
  if (f.search) { const q = f.search.toLowerCase(); rows = rows.filter((sd) => [sd.machine_id, sd.ligne, sd.part_number, sd.serial_number, sd.projet, sd.cause, sd.operator_name, sd.quality_tech].join(" ").toLowerCase().includes(q)); }
  if (f.projet) rows = rows.filter((sd) => sd.projet === f.projet);
  if (f.dateFrom) rows = rows.filter((sd) => sd.date >= f.dateFrom);
  if (f.dateTo) rows = rows.filter((sd) => sd.date <= f.dateTo);
  document.getElementById("quality-tbody").innerHTML = renderQualityRows(rows);
}

/* ------------------------------------------- Actions (délégation) ------------------------------------------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;

  switch (action) {
    case "set-lang":
      setLang(btn.dataset.lang);
      renderApp();
      break;
    case "open-portal-password":
      state.passwordPrompt = { open: true, role: btn.dataset.role, error: null };
      renderApp();
      break;
    case "close-password-modal":
    case "close-password-modal-backdrop":
      if (action === "close-password-modal-backdrop" && e.target !== btn) return;
      state.passwordPrompt = { open: false, role: null, error: null };
      renderApp();
      break;

    case "nav":
      state.activePage = btn.dataset.page;
      state.mobileMenuOpen = false;
      state.drill = { level: "month", monthKey: null };
      renderApp();
      break;
    case "toggle-mobile-menu":
      state.mobileMenuOpen = true;
      renderApp();
      break;
    case "close-mobile-menu":
      state.mobileMenuOpen = false;
      renderApp();
      break;
    case "lock-station":
      state.screen = "portal";
      state.activePage = "dashboard";
      renderApp();
      break;

    case "drill-back":
      state.drill = { level: "month", monthKey: null };
      renderApp();
      break;

    case "open-modal":
      state.modal = { type: btn.dataset.modal, editingId: btn.dataset.id || null };
      renderApp();
      break;
    case "close-modal":
      state.modal = { type: null, editingId: null };
      renderApp();
      break;
    case "close-modal-backdrop":
      if (e.target === btn) { state.modal = { type: null, editingId: null }; renderApp(); }
      break;

    case "delete-item":
      handleDeleteItem(btn.dataset.type, btn.dataset.id);
      break;

    case "export-sqlite":
      exportSqliteFile();
      showToast("Base .sqlite téléchargée.");
      break;
    case "export-scrap-csv":
      exportCsv("scrap_log.csv", listScrapLog(), ["date","time","operator_name","machine_id","part_number","qty","cause","projet","source"]);
      break;
    case "export-scrap-declarations-csv":
      exportCsv("declarations_scrap.csv", listScrapDeclarations(), ["date","time","operator_name","quality_tech","machine_id","ligne","part_number","serial_number","projet","cause","qty","comment"]);
      break;
    case "csv-template":
      downloadCsvTemplate(btn.dataset.target);
      break;

    case "reset-database":
      if (confirm("Réinitialiser toute la base SQL avec les données de démonstration ? Cette action est irréversible.")) {
        resetDatabaseToSeed();
        showToast("Base réinitialisée.");
        renderApp();
      }
      break;
  }
});

document.addEventListener("submit", (e) => {
  const form = e.target;

  if (form.dataset.action === "submit-password") {
    e.preventDefault();
    const role = form.dataset.role;
    const password = new FormData(form).get("password");
    const user = checkCredentials(role, password);
    if (user) {
      state.passwordPrompt = { open: false, role: null, error: null };
      if (role === "process") {
        localStorage.setItem(LAST_TECH_KEY, user.username);
        state.screen = "process";
        state.activePage = "dashboard";
      } else {
        localStorage.setItem(LAST_QTECH_KEY, user.username);
        state.screen = "quality";
      }
      renderApp();
    } else {
      state.passwordPrompt.error = "Mot de passe incorrect.";
      renderApp();
    }
    return;
  }

  if (form.dataset.action === "submit-form") {
    e.preventDefault();
    handleSubmitForm(form);
  }
});

function handleDeleteItem(type, id) {
  const labels = { intervention: "cette intervention", program: "ce Part Number", machine: "cette machine", scrap: "cette déclaration scrap", user: "cet utilisateur" };
  if (!confirm(`Supprimer définitivement ${labels[type] || "cet élément"} ?`)) return;

  if (type === "intervention") deleteIntervention(id);
  if (type === "program") deletePartNumber(id);
  if (type === "machine") deleteMachine(id);
  if (type === "scrap") deleteScrapDeclaration(id);
  if (type === "user") deleteUser(id);

  showToast("Élément supprimé.");
  renderApp();
}

function handleSubmitForm(form) {
  const type = form.dataset.form;
  const id = form.dataset.id || null;
  const fd = new FormData(form);
  const get = (k) => fd.get(k);

  if (type === "intervention") {
    localStorage.setItem(LAST_TECH_KEY, get("technician") || "");
    insertIntervention({
      id, date: get("date"), time: get("time"), technician: get("technician"), operator: get("operator"),
      type: get("type"), machineId: get("machine_id"), partNumber: get("part_number"), section: get("section"),
      corrType: get("corr_type"), before: Number(get("before_val") || 0), after: Number(get("after_val") || 0),
      cause: get("cause"), scrap: fd.get("scrap") === "on", scrapQty: Number(get("scrap_qty") || 0),
      comment: get("comment"), projet: get("projet"), ligne: get("ligne"),
    });
    showToast("Intervention enregistrée dans la table interventions.");
  } else if (type === "program") {
    upsertPartNumber({
      id, partNumber: get("part_number"), sewingJobId: get("sewing_job_id"), section: get("section"),
      min: Number(get("min") || 0), max: Number(get("max") || 0), nominal: Number(get("nominal") || 0),
      correction: Number(get("correction") || 0),
    });
    showToast("Part Number enregistré dans la table part_numbers.");
  } else if (type === "machine") {
    upsertMachine({
      id, machineId: get("machine_id"), snAmatec: get("sn_amatec"), codeId: get("code_id"), projet: get("projet"),
      ligne: get("ligne"), ip: get("ip"), pcb: get("pcb"), version: get("version"),
      correctionPoints: Number(get("correction_points") || 0), correctionTension: Number(get("correction_tension") || 0),
    });
    showToast("Machine enregistrée dans la table machines.");
  } else if (type === "scrap") {
    localStorage.setItem(LAST_QTECH_KEY, get("quality_tech") || "");
    insertScrapDeclaration({
      id, date: get("date"), time: get("time"), operatorName: get("operator_name"), qualityTech: get("quality_tech"),
      machineId: get("machine_id"), ligne: get("ligne"), partNumber: get("part_number"), serialNumber: get("serial_number"),
      projet: get("projet"), cause: get("cause"), qty: Number(get("qty") || 0), comment: get("comment"),
    });
    showToast("Déclaration scrap enregistrée et ajoutée à la courbe scrap.");
  } else if (type === "user") {
    upsertUser({
      id, username: get("username"), password: get("password"), role: get("role"), active: fd.get("active") === "on",
    });
    showToast("Utilisateur enregistré dans la table users.");
  }

  state.modal = { type: null, editingId: null };
  renderApp();
}

/* Import fichier .sqlite (change listener attaché après chaque rendu de la page Export) */
document.addEventListener("change", async (e) => {
  if (e.target && e.target.id === "import-sqlite-input") {
    const file = e.target.files[0];
    if (!file) return;
    if (!confirm("Importer ce fichier remplacera entièrement la base actuelle. Continuer ?")) { e.target.value = ""; return; }
    try {
      await importSqliteFile(file);
      showToast("Base importée avec succès.");
      renderApp();
    } catch (err) {
      alert("Fichier .sqlite invalide ou corrompu.");
      console.error(err);
    }
  }
});

function exportCsv(filename, rows, columns) {
  const headerRow = columns.join(";");
  const lines = [headerRow];
  rows.forEach((r) => {
    lines.push(columns.map((c) => String(r[c] ?? "").replace(/;/g, ",")).join(";"));
  });
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------- Modèles / Import CSV (Machines & Programmes) ------------------------------- */
const CSV_TEMPLATES = {
  machines: {
    filename: "modele_machines.csv",
    headers: ["MachineId", "SnAmatec", "CodeId", "Projet", "Ligne", "Ip", "Pcb", "Version", "CorrectionPoints", "CorrectionTension"],
    example: ["SM999", "AMSAB-000000", "A", "MBEAM", "G01", "10.50.60.10", "V3", "260301", "0", "0"],
  },
  programmes: {
    filename: "modele_programmes.csv",
    headers: ["PartNumber", "SewingJobId", "Section", "Min", "Max", "Nominal", "Correction"],
    example: ["8U0880241", "JB-2201", "Section 1", "-12", "12", "0", "0"],
  },
};

function downloadCsvTemplate(target) {
  const tpl = CSV_TEMPLATES[target];
  if (!tpl) return;
  const content = tpl.headers.join(";") + "\n" + tpl.example.join(";");
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = tpl.filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseCsvText(text) {
  const cleanText = text.replace(/^\uFEFF/, "").trim();
  if (!cleanText) return { headers: [], rows: [] };
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const splitLine = (line) => line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = cells[idx] !== undefined ? cells[idx] : ""; });
    return obj;
  });
  return { headers, rows };
}

function importMachinesCsv(text) {
  const { rows } = parseCsvText(text);
  const existing = listMachines();
  let created = 0, updated = 0;
  rows.forEach((r) => {
    const machineId = r["machineid"] || r["machine_id"] || "";
    if (!machineId) return;
    const match = existing.find((m) => m.machine_id === machineId);
    upsertMachine({
      id: match ? match.id : null,
      machineId,
      snAmatec: r["snamatec"] || "",
      codeId: r["codeid"] || "",
      projet: r["projet"] || "",
      ligne: r["ligne"] || "",
      ip: r["ip"] || "",
      pcb: r["pcb"] || "",
      version: r["version"] || "",
      correctionPoints: Number(r["correctionpoints"] || 0),
      correctionTension: Number(r["correctiontension"] || 0),
    });
    match ? updated++ : created++;
  });
  return { created, updated };
}

function importProgrammesCsv(text) {
  const { rows } = parseCsvText(text);
  const existing = listPartNumbers();
  let created = 0, updated = 0;
  rows.forEach((r) => {
    const partNumber = r["partnumber"] || r["part_number"] || "";
    const section = r["section"] || "Section 1";
    if (!partNumber) return;
    const match = existing.find((p) => p.part_number === partNumber && p.section === section);
    upsertPartNumber({
      id: match ? match.id : null,
      partNumber, section,
      sewingJobId: r["sewingjobid"] || "",
      min: Number(r["min"] || 0),
      max: Number(r["max"] || 0),
      nominal: Number(r["nominal"] || 0),
      correction: Number(r["correction"] || 0),
    });
    match ? updated++ : created++;
  });
  return { created, updated };
}

function wireCsvInputs() {
  const machInput = document.getElementById("machines-csv-input");
  if (machInput) {
    machInput.addEventListener("change", async () => {
      const file = machInput.files[0];
      if (!file) return;
      const text = await file.text();
      const { created, updated } = importMachinesCsv(text);
      showToast(`CSV importé : ${created} créées, ${updated} mises à jour.`);
      renderApp();
    });
  }
  const progInput = document.getElementById("programmes-csv-input");
  if (progInput) {
    progInput.addEventListener("change", async () => {
      const file = progInput.files[0];
      if (!file) return;
      const text = await file.text();
      const { created, updated } = importProgrammesCsv(text);
      showToast(`CSV importé : ${created} créés, ${updated} mis à jour.`);
      renderApp();
    });
  }
}

/* ------------------------------------------------- Démarrage ------------------------------------------------- */
(async function boot() {
  document.getElementById("app-root").innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-slate-50">
      <div class="text-center">
        <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-xs text-slate-400 font-mono uppercase tracking-widest">Initialisation de la base SQL...</p>
      </div>
    </div>`;
  await initDatabase();
  renderApp();
})();
