import { useEffect, useState } from 'react';
import { api, auth } from '../api.js';
import { LedgerBadge } from '../components/Layout.jsx';

export default function Profile() {
  const u = auth.user();
  const [h, setH] = useState(null);
  useEffect(() => { api.health().then(setH).catch(() => {}); }, []);
  return (
    <>
      <h2>Admin Profile</h2>
      <div className="glass pad">
        <dl className="grid2">
          <div><dt>Name</dt><dd>{u.name}</dd></div><div><dt>Username</dt><dd>{u.username}</dd></div>
          <div><dt>Role</dt><dd>{u.role}</dd></div><div><dt>Organisation</dt><dd>{u.org}</dd></div>
          <div><dt>Ledger</dt><dd><LedgerBadge health={h} /></dd></div><div><dt>QR host</dt><dd>{h ? `${h.appHost}:${h.frontendPort}` : '–'}</dd></div>
        </dl>
        <p className="muted small">Academic prototype. The administrator represents the authorized verification authority in the prototype. It does not constitute actual government certification or regulatory approval.</p>
      </div>
    </>
  );
}
