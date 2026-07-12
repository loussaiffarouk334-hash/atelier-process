/* ============================================================================
   db.js — Couche base de données SQL PARTAGÉE (Supabase / PostgreSQL)
   ----------------------------------------------------------------------------
   6 tables réelles, hébergées dans le cloud (Supabase), accessibles depuis
   n'importe quel appareil connecté à internet :
     1. part_numbers        (référentiel Programmes / Part Numbers)
     2. machines             (référentiel Machines)
     3. interventions        (journal Process)
     4. scrap_declarations   (déclarations Qualité)
     5. scrap_log            (historique consolidé -> alimente la courbe scrap)
     6. users                (comptes / mots de passe modifiables)

   ⚠️ CONFIGURATION REQUISE — remplace les deux valeurs ci-dessous par celles
   de ton projet Supabase (Project Settings → API) avant de publier le site :
============================================================================ */

const SUPABASE_URL = "https://oqppecwtdllvqbrxeuho.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HUGLP4LIP1JF6KfOGBuyDg_uPAXoWu2";

const LAST_TECH_KEY = "atelierProcess_lastTech";
const LAST_QTECH_KEY = "atelierProcess_lastQualityTech";
const SESSION_PROCESS_KEY = "atelierProcess_sessionProcess"; 
const SESSION_QUALITY_KEY = "atelierProcess_sessionQuality";

let sb = null;
let SUPABASE_READY = false;

function uid(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function isConfigured() {
  return !SUPABASE_URL.includes("VOTRE-PROJET") && !SUPABASE_ANON_KEY.includes("VOTRE_CLE");
}

/* ---------------------------- Initialisation ---------------------------- */
async function initDatabase() {
  if (!isConfigured()) {
    SUPABASE_READY = false;
    return;
  }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: existingUsers, error } = await sb.from("users").select("id").limit(1);
  if (error) {
    console.error("Erreur de connexion Supabase :", error);
    SUPABASE_READY = false;
    return;
  }
  SUPABASE_READY = true;
  if (!existingUsers || existingUsers.length === 0) {
    await seedDatabase();
  }
}

async function checkDbError(error, context) {
  if (error) {
    console.error(context, error);
    if (typeof showToast === "function") showToast("⚠ Erreur base de données : " + error.message);
    return true;
  }
  return false;
}

