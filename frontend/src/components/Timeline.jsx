import { fmtTime, short } from '../api.js';

const LABEL = { REGISTERED: 'Registered', TRANSFERRED: 'Transferred', LOCATION_UPDATED: 'Location Updated', STATUS_UPDATED: 'Status Updated' };

export const eventItems = (history) => history.map((e) => ({
  title: LABEL[e.action] || e.action,
  lines: [
    e.action === 'TRANSFERRED' ? `${e.previousOwner} → ${e.newOwner}` : e.newOwner,
    `📍 ${e.location}` + (e.action === 'STATUS_UPDATED' ? ` · status ${e.status}` : ''),
  ],
  time: fmtTime(e.timestamp), tx: e.txId,
}));

export default function Timeline({ items }) {
  return (
    <ol className="timeline">
      {items.map((it, i) => (
        <li key={i} style={{ animationDelay: `${i * 80}ms` }}>
          <div className="dot" />
          <div className="tl-body">
            <div className="tl-title">{it.title}{it.time && <span className="muted small"> · {it.time}</span>}</div>
            {(it.lines || []).map((l, j) => <div key={j} className="small">{l}</div>)}
            {it.tx && <div className="mono small muted" title={it.tx}>Tx {short(it.tx)}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
