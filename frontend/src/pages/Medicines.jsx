import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate, isExpired } from '../api.js';

export const StatusBadge = ({ m }) => {
  const t = m.status === 'FLAGGED' || m.status === 'RECALLED' ? 'bad' : isExpired(m) ? 'warn' : 'ok';
  return <span className={`badge ${t}`}>{isExpired(m) && t === 'warn' ? 'EXPIRED' : m.status}</span>;
};

export default function Medicines() {
  const [meds, setMeds] = useState([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { api.list().then(setMeds).catch((e) => setErr(e.message)); }, []);
  const rows = meds.filter((m) => (m.batchId + m.medicineName + m.currentOwner).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <h2>Medicines</h2>
      <input className="search" placeholder="Search batch, name or owner…" value={q} onChange={(e) => setQ(e.target.value)} />
      {err && <div className="alert err">{err}</div>}
      <div className="glass pad tablewrap"><table>
        <thead><tr><th>Batch</th><th>Medicine</th><th>Owner</th><th>Location</th><th>Expiry</th><th>Status</th><th></th></tr></thead>
        <tbody>{rows.map((m) => (
          <tr key={m.batchId}>
            <td className="mono">{m.batchId}</td><td>{m.medicineName}</td><td>{m.currentOwner}</td><td>{m.currentLocation}</td>
            <td>{fmtDate(m.expiryDate)}</td><td><StatusBadge m={m} /></td>
            <td className="nowrap"><Link to={`/qr?batch=${m.batchId}`}>QR</Link> · <Link to={`/supply-chain?batch=${m.batchId}`}>Manage</Link></td>
          </tr>
        ))}{!rows.length && <tr><td colSpan="7" className="muted">No medicines found.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
