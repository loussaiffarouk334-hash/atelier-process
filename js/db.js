/* ============================================================================
   db.js — Couche base de données SQL (SQLite via sql.js / WebAssembly)
   ----------------------------------------------------------------------------
   6 tables réelles gérées en SQL :
     1. part_numbers        (référentiel Programmes / Part Numbers)
     2. machines             (référentiel Machines)
     3. interventions        (journal Process)
     4. scrap_declarations   (déclarations Qualité)
     5. scrap_log            (historique consolidé -> alimente la courbe scrap)
     6. users                (comptes / mots de passe modifiables)

   Persistance : la base SQLite complète est exportée en binaire puis stockée
   en Base64 dans localStorage après chaque écriture (fonction persist()).
   Un export/téléchargement du fichier .sqlite réel est aussi proposé dans
   l'écran "Export / Import".
============================================================================ */

const DB_STORAGE_KEY = "atelierProcess_sqlite_v1";
const LAST_TECH_KEY = "atelierProcess_lastTech";
const LAST_QTECH_KEY = "atelierProcess_lastQualityTech";
const SESSION_PROCESS_KEY = "atelierProcess_sessionProcess";
const SESSION_QUALITY_KEY = "atelierProcess_sessionQuality";

let SQL = null;
let db = null;

function uid(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function b64ToUint8(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function uint8ToB64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function initDatabase() {
  SQL = await initSqlJs({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`,
  });

  const stored = localStorage.getItem(DB_STORAGE_KEY);
  if (stored) {
    try {
      db = new SQL.Database(b64ToUint8(stored));
      ensureSchema(); // safety net if a table is missing from an older backup
      return;
    } catch (e) {
      console.warn("Base corrompue, recréation d'une nouvelle base.", e);
    }
  }
  db = new SQL.Database();
  createSchema();
  seedDatabase();
  persist();
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS part_numbers (
      id TEXT PRIMARY KEY,
      part_number TEXT NOT NULL,
      sewing_job_id TEXT,
      section TEXT,
      min REAL DEFAULT 0,
      max REAL DEFAULT 0,
      nominal REAL DEFAULT 0,
      correction REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      machine_id TEXT NOT NULL,
      sn_amatec TEXT,
      code_id TEXT,
      projet TEXT,
      ligne TEXT,
      ip TEXT,
      pcb TEXT,
      version TEXT,
      correction_points REAL DEFAULT 0,
      correction_tension REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS interventions (
      id TEXT PRIMARY KEY,
      date TEXT,
      time TEXT,
      technician TEXT,
      operator TEXT,
      type TEXT,
      machine_id TEXT,
      part_number TEXT,
      section TEXT,
      corr_type TEXT,
      before_val REAL DEFAULT 0,
      after_val REAL DEFAULT 0,
      cause TEXT,
      scrap INTEGER DEFAULT 0,
      scrap_qty REAL DEFAULT 0,
      comment TEXT,
      projet TEXT,
      ligne TEXT
    );

    CREATE TABLE IF NOT EXISTS scrap_declarations (
      id TEXT PRIMARY KEY,
      date TEXT,
      time TEXT,
      operator_name TEXT,
      quality_tech TEXT,
      machine_id TEXT,
      ligne TEXT,
      part_number TEXT,
      serial_number TEXT,
      projet TEXT,
      cause TEXT,
      qty REAL DEFAULT 0,
      comment TEXT
    );

    CREATE TABLE IF NOT EXISTS scrap_log (
      id TEXT PRIMARY KEY,
      date TEXT,
      time TEXT,
      operator_name TEXT,
      machine_id TEXT,
      part_number TEXT,
      qty REAL DEFAULT 0,
      cause TEXT,
      projet TEXT,
      source TEXT,
      source_id TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      active INTEGER DEFAULT 1
    );
  `);
}

function ensureSchema() {
  createSchema();
}

function seedDatabase() {
  const now = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);

  // --- Utilisateurs par défaut ---
  const users = [
    { username: "process", password: "Process12344", role: "process" },
    { username: "qualite", password: "Qualite12345", role: "qualite" },
    { username: "admin", password: "Admin12345", role: "admin" },
  ];
  users.forEach((u) => {
    db.run("INSERT INTO users (id, username, password, role, active) VALUES (?,?,?,?,1)", [
      uid("u"), u.username, u.password, u.role,
    ]);
  });

  // --- Part Numbers ---
  const pns = [
    { partNumber: "8U0880241", sewingJobId: "JB-2201", section: "Section 1", min: -12, max: 12, nominal: 0, correction: 0 },
    { partNumber: "8U0880241", sewingJobId: "JB-2201", section: "Section 2", min: -10, max: 10, nominal: 0, correction: 0 },
    { partNumber: "5Q0880241", sewingJobId: "JB-1187", section: "Section 1", min: -15, max: 15, nominal: 0, correction: 0 },
    { partNumber: "1K0880241", sewingJobId: "JB-3390", section: "Section 1", min: -8, max: 8, nominal: 0, correction: 0 },
  ];
  pns.forEach((p) => {
    db.run(
      "INSERT INTO part_numbers (id, part_number, sewing_job_id, section, min, max, nominal, correction) VALUES (?,?,?,?,?,?,?,?)",
      [uid("pn"), p.partNumber, p.sewingJobId, p.section, p.min, p.max, p.nominal, p.correction]
    );
  });

  // --- Machines ---
  const machines = [
    { machineId: "SM190", snAmatec: "AMSAB-270540", codeId: "D", projet: "MBEAM", ligne: "G04", ip: "10.50.68.133", pcb: "V3", version: "260301", correctionPoints: 0, correctionTension: 0 },
    { machineId: "SM261", snAmatec: "AMSAB-016703", codeId: "C", projet: "MBEAM", ligne: "G31", ip: "10.50.64.189", pcb: "V3", version: "260301", correctionPoints: 0, correctionTension: 0 },
    { machineId: "SM145", snAmatec: "AMSAB-114420", codeId: "A", projet: "NCAR", ligne: "G12", ip: "10.50.61.114", pcb: "V2", version: "250918", correctionPoints: 0, correctionTension: 0 },
  ];
  machines.forEach((m) => {
    db.run(
      "INSERT INTO machines (id, machine_id, sn_amatec, code_id, projet, ligne, ip, pcb, version, correction_points, correction_tension) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [uid("m"), m.machineId, m.snAmatec, m.codeId, m.projet, m.ligne, m.ip, m.pcb, m.version, m.correctionPoints, m.correctionTension]
    );
  });

  // --- Quelques interventions et scrap d'exemple (30 derniers jours) ---
  const causes = ["Tension Over Limit", "Stitches Over Limit", "Stitches Under Limit", "Préventif", "Réglage qualité", "Autre"];
  for (let i = 0; i < 10; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 25));
    const isScrap = Math.random() < 0.35;
    insertIntervention({
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
    }, false);
  }

  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 25));
    insertScrapDeclaration({
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
    }, false);
  }
}

