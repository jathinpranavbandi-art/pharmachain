const ledger = require('../fabric');

const toEvent = (h) => ({
  txId: h.txId, timestamp: h.timestamp, action: h.medicine.lastAction, previousOwner: h.medicine.previousOwner || '',
  newOwner: h.medicine.currentOwner, location: h.medicine.currentLocation, status: h.medicine.status,
});

exports.register = async (m, user) => {
  const { txId } = await ledger.invoke('RegisterMedicine', [m.batchId, m.medicineName, m.manufacturer, m.manufacturerId, m.manufacturingDate,
    m.expiryDate, String(m.quantity), m.medicineType, m.description, m.initialLocation, m.initialOwner, m.status, user.username]);
  return { txId, medicine: await exports.get(m.batchId) };
};
exports.get = (id) => ledger.query('GetMedicine', [id]);
exports.list = () => ledger.query('GetAllMedicines');
exports.verify = (id) => ledger.query('VerifyMedicine', [id]);
exports.history = async (id) => (await ledger.query('GetMedicineHistory', [id])).map(toEvent);

const write = (fn) => async (id, ...args) => {
  const { txId } = await ledger.invoke(fn, [id, ...args]);
  return { txId, medicine: await exports.get(id) };
};
exports.transfer = write('TransferOwnership');
exports.location = write('UpdateLocation');
exports.status = write('UpdateStatus');

exports.transactions = async (medicines) => {
  const all = [];
  for (const m of medicines) {
    for (const e of await exports.history(m.batchId)) all.push({ ...e, batchId: m.batchId, medicineName: m.medicineName });
  }
  return all.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
};
