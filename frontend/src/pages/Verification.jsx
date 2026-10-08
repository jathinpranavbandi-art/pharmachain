import { useState } from 'react';
import { api } from '../api.js';
import VerifyCard from '../components/VerifyCard.jsx';

export default function Verification() {
  const [id, setId] = useState('');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const go = async (e) => {
    e.preventDefault(); setErr(''); setData(null);
    try { setData(await api.publicVerify(id.trim())); } catch (x) { setErr(x.message); }
  };
  return (
    <>
      <h2>Verification</h2>
      <form className="glass pad row" onSubmit={go}>
        <input placeholder="Batch ID (try BATCH003 or BATCH999)" value={id} onChange={(e) => setId(e.target.value)} required />
        <button className="btn">Verify record</button>
      </form>
      {err && <div className="alert err">{err}</div>}
      <VerifyCard data={data} />
    </>
  );
}