function persist() {
  const data = db.export();
  localStorage.setItem(DB_STORAGE_KEY, uint8ToB64(data));
}

/* ---------------------------- Helpers génériques ---------------------------- */
function runQuery(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

/* ------------------------------- Part Numbers ------------------------------- */
function listPartNumbers() {
  return runQuery("SELECT * FROM part_numbers ORDER BY part_number, section");
}
function upsertPartNumber(p) {
  const id = p.id || uid("pn");
  if (p.id) {
    db.run(
      "UPDATE part_numbers SET part_number=?, sewing_job_id=?, section=?, min=?, max=?, nominal=?, correction=? WHERE id=?",
      [p.partNumber, p.sewingJobId, p.section, p.min, p.max, p.nominal, p.correction, id]
    );
  } else {
    db.run(
      "INSERT INTO part_numbers (id, part_number, sewing_job_id, section, min, max, nominal, correction) VALUES (?,?,?,?,?,?,?,?)",
      [id, p.partNumber, p.sewingJobId, p.section, p.min, p.max, p.nominal, p.correction]
    );
  }
  persist();
  return id;
}
function deletePartNumber(id) {
  db.run("DELETE FROM part_numbers WHERE id=?", [id]);
  persist();
}

/* --------------------------------- Machines --------------------------------- */
function listMachines() {
  return runQuery("SELECT * FROM machines ORDER BY machine_id");
}
function upsertMachine(m) {
  const id = m.id || uid("m");
  if (m.id) {
    db.run(
      `UPDATE machines SET machine_id=?, sn_amatec=?, code_id=?, projet=?, ligne=?, ip=?, pcb=?, version=?,
       correction_points=?, correction_tension=? WHERE id=?`,
      [m.machineId, m.snAmatec, m.codeId, m.projet, m.ligne, m.ip, m.pcb, m.version, m.correctionPoints, m.correctionTension, id]
    );
  } else {
    db.run(
      `INSERT INTO machines (id, machine_id, sn_amatec, code_id, projet, ligne, ip, pcb, version, correction_points, correction_tension)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id, m.machineId, m.snAmatec, m.codeId, m.projet, m.ligne, m.ip, m.pcb, m.version, m.correctionPoints, m.correctionTension]
    );
  }
  persist();
  return id;
}
function deleteMachine(id) {
  db.run("DELETE FROM machines WHERE id=?", [id]);
  persist();
}

/* ------------------------------- Interventions ------------------------------- */
function listInterventions() {
  return runQuery("SELECT * FROM interventions ORDER BY date DESC, time DESC");
}
function insertIntervention(i, doPersist = true) {
  const id = i.id || uid("i");
  if (i.id) {
    db.run(
      `UPDATE interventions SET date=?, time=?, technician=?, operator=?, type=?, machine_id=?, part_number=?, section=?,
       corr_type=?, before_val=?, after_val=?, cause=?, scrap=?, scrap_qty=?, comment=?, projet=?, ligne=? WHERE id=?`,
      [i.date, i.time, i.technician, i.operator, i.type, i.machineId, i.partNumber, i.section, i.corrType,
       i.before, i.after, i.cause, i.scrap ? 1 : 0, i.scrapQty, i.comment, i.projet, i.ligne, id]
    );
    db.run("DELETE FROM scrap_log WHERE source='intervention' AND source_id=?", [id]);
  } else {
    db.run(
      `INSERT INTO interventions (id, date, time, technician, operator, type, machine_id, part_number, section, corr_type,
       before_val, after_val, cause, scrap, scrap_qty, comment, projet, ligne) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, i.date, i.time, i.technician, i.operator, i.type, i.machineId, i.partNumber, i.section, i.corrType,
       i.before, i.after, i.cause, i.scrap ? 1 : 0, i.scrapQty, i.comment, i.projet, i.ligne]
    );
  }
  // Alimente automatiquement la table de courbe scrap
  if (i.scrap && Number(i.scrapQty) > 0) {
    db.run(
      "INSERT INTO scrap_log (id, date, time, operator_name, machine_id, part_number, qty, cause, projet, source, source_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [uid("sl"), i.date, i.time, i.operator, i.machineId, i.partNumber, i.scrapQty, i.cause, i.projet, "intervention", id]
    );
  }
  if (doPersist) persist();
  return id;
}
function deleteIntervention(id) {
  db.run("DELETE FROM interventions WHERE id=?", [id]);
  db.run("DELETE FROM scrap_log WHERE source='intervention' AND source_id=?", [id]);
  persist();
}

