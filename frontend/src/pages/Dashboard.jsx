import { useEffect, useState } from 'react';
import { api, isExpired, fmtTime, short } from '../api.js';

export default function Dashboard() {
  const [meds, setMeds] = useState([]);
  const [txs, setTxs] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.list().then(setMeds).catch((e) => setErr(e.message));
    api.transactions().then(setTxs).catch(() => {});
  }, []);
  const flagged = meds.filter((m) => m.status === 'FLAGGED' || m.status === 'RECALLED').length;
  const expired = meds.filter(isExpired).length;
  const verified = meds.filter((m) => !isExpired(m) && m.status !== 'FLAGGED' && m.status !== 'RECALLED').length;
  const cards = [['Total Registered', meds.length, ''], ['Verified', verified, 'good'], ['Expired', expired, 'warn'], ['Flagged', flagged, 'bad']];
  return (
    <>
      <h2>Dashboard</h2>
      {err && <div className="alert err">{err}</div>}
      <div className="stats">
        {cards.map(([k, v, t]) => <div key={k} className={`glass stat ${t}`}><div className="muted small">{k}</div><div className="num">{v}</div></div>)}
      </div>
      <div className="glass pad">
        <h3>Recent Blockchain Transactions</h3>
        <div className="tablewrap"><table>
          <thead><tr><th>Time</th><th>Batch</th><th>Action</th><th>Tx ID</th></tr></thead>
          <tbody>{txs.slice(0, 6).map((t) => (
            <tr key={t.txId}><td>{fmtTime(t.timestamp)}</td><td>{t.batchId}</td><td>{t.action}</td><td className="mono" title={t.txId}>{short(t.txId)}</td></tr>
          ))}{!txs.length && <tr><td colSpan="4" className="muted">No transactions yet.</td></tr>}</tbody>
        </table></div>
      </div>
    </>
  );
}
