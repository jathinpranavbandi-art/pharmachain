const cfg = require('../config');
const ledger = require('../fabric');
const svc = require('../services/ledgerService');
const qr = require('../services/qrService');
const { httpError, normBatch, validateRegister, requireText, STATUSES, BATCH_RE } = require('../utils/validate');

const batchParam = (req) => {
  const id = normBatch(req.params.batchId);
  if (!BATCH_RE.test(id)) throw httpError(400, 'Invalid batch ID');
  return id;
};
const canAccess = (user, m) => user.role === 'ADMIN' || m.currentOwner === user.org;
async function owned(req) {
  const m = await svc.get(batchParam(req));
  if (!canAccess(req.user, m)) throw httpError(403, 'Access denied: this batch is not assigned to you');
  return m;
}

exports.health = (req, res) => res.json({ status: 'ok', ledger: ledger.info(), appHost: cfg.appHost, frontendPort: cfg.frontendPort, time: new Date().toISOString() });

exports.register = async (req, res) => {
  const r = await svc.register(validateRegister(req.body), req.user);
  res.status(201).json(r);
};

exports.list = async (req, res) => {
  const all = await svc.list();
  res.json(all.filter((m) => canAccess(req.user, m)));
};
exports.get = async (req, res) => res.json(await owned(req));
exports.history = async (req, res) => { const m = await owned(req); res.json(await svc.history(m.batchId)); };

exports.transfer = async (req, res) => {
  const m = await owned(req);
  res.json(await svc.transfer(m.batchId, requireText(req.body.newOwner, 'newOwner'), String(req.body.location || '').trim().slice(0, 120)));
};
exports.location = async (req, res) => {
  const m = await owned(req);
  res.json(await svc.location(m.batchId, requireText(req.body.location, 'location')));
};
exports.status = async (req, res) => {
  const m = await owned(req);
  const status = String(req.body.status || '').trim();
  if (!STATUSES.includes(status)) throw httpError(400, 'Validation failed', [`status must be one of ${STATUSES.join(', ')}`]);
  res.json(await svc.status(m.batchId, status));
};

exports.qr = async (req, res) => {
  const id = batchParam(req);
  let registered = true;
  try { await svc.get(id); } catch (e) { if (e.status === 404) registered = false; else throw e; }
  res.json({ batchId: id, registered, ...(await qr.build(id, req.query.host)) });
};

exports.transactions = async (req, res) => {
  const meds = (await svc.list()).filter((m) => canAccess(req.user, m));
  res.json((await svc.transactions(meds)).slice(0, 100));
};

// PUBLIC: exposes only safe fields (no registeredBy, no usernames).
exports.verify = async (req, res) => {
  const id = batchParam(req);
  const v = await svc.verify(id);
  const info = ledger.info();
  if (!v.exists) {
    return res.json({ batchId: id, registered: false, verified: false, message: 'No registered blockchain record was found for this medicine.', ledger: info.label });
  }
  const history = await svc.history(id);
  const m = v.medicine;
  res.json({
    batchId: id, registered: true, verified: true, expired: v.expired, flagged: v.flagged, valid: v.valid, message: v.message,
    verifiedBy: 'Verified by PharmaChain Administrator', ledger: info.label, blockchainRef: history[0] && history[0].txId,
    medicine: {
      medicineName: m.medicineName, batchId: m.batchId, manufacturer: m.manufacturer, manufacturingDate: m.manufacturingDate,
      expiryDate: m.expiryDate, quantity: m.quantity, medicineType: m.medicineType, description: m.description,
      currentOwner: m.currentOwner, currentLocation: m.currentLocation, status: m.status, registeredAt: m.createdAt,
    },
    history,
  });
};
