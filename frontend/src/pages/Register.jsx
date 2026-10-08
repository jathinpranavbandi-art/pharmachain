import { useState } from 'react';
import { api, STATUSES, short } from '../api.js';
import QrPanel from '../components/QrPanel.jsx';

const INIT = {
  medicineName: 'Azithromycin 500mg', batchId: 'BATCH003', manufacturer: 'PharmaCorp', manufacturerId: 'PC-001',
  manufacturingDate: '2026-01-01', expiryDate: '2027-12-31', quantity: 1000, medicineType: 'Tablet',
  description: 'Antibiotic tablets, strip of 10', initialLocation: 'Chennai', initialOwner: 'PharmaCorp', status: 'REGISTERED',
};
const FIELDS = [
  ['medicineName', 'Medicine Name'], ['batchId', 'Batch ID'], ['manufacturer', 'Manufacturer Name'], ['manufacturerId', 'Manufacturer ID'],
  ['manufacturingDate', 'Manufacturing Date', 'date'], ['expiryDate', 'Expiry Date', 'date'], ['quantity', 'Quantity', 'number'],
  ['medicineType', 'Medicine Type'], ['initialLocation', 'Initial Location'], ['initialOwner', 'Initial Owner'],
];

export default function Register() {
  const [f, setF] = useState(INIT);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(null); setRes(null); setBusy(true);
    try { setRes(await api.register({ ...f, quantity: Number(f.quantity) })); }
    catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <>
      <h2>Register Medicine</h2>
      <form className="glass pad formgrid" onSubmit={submit}>
        {FIELDS.map(([k, label, type]) => <label key={k}>{label}<input type={type || 'text'} value={f[k]} onChange={set(k)} required min={type === 'number' ? 1 : undefined} /></label>)}
        <label>Status<select value={f.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="full">Description<textarea rows="2" value={f.description} onChange={set('description')} /></label>
        <div className="full">
          {err && <div className="alert err">{err.message}{err.details && <ul>{err.details.map((d) => <li key={d}>{d}</li>)}</ul>}</div>}
          <button className="btn" disabled={busy}>{busy ? 'Submitting transaction…' : 'REGISTER MEDICINE'}</button>
        </div>
      </form>
      {res && (
        <div className="glass pad">
          <div className="alert ok">✓ Blockchain transaction committed. Tx ID: <span className="mono break" title={res.txId}>{short(res.txId)}</span></div>
          <p className="muted small mono break">{res.txId}</p>
          <QrPanel batchId={res.medicine.batchId} />
        </div>
      )}
    </>
  );
}
