import Timeline, { eventItems } from './Timeline.jsx';
import { fmtDate, fmtTime } from '../api.js';

export default function VerifyCard({ data }) {
  if (!data) return null;
  if (!data.registered) {
    return (
      <div className="vcard bad">
        <div className="vicon bad">✕</div>
        <h1>MEDICINE NOT VERIFIED</h1>
        <p className="lead">NO REGISTERED RECORD FOUND</p>
        <p className="muted">No registered blockchain record was found for batch <b className="mono">{data.batchId}</b>. Do not trust this medicine; report it to your pharmacist.</p>
      </div>
    );
  }
  const m = data.medicine;
  const tone = data.flagged ? 'bad' : data.expired ? 'warn' : 'good';
  const title = data.flagged ? 'REGISTERED – FLAGGED' : data.expired ? 'REGISTERED – EXPIRED' : 'VERIFIED MEDICINE';
  const fields = [
    ['Medicine Name', m.medicineName], ['Batch ID', m.batchId], ['Manufacturer', m.manufacturer],
    ['Manufacturing Date', fmtDate(m.manufacturingDate)], ['Expiry Date', fmtDate(m.expiryDate)], ['Quantity', m.quantity.toLocaleString()],
    ['Current Owner', m.currentOwner], ['Current Location', m.currentLocation], ['Status', m.status],
    ['Registration Date', fmtDate(m.registeredAt)], ['Verification Status', data.flagged ? 'FLAGGED' : data.expired ? 'EXPIRED' : 'VERIFIED'],
  ];
  const items = [
    { title: 'Manufactured', time: fmtDate(m.manufacturingDate), lines: [m.manufacturer] },
    ...eventItems(data.history),
    { title: 'Verified', time: fmtTime(new Date().toISOString()), lines: ['Checked against the registered record just now'] },
  ];
  return (
    <div className="vwrap">
      <div className={`vcard ${tone}`}>
        <div className={`vicon ${tone}`}>{tone === 'good' ? '✓' : '!'}</div>
        <h1>{title}</h1>
        {tone === 'good' && <p className="lead">Registered in PharmaChain</p>}
        {data.expired && <p className="lead">This batch is past its expiry date. Do not use.</p>}
        {data.flagged && <p className="lead">This batch has been flagged or recalled. Do not use.</p>}
        <p className="muted">{data.verifiedBy} · Authenticity verified against the registered blockchain record.</p>
      </div>
      <div className="glass pad">
        <h3>Medicine Details</h3>
        <dl className="grid2">{fields.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <div className="ref"><span className="muted small">Blockchain Record: AVAILABLE · {data.ledger}</span><div className="mono small break">{data.blockchainRef}</div></div>
      </div>
      <div className="glass pad"><h3>Supply-Chain History</h3><Timeline items={items} /></div>
      <p className="muted small center">Academic prototype. Not an actual government certification or regulatory approval.</p>
    </div>
  );
}
