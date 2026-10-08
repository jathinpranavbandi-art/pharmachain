// Automated checks for the 11 documented tests. Start the backend first (npm start), then: npm test
const BASE = process.env.API_URL || `http://localhost:${process.env.API_PORT || 4000}/api`;
const id = 'TEST' + Date.now().toString().slice(-7);
let pass = 0; let fail = 0;
const call = async (path, { method = 'GET', body, token } = {}) => {
  const r = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => ({})) };
};
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} ${ok ? '' : extra}`); };
const med = (batchId, expiryDate = '2027-12-31') => ({ batchId, medicineName: 'Azithromycin 500mg', manufacturer: 'PharmaCorp', manufacturerId: 'PC-001',
  manufacturingDate: '2026-01-01', expiryDate, quantity: 1000, medicineType: 'Tablet', description: 'test', initialLocation: 'Chennai', initialOwner: 'PharmaCorp' });

(async () => {
  const login = await call('/auth/login', { method: 'POST', body: { username: 'admin', password: 'admin123' } });
  check('TEST 1  Admin login', login.status === 200 && !!login.data.token, JSON.stringify(login.data));
  const t = login.data.token;
  const reg = await call('/medicines/register', { method: 'POST', token: t, body: med(id) });
  check('TEST 2  Register valid medicine', reg.status === 201 && !!reg.data.txId, JSON.stringify(reg.data));
  const dup = await call('/medicines/register', { method: 'POST', token: t, body: med(id) });
  check('TEST 3  Duplicate Batch ID rejected', dup.status === 409, JSON.stringify(dup.data));
  const qr = await call(`/medicines/${id}/qr?host=192.168.1.10`, { token: t });
  check('TEST 4  Generate QR', qr.status === 200 && qr.data.verifyUrl.includes(`192.168.1.10`) && qr.data.qrDataUrl.startsWith('data:image/png'), JSON.stringify(qr.data).slice(0, 200));
  const ver = await call(`/verify/${id}`);
  check('TEST 5  Verify registered medicine', ver.data.registered === true && ver.data.verified === true && !ver.data.medicine.registeredBy);
  const unk = await call('/verify/BATCH999X');
  check('TEST 6  Verify unknown Batch ID', unk.data.registered === false && unk.data.verified === false);
  const tr = await call(`/medicines/${id}/transfer`, { method: 'POST', token: t, body: { newOwner: 'ABC Distributors', location: 'Bangalore' } });
  check('TEST 7  Transfer ownership', tr.status === 200 && tr.data.medicine.currentOwner === 'ABC Distributors', JSON.stringify(tr.data));
  const loc = await call(`/medicines/${id}/location`, { method: 'POST', token: t, body: { location: 'Hyderabad' } });
  check('TEST 8  Update location', loc.status === 200 && loc.data.medicine.currentLocation === 'Hyderabad', JSON.stringify(loc.data));
  const hist = await call(`/medicines/${id}/history`, { token: t });
  check('TEST 9  View history (3 events)', hist.status === 200 && hist.data.length === 3, JSON.stringify(hist.data));
  const exId = 'EXP' + id.slice(4);
  await call('/medicines/register', { method: 'POST', token: t, body: med(exId, '2026-02-01') });
  const ex = await call(`/verify/${exId}`);
  check('TEST 10 Expired medicine warning', ex.data.expired === true, JSON.stringify(ex.data).slice(0, 200));
  const mf = (await call('/auth/login', { method: 'POST', body: { username: 'pharmacorp', password: 'pharma123' } })).data.token;
  const bad = await call('/medicines/register', { method: 'POST', token: mf, body: med('HACK' + id) });
  const anon = await call('/medicines/register', { method: 'POST', body: med('ANON' + id) });
  check('TEST 11 Unauthorized user cannot register', bad.status === 403 && anon.status === 401, `${bad.status}/${anon.status}`);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('Could not reach API - is the backend running?', e.message); process.exit(1); });
