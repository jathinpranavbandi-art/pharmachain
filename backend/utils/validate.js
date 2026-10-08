const STATUSES = ['REGISTERED', 'IN_TRANSIT', 'IN_STOCK', 'DISPENSED', 'FLAGGED', 'RECALLED'];
const BATCH_RE = /^[A-Za-z0-9_-]{3,40}$/;

function httpError(status, message, details) {
  return Object.assign(new Error(message), { status, details });
}
const normBatch = (id) => String(id || '').trim().toUpperCase();

function normDate(s) {
  s = String(s || '').trim();
  const us = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // MM/DD/YYYY -> ISO
  if (us) s = `${us[3]}-${us[1]}-${us[2]}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || isNaN(Date.parse(s))) return null;
  return s;
}
const str = (v) => String(v == null ? '' : v).trim();

function validateRegister(b = {}) {
  const errors = [];
  const v = {
    batchId: normBatch(b.batchId), medicineName: str(b.medicineName), manufacturer: str(b.manufacturer),
    manufacturerId: str(b.manufacturerId), medicineType: str(b.medicineType), description: str(b.description),
    initialLocation: str(b.initialLocation), initialOwner: str(b.initialOwner), status: str(b.status) || 'REGISTERED',
    manufacturingDate: normDate(b.manufacturingDate), expiryDate: normDate(b.expiryDate), quantity: Number(b.quantity),
  };
  if (!BATCH_RE.test(v.batchId)) errors.push('batchId must be 3-40 letters, digits, - or _');
  for (const k of ['medicineName', 'manufacturer', 'initialLocation', 'initialOwner', 'medicineType'])
    if (!v[k] || v[k].length > 120) errors.push(`${k} is required (max 120 characters)`);
  if (v.manufacturerId.length > 60) errors.push('manufacturerId too long');
  if (v.description.length > 500) errors.push('description max 500 characters');
  if (!v.manufacturingDate) errors.push('manufacturingDate must be a valid date');
  if (!v.expiryDate) errors.push('expiryDate must be a valid date');
  if (v.manufacturingDate && v.expiryDate && v.expiryDate <= v.manufacturingDate)
    errors.push('expiryDate must be after manufacturingDate');
  if (!Number.isInteger(v.quantity) || v.quantity <= 0 || v.quantity > 100000000) errors.push('quantity must be a positive whole number');
  if (!STATUSES.includes(v.status)) errors.push(`status must be one of ${STATUSES.join(', ')}`);
  if (errors.length) throw httpError(400, 'Validation failed', errors);
  return v;
}

function requireText(value, name) {
  const s = str(value);
  if (!s || s.length > 120) throw httpError(400, 'Validation failed', [`${name} is required (max 120 characters)`]);
  return s;
}

module.exports = { STATUSES, httpError, normBatch, validateRegister, requireText, BATCH_RE };