/* ---------------------------- Déclarations Scrap (Qualité) ---------------------------- */
function listScrapDeclarations() {
  return runQuery("SELECT * FROM scrap_declarations ORDER BY date DESC, time DESC");
}
function insertScrapDeclaration(s, doPersist = true) {
  const id = s.id || uid("sd");
  if (s.id) {
    db.run(
      `UPDATE scrap_declarations SET date=?, time=?, operator_name=?, quality_tech=?, machine_id=?, ligne=?, part_number=?,
       serial_number=?, projet=?, cause=?, qty=?, comment=? WHERE id=?`,
      [s.date, s.time, s.operatorName, s.qualityTech, s.machineId, s.ligne, s.partNumber, s.serialNumber, s.projet, s.cause, s.qty, s.comment, id]
    );
    db.run("DELETE FROM scrap_log WHERE source='qualite' AND source_id=?", [id]);
  } else {
    db.run(
      `INSERT INTO scrap_declarations (id, date, time, operator_name, quality_tech, machine_id, ligne, part_number,
       serial_number, projet, cause, qty, comment) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, s.date, s.time, s.operatorName, s.qualityTech, s.machineId, s.ligne, s.partNumber, s.serialNumber, s.projet, s.cause, s.qty, s.comment]
    );
  }
  db.run(
    "INSERT INTO scrap_log (id, date, time, operator_name, machine_id, part_number, qty, cause, projet, source, source_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [uid("sl"), s.date, s.time, s.operatorName, s.machineId, s.partNumber, s.qty, s.cause, s.projet, "qualite", id]
  );
  if (doPersist) persist();
  return id;
}
function deleteScrapDeclaration(id) {
  db.run("DELETE FROM scrap_declarations WHERE id=?", [id]);
  db.run("DELETE FROM scrap_log WHERE source='qualite' AND source_id=?", [id]);
  persist();
}

/* --------------------------------- Scrap Log (courbe) --------------------------------- */
function listScrapLog() {
  return runQuery("SELECT * FROM scrap_log ORDER BY date DESC, time DESC");
}

/* ----------------------------------- Utilisateurs ----------------------------------- */
function listUsers() {
  return runQuery("SELECT * FROM users ORDER BY role, username");
}
function upsertUser(u) {
  const id = u.id || uid("u");
  if (u.id) {
    db.run("UPDATE users SET username=?, password=?, role=?, active=? WHERE id=?", [
      u.username, u.password, u.role, u.active ? 1 : 0, id,
    ]);
  } else {
    db.run("INSERT INTO users (id, username, password, role, active) VALUES (?,?,?,?,?)", [
      id, u.username, u.password, u.role, u.active ? 1 : 0,
    ]);
  }
  persist();
  return id;
}
function deleteUser(id) {
  db.run("DELETE FROM users WHERE id=?", [id]);
  persist();
}
function checkCredentials(role, password) {
  const rows = runQuery("SELECT * FROM users WHERE role=? AND password=? AND active=1", [role, password]);
  return rows.length > 0 ? rows[0] : null;
}

/* ------------------------------------ Reset / Export ------------------------------------ */
function resetDatabaseToSeed() {
  db.run(`DELETE FROM part_numbers; DELETE FROM machines; DELETE FROM interventions;
          DELETE FROM scrap_declarations; DELETE FROM scrap_log; DELETE FROM users;`);
  seedDatabase();
  persist();
}
function exportSqliteFile() {
  const data = db.export();
  const blob = new Blob([data], { type: "application/x-sqlite3" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "atelier_process.sqlite";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
async function importSqliteFile(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  db = new SQL.Database(buf);
  ensureSchema();
  persist();
}