/* ------------------------------------ Seed ------------------------------------ */
async function seedDatabase() {
  const now = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);

  const users = [
    { username: "process", password: "Process12344", role: "process" },
    { username: "qualite", password: "Qualite12345", role: "qualite" },
    { username: "admin", password: "Admin12345", role: "admin" },
  ];
  await sb.from("users").insert(users.map((u) => ({ id: uid("u"), username: u.username, password: u.password, role: u.role, active: true })));

  const pns = [
    { partNumber: "8U0880241", sewingJobId: "JB-2201", section: "Section 1", min: -12, max: 12, nominal: 0, correction: 0 },
    { partNumber: "8U0880241", sewingJobId: "JB-2201", section: "Section 2", min: -10, max: 10, nominal: 0, correction: 0 },
    { partNumber: "5Q0880241", sewingJobId: "JB-1187", section: "Section 1", min: -15, max: 15, nominal: 0, correction: 0 },
    { partNumber: "1K0880241", sewingJobId: "JB-3390", section: "Section 1", min: -8, max: 8, nominal: 0, correction: 0 },
  ];
  await sb.from("part_numbers").insert(pns.map((p) => ({
    id: uid("pn"), part_number: p.partNumber, sewing_job_id: p.sewingJobId, section: p.section,
    min: p.min, max: p.max, nominal: p.nominal, correction: p.correction,
  })));

  const machines = [
    { machineId: "SM190", snAmatec: "AMSAB-270540", codeId: "D", projet: "MBEAM", ligne: "G04", ip: "10.50.68.133", pcb: "V3", version: "260301", correctionPoints: 0, correctionTension: 0 },
    { machineId: "SM261", snAmatec: "AMSAB-016703", codeId: "C", projet: "MBEAM", ligne: "G31", ip: "10.50.64.189", pcb: "V3", version: "260301", correctionPoints: 0, correctionTension: 0 },
    { machineId: "SM145", snAmatec: "AMSAB-114420", codeId: "A", projet: "NCAR", ligne: "G12", ip: "10.50.61.114", pcb: "V2", version: "250918", correctionPoints: 0, correctionTension: 0 },
  ];
  await sb.from("machines").insert(machines.map((m) => ({
    id: uid("m"), machine_id: m.machineId, sn_amatec: m.snAmatec, code_id: m.codeId, projet: m.projet, ligne: m.ligne,
    ip: m.ip, pcb: m.pcb, version: m.version, correction_points: m.correctionPoints, correction_tension: m.correctionTension,
  })));

  const causes = ["Tension Over Limit", "Stitches Over Limit", "Stitches Under Limit", "Préventif", "Réglage qualité", "Autre"];
  for (let i = 0; i < 10; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 25));
    const isScrap = Math.random() < 0.35;
    await insertIntervention({
      date: iso(d),
      time: `${String(7 + (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
      technician: "T. Benali",
      operator: "Op-" + (100 + i),
      type: i % 2 === 0 ? "Programme" : "Machine",
      machineId: machines[i % machines.length].machineId,
      partNumber: pns[i % pns.length].partNumber,
      section: pns[i % pns.length].section,
      corrType: i % 2 === 0 ? "Correction Points" : "Correction Tension",
      before: 0,
      after: Math.round((Math.random() * 10 - 5) * 10) / 10,
      cause: causes[i % causes.length],
      scrap: isScrap,
      scrapQty: isScrap ? 1 + Math.floor(Math.random() * 3) : 0,
      comment: "Enregistrement initial de démonstration",
      projet: machines[i % machines.length].projet,
      ligne: machines[i % machines.length].ligne,
    });
  }

  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 25));
    await insertScrapDeclaration({
      date: iso(d),
      time: `${String(7 + (i % 8)).padStart(2, "0")}:${String((i * 11) % 60).padStart(2, "0")}`,
      operatorName: "Op-" + (200 + i),
      qualityTech: "Qualité " + (1 + (i % 3)),
      machineId: machines[i % machines.length].machineId,
      ligne: machines[i % machines.length].ligne,
      partNumber: pns[i % pns.length].partNumber,
      serialNumber: "SN-" + (98000 + i),
      projet: machines[i % machines.length].projet,
      cause: ["Overlimit", "Underlimit", "Hors Tension", "Paused Sewing", "Problem IT"][i % 5],
      qty: 1 + Math.floor(Math.random() * 4),
      comment: "Déclaration initiale de démonstration",
    });
  }
}

/* ------------------------------------- Part Numbers ------------------------------------- */
async function listPartNumbers() {
  const { data, error } = await sb.from("part_numbers").select("*").order("part_number").order("section");
  await checkDbError(error, "listPartNumbers");
  return data || [];
}
async function upsertPartNumber(p) {
  const id = p.id || uid("pn");
  const row = { id, part_number: p.partNumber, sewing_job_id: p.sewingJobId, section: p.section, min: p.min, max: p.max, nominal: p.nominal, correction: p.correction };
  const { error } = await sb.from("part_numbers").upsert(row);
  await checkDbError(error, "upsertPartNumber");
  return id;
}
async function deletePartNumber(id) {
  const { error } = await sb.from("part_numbers").delete().eq("id", id);
  await checkDbError(error, "deletePartNumber");
}

/* --------------------------------------- Machines --------------------------------------- */
async function listMachines() {
  const { data, error } = await sb.from("machines").select("*").order("machine_id");
  await checkDbError(error, "listMachines");
  return data || [];
}
async function upsertMachine(m) {
  const id = m.id || uid("m");
  const row = {
    id, machine_id: m.machineId, sn_amatec: m.snAmatec, code_id: m.codeId, projet: m.projet, ligne: m.ligne,
    ip: m.ip, pcb: m.pcb, version: m.version, correction_points: m.correctionPoints, correction_tension: m.correctionTension,
  };
  const { error } = await sb.from("machines").upsert(row);
  await checkDbError(error, "upsertMachine");
  return id;
}
async function deleteMachine(id) {
  const { error } = await sb.from("machines").delete().eq("id", id);
  await checkDbError(error, "deleteMachine");
}

/* ------------------------------------- Interventions ------------------------------------- */
async function listInterventions() {
  const { data, error } = await sb.from("interventions").select("*").order("date", { ascending: false }).order("time", { ascending: false });
  await checkDbError(error, "listInterventions");
  return data || [];
}
async function insertIntervention(i) {
  const id = i.id || uid("i");
  const row = {
    id, date: i.date, time: i.time, technician: i.technician, operator: i.operator, type: i.type,
    machine_id: i.machineId, part_number: i.partNumber, section: i.section, corr_type: i.corrType,
    before_val: i.before, after_val: i.after, cause: i.cause, scrap: !!i.scrap, scrap_qty: i.scrapQty,
    comment: i.comment, projet: i.projet, ligne: i.ligne,
  };
  const { error } = await sb.from("interventions").upsert(row);
  await checkDbError(error, "insertIntervention");

  await sb.from("scrap_log").delete().eq("source", "intervention").eq("source_id", id);
  if (i.scrap && Number(i.scrapQty) > 0) {
    const { error: logError } = await sb.from("scrap_log").insert({
      id: uid("sl"), date: i.date, time: i.time, operator_name: i.operator, machine_id: i.machineId,
      part_number: i.partNumber, qty: i.scrapQty, cause: i.cause, projet: i.projet, source: "intervention", source_id: id,
    });
    await checkDbError(logError, "insertIntervention->scrap_log");
  }
  return id;
}
async function deleteIntervention(id) {
  const { error } = await sb.from("interventions").delete().eq("id", id);
  await checkDbError(error, "deleteIntervention");
  await sb.from("scrap_log").delete().eq("source", "intervention").eq("source_id", id);
}

/* ---------------------------- Déclarations Scrap (Qualité) ---------------------------- */
async function listScrapDeclarations() {
  const { data, error } = await sb.from("scrap_declarations").select("*").order("date", { ascending: false }).order("time", { ascending: false });
  await checkDbError(error, "listScrapDeclarations");
  return data || [];
}
async function insertScrapDeclaration(s) {
  const id = s.id || uid("sd");
  const row = {
    id, date: s.date, time: s.time, operator_name: s.operatorName, quality_tech: s.qualityTech,
    machine_id: s.machineId, ligne: s.ligne, part_number: s.partNumber, serial_number: s.serialNumber,
    projet: s.projet, cause: s.cause, qty: s.qty, comment: s.comment,
  };
  const { error } = await sb.from("scrap_declarations").upsert(row);
  await checkDbError(error, "insertScrapDeclaration");

  await sb.from("scrap_log").delete().eq("source", "qualite").eq("source_id", id);
  const { error: logError } = await sb.from("scrap_log").insert({
    id: uid("sl"), date: s.date, time: s.time, operator_name: s.operatorName, machine_id: s.machineId,
    part_number: s.partNumber, qty: s.qty, cause: s.cause, projet: s.projet, source: "qualite", source_id: id,
  });
  await checkDbError(logError, "insertScrapDeclaration->scrap_log");
  return id;
}
async function deleteScrapDeclaration(id) {
  const { error } = await sb.from("scrap_declarations").delete().eq("id", id);
  await checkDbError(error, "deleteScrapDeclaration");
  await sb.from("scrap_log").delete().eq("source", "qualite").eq("source_id", id);
}

/* --------------------------------- Scrap Log (courbe) --------------------------------- */
async function listScrapLog() {
  const { data, error } = await sb.from("scrap_log").select("*").order("date", { ascending: false }).order("time", { ascending: false });
  await checkDbError(error, "listScrapLog");
  return data || [];
}

/* ----------------------------------- Utilisateurs ----------------------------------- */
async function listUsers() {
  const { data, error } = await sb.from("users").select("*").order("role").order("username");
  await checkDbError(error, "listUsers");
  return data || [];
}
async function upsertUser(u) {
  const id = u.id || uid("u");
  const row = { id, username: u.username, password: u.password, role: u.role, active: !!u.active };
  const { error } = await sb.from("users").upsert(row);
  await checkDbError(error, "upsertUser");
  return id;
}
async function deleteUser(id) {
  const { error } = await sb.from("users").delete().eq("id", id);
  await checkDbError(error, "deleteUser");
}
async function checkCredentials(role, password) {
  const { data, error } = await sb.from("users").select("*").eq("role", role).eq("password", password).eq("active", true).limit(1);
  await checkDbError(error, "checkCredentials");
  return data && data.length > 0 ? data[0] : null;
}

/* ------------------------------------ Reset / Export / Import ------------------------------------ */
async function resetDatabaseToSeed() {
  await sb.from("scrap_log").delete().neq("id", "___none___");
  await sb.from("scrap_declarations").delete().neq("id", "___none___");
  await sb.from("interventions").delete().neq("id", "___none___");
  await sb.from("part_numbers").delete().neq("id", "___none___");
  await sb.from("machines").delete().neq("id", "___none___");
  await sb.from("users").delete().neq("id", "___none___");
  await seedDatabase();
}

/* Sauvegarde complète en JSON (remplace l'ancien export .sqlite) */
async function exportDatabaseJson() {
  const [partNumbers, machines, interventions, scrapDeclarations, scrapLog, users] = await Promise.all([
    listPartNumbers(), listMachines(), listInterventions(), listScrapDeclarations(), listScrapLog(), listUsers(),
  ]);
  const payload = { exportedAt: new Date().toISOString(), partNumbers, machines, interventions, scrapDeclarations, scrapLog, users };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "atelier_process_sauvegarde.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* Restauration depuis une sauvegarde JSON (remplace entièrement la base cloud) */
async function importDatabaseJson(file) {
  const text = await file.text();
  const payload = JSON.parse(text);

  await sb.from("scrap_log").delete().neq("id", "___none___");
  await sb.from("scrap_declarations").delete().neq("id", "___none___");
  await sb.from("interventions").delete().neq("id", "___none___");
  await sb.from("part_numbers").delete().neq("id", "___none___");
  await sb.from("machines").delete().neq("id", "___none___");
  await sb.from("users").delete().neq("id", "___none___");

  if (payload.users?.length) await sb.from("users").insert(payload.users);
  if (payload.partNumbers?.length) await sb.from("part_numbers").insert(payload.partNumbers);
  if (payload.machines?.length) await sb.from("machines").insert(payload.machines);
  if (payload.interventions?.length) await sb.from("interventions").insert(payload.interventions);
  if (payload.scrapDeclarations?.length) await sb.from("scrap_declarations").insert(payload.scrapDeclarations);
  if (payload.scrapLog?.length) await sb.from("scrap_log").insert(payload.scrapLog);
}
