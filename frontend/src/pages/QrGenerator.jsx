import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import QrPanel from '../components/QrPanel.jsx';

export default function QrGenerator() {
  const [sp] = useSearchParams();
  const [input, setInput] = useState(sp.get('batch') || '');
  const [id, setId] = useState(sp.get('batch') || '');
  return (
    <>
      <h2>QR Generator</h2>
      <form className="glass pad row" onSubmit={(e) => { e.preventDefault(); setId(input.trim().toUpperCase()); }}>
        <input placeholder="Batch ID (BATCH003 — or BATCH999 for the fake-QR test)" value={input} onChange={(e) => setInput(e.target.value)} required />
        <button className="btn">Generate QR</button>
      </form>
      {id && <div className="glass pad"><QrPanel batchId={id} /></div>}
    </>
  );
}
