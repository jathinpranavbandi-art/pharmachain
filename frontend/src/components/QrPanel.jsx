import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function QrPanel({ batchId }) {
  const [host, setHost] = useState('');
  const [qr, setQr] = useState(null);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const load = (h) => { setErr(''); api.qr(batchId, h).then((d) => { setQr(d); if (!h) setHost(d.host.replace(/:\d+$/, '')); }).catch((e) => setErr(e.message)); };
  useEffect(() => { if (batchId) load(''); }, [batchId]); // eslint-disable-line

  const copy = async () => {
    try { await navigator.clipboard.writeText(qr.verifyUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { window.prompt('Copy this link:', qr.verifyUrl); }
  };
  if (err) return <div className="alert err">{err}</div>;
  if (!qr) return <p className="muted">Generating QR…</p>;
  return (
    <div className="qrpanel">
      <div className="print-area qrbox">
        <img src={qr.qrDataUrl} alt={`QR for ${qr.batchId}`} />
        <div className="mono">{qr.batchId}</div>
        <div className="small">Scan to verify · PharmaChain</div>
      </div>
      <div className="qrside">
        {!qr.registered && <div className="alert warn">Batch {qr.batchId} is NOT registered. Scanning this QR will show “MEDICINE NOT VERIFIED” (useful for the fake-QR test).</div>}
        <label>Host / IP for phones on your Wi-Fi
          <div className="row"><input value={host} onChange={(e) => setHost(e.target.value)} placeholder="192.168.1.5" />
            <button className="btn ghost" onClick={() => load(host)}>Apply</button></div>
        </label>
        <div className="mono small break linkbox">{qr.verifyUrl}</div>
        <div className="row wrap">
          <a className="btn" href={qr.qrDataUrl} download={`${qr.batchId}-qr.png`}>Download QR</a>
          <button className="btn ghost" onClick={() => window.print()}>Print QR</button>
          <button className="btn ghost" onClick={copy}>{copied ? 'Copied ✓' : 'Copy link'}</button>
        </div>
      </div>
    </div>
  );
}
