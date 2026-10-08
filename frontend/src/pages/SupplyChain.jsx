import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, STATUSES, short } from '../api.js';
import Timeline, { eventItems } from '../components/Timeline.jsx';

const STAGES = ['Manufacturer', 'Distributor', 'Wholesaler', 'Pharmacy', 'Consumer'];

export default function SupplyChain() {
  const [sp] = useSearchParams();
  const [meds, setMeds] = useState([]);
  const [id, setId] = useState(sp.get('batch') || '');
  const [hist, setHist] = useState([]);
  const [msg, setMsg] = useState(null);
  const [owner, setOwner] = useState(''); const [loc, setLoc] = useState(''); const [tloc, setTloc] = useState(''); const [st, setSt] = useState('IN_TRANSIT');

  const refresh = () => api.list().then(setMeds).catch((e) => setMsg({ t: 'err', m: e.message }));
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (id) api.history(id).then(setHist).catch(() => setHist([])); else setHist([]); }, [id, msg]);
  const cur = meds.find((m) => m.batchId === id);

  const run = (fn) => async (e) => {
    e.preventDefault(); setMsg(null);
    try { const r = await fn(); setMsg({ t: 'ok', m: `✓ Transaction committed: ${short(r.txId)}` }); refresh(); }
    catch (x) { setMsg({ t: 'err', m: x.message }); }
  };
  return (
    <>
      <h2>Supply Chain</h2>
      <div className="flow glass">{STAGES.map((s, i) => <span key={s}>{s}{i < 4 && <b> → </b>}</span>)}</div>
      <div className="glass pad">
        <label>Select batch<select value={id} onChange={(e) => { setId(e.target.value); setMsg(null); }}>
          <option value="">— choose —</option>{meds.map((m) => <option key={m.batchId} value={m.batchId}>{m.batchId} · {m.medicineName}</option>)}
        </select></label>
        {cur && <p className="muted">Owner: <b>{cur.currentOwner}</b> · Location: <b>{cur.currentLocation}</b> · Status: <b>{cur.status}</b></p>}
      </div>
      {msg && <div className={`alert ${msg.t}`}>{msg.m}</div>}
      {id && (
        <div className="triple">
          <form className="glass pad" onSubmit={run(() => api.transfer(id, { newOwner: owner, location: tloc }))}>
            <h3>Transfer Ownership</h3>
            <label>New owner<input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="ABC Distributors" required /></label>
            <label>New location<input value={tloc} onChange={(e) => setTloc(e.target.value)} placeholder="Bangalore" /></label>
            <button className="btn">Transfer</button>
          </form>
          <form className="glass pad" onSubmit={run(() => api.location(id, { location: loc }))}>
            <h3>Update Location</h3>
            <label>Location<input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Chennai" required /></label>
            <button className="btn">Update</button>
          </form>
          <form className="glass pad" onSubmit={run(() => api.status(id, { status: st }))}>
            <h3>Update Status</h3>
            <label>Status<select value={st} onChange={(e) => setSt(e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
            <button className="btn">Update</button>
          </form>
        </div>
      )}
      {id && <div className="glass pad"><h3>History</h3><Timeline items={eventItems(hist)} /></div>}
    </>
  );
}
