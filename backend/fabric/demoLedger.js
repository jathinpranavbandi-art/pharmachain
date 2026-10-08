// DEMO MODE - Local Ledger. NOT a blockchain: a JSON file that mimics the chaincode so the app can be
// demonstrated without Docker. Real mode (fabric/gateway.js) writes to Hyperledger Fabric.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FILE = path.join(__dirname, '..', 'data', 'demo-ledger.json');
let db = { state: {}, history: {} };
const STATUSES = ['REGISTERED', 'IN_TRANSIT', 'IN_STOCK', 'DISPENSED', 'FLAGGED', 'RECALLED'];
const err = (m) => new Error(m);
const save = () => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); };
const nowIso = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const need = (id) => { const m = db.state[id]; if (!m) throw err(`medicine ${id} not found`); return m; };
function commit(m, txId) {
  m.updatedAt = nowIso();
  db.state[m.batchId] = m;
  (db.history[m.batchId] ||= []).push({ txId, timestamp: m.updatedAt, isDelete: false, medicine: JSON.parse(JSON.stringify(m)) });
  save();
}

const fns = {
  RegisterMedicine(a, tx) {
    const [batchId, medicineName, manufacturer, manufacturerId, manufacturingDate, expiryDate, quantity, medicineType, description, location, owner, status, registeredBy] = a;
    if (db.state[batchId]) throw err(`medicine ${batchId} already exists`);
    if (!STATUSES.includes(status)) throw err(`invalid status ${status}`);
    const t = nowIso();
    commit({ batchId, medicineName, manufacturer, manufacturerId, manufacturingDate, expiryDate, quantity: Number(quantity), medicineType, description,
      currentOwner: owner, previousOwner: '', currentLocation: location, status, lastAction: 'REGISTERED', registeredBy, createdAt: t, updatedAt: t }, tx);
  },
  TransferOwnership([id, owner, loc], tx) {
    const m = need(id);
    if (m.status === 'RECALLED') throw err('invalid operation: recalled batches cannot be transferred');
    m.previousOwner = m.currentOwner; m.currentOwner = owner; if (loc) m.currentLocation = loc; m.lastAction = 'TRANSFERRED';
    commit(m, tx);
  },
  UpdateLocation([id, loc], tx) { const m = need(id); m.currentLocation = loc; m.lastAction = 'LOCATION_UPDATED'; commit(m, tx); },
  UpdateStatus([id, st], tx) {
    if (!STATUSES.includes(st)) throw err(`invalid status ${st}`);
    const m = need(id); m.status = st; m.lastAction = 'STATUS_UPDATED'; commit(m, tx);
  },
  GetMedicine: ([id]) => need(id),
  GetAllMedicines: () => Object.values(db.state),
  GetMedicineHistory: ([id]) => { need(id); return db.history[id]; },
  VerifyMedicine([id]) {
    const m = db.state[id];
    if (!m) return { exists: false, valid: false, expired: false, flagged: false, message: 'No registered record found' };
    const expired = m.expiryDate < new Date().toISOString().slice(0, 10);
    const flagged = m.status === 'FLAGGED' || m.status === 'RECALLED';
    return { exists: true, valid: !expired && !flagged, expired, flagged, medicine: m,
      message: flagged ? 'Registered, but flagged: do not use' : expired ? 'Registered, but this batch has expired' : 'Authenticity verified against the registered record' };
  },
};
const clone = (x) => JSON.parse(JSON.stringify(x === undefined ? null : x));

exports.init = async () => {
  if (fs.existsSync(FILE)) { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); return; }
  const seed = (id, name, exp) => fns.RegisterMedicine([id, name, 'PharmaCorp', 'PC-001', '2026-01-01', exp, '1000', 'Tablet', 'Seed data for demo', 'Chennai', 'PharmaCorp', 'REGISTERED', 'admin'], crypto.randomBytes(32).toString('hex'));
  seed('BATCH001', 'Paracetamol 500mg', '2027-12-31');
  seed('BATCH002', 'Amoxicillin 250mg (expired sample)', '2026-02-01');
  fns.TransferOwnership(['BATCH001', 'ABC Distributors', 'Bangalore'], crypto.randomBytes(32).toString('hex'));
};
exports.invoke = async (fn, args) => { const txId = crypto.randomBytes(32).toString('hex'); fns[fn](args, txId); return { txId, result: null }; };
exports.query = async (fn, args) => clone(fns[fn](args));
