import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api, auth } from '../api.js';

const NAV = [
  ['/', 'Dashboard', '◈'], ['/medicines', 'Medicines', '▤'], ['/register', 'Register Medicine', '＋', 'ADMIN'],
  ['/qr', 'QR Generator', '▦'], ['/verification', 'Verification', '✓'], ['/supply-chain', 'Supply Chain', '⛓'],
  ['/history', 'Blockchain History', '⧉'], ['/profile', 'Admin Profile', '☺'],
];

export function LedgerBadge({ health }) {
  if (!health) return null;
  const fabric = health.ledger.mode === 'fabric';
  return <span className={`badge ${fabric ? 'ok' : 'warn'}`}>{fabric ? '⬡ Hyperledger Fabric' : 'DEMO MODE – Local Ledger'}</span>;
}

export default function Layout() {
  const nav = useNavigate();
  const user = auth.user();
  const [health, setHealth] = useState(null);
  useEffect(() => { api.health().then(setHealth).catch(() => {}); }, []);
  const logout = () => { auth.clear(); nav('/login'); };
  return (
    <div className="shell">
      <aside className="side glass">
        <div className="brand"><span className="logo">⬡</span> PharmaChain</div>
        <nav>
          {NAV.filter((n) => !n[3] || n[3] === user.role).map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <i>{icon}</i><span>{label}</span>
            </NavLink>
          ))}
          <button className="linklike" onClick={logout}><i>⏻</i><span>Logout</span></button>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div><b>{user.name}</b> <span className="muted">· {user.role}</span></div>
          <LedgerBadge health={health} />
        </header>
        <Outlet />
      </main>
    </div>
  );
}
