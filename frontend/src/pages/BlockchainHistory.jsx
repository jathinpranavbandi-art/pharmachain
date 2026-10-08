import { useEffect, useState } from 'react';
import { api, fmtTime } from '../api.js';

export default function BlockchainHistory() {
  const [txs, setTxs] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => { api.transactions().then(setTxs).catch((e) => setErr(e.message)); }, []);
  return (
    <>
      <h2>Blockchain History</h2>
      {err && <div className="alert err">{err}</div>}
      <div className="glass pad tablewrap"><table>
        <thead><tr><th>Timestamp</th><th>Batch</th><th>Action</th><th>Previous owner</th><th>New owner</th><th>Location</th><th>Transaction ID</th></tr></thead>
        <tbody>{txs.map((t) => (
          <tr key={t.txId}><td className="nowrap">{fmtTime(t.timestamp)}</td><td className="mono">{t.batchId}</td><td>{t.action}</td>
            <td>{t.previousOwner || '–'}</td><td>{t.newOwner}</td><td>{t.location}</td><td className="mono small break">{t.txId}</td></tr>
        ))}{!txs.length && <tr><td colSpan="7" className="muted">No transactions yet.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
