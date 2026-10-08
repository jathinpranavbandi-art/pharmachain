import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, auth } from '../api.js';

export default function Login() {
  const nav = useNavigate();
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [batch, setBatch] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const r = await api.login(f.username, f.password); auth.set(r.token, r.user); nav('/'); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="center-page">
      <form className="glass login" onSubmit={submit}>
        <div className="logo big">⬡</div>
        <h1 className="grad">PharmaChain</h1>
        <p className="muted">Blockchain-Based Pharmaceutical Verification</p>
        <label>Username<input autoFocus value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoComplete="username" required /></label>
        <label>Password<input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" required /></label>
        {err && <div className="alert err">{err}</div>}
        <button className="btn block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <hr />
        <p className="muted small">Citizen? No login needed — check a batch:</p>
        <div className="row">
          <input placeholder="e.g. BATCH003" value={batch} onChange={(e) => setBatch(e.target.value)} />
          <button type="button" className="btn ghost" onClick={() => batch.trim() && nav('/verify/' + batch.trim())}>Verify</button>
        </div>
      </form>
    </div>
  );
}
