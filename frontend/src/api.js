const T = 'pc_token', U = 'pc_user';
export const STATUSES = ['REGISTERED', 'IN_TRANSIT', 'IN_STOCK', 'DISPENSED', 'FLAGGED', 'RECALLED'];
export const auth = {
  token: () => localStorage.getItem(T),
  user: () => JSON.parse(localStorage.getItem(U) || 'null'),
  set: (t, u) => { localStorage.setItem(T, t); localStorage.setItem(U, JSON.stringify(u)); },
  clear: () => { localStorage.removeItem(T); localStorage.removeItem(U); },
};

async function req(path, { method = 'GET', body, pub } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = auth.token();
  if (token && !pub) headers.Authorization = `Bearer ${token}`;
  const res = await fetch('/api' + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token && !pub) { auth.clear(); window.location.href = '/login'; }
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { details: data.details, status: res.status });
  return data;
}

export const api = {
  health: () => req('/health', { pub: true }),
  login: (username, password) => req('/auth/login', { method: 'POST', body: { username, password }, pub: true }),
  publicVerify: (id) => req('/verify/' + encodeURIComponent(id), { pub: true }),
  list: () => req('/medicines'),
  register: (b) => req('/medicines/register', { method: 'POST', body: b }),
  history: (id) => req(`/medicines/${encodeURIComponent(id)}/history`),
  qr: (id, host) => req(`/medicines/${encodeURIComponent(id)}/qr${host ? '?host=' + encodeURIComponent(host) : ''}`),
  transfer: (id, b) => req(`/medicines/${encodeURIComponent(id)}/transfer`, { method: 'POST', body: b }),
  location: (id, b) => req(`/medicines/${encodeURIComponent(id)}/location`, { method: 'POST', body: b }),
  status: (id, b) => req(`/medicines/${encodeURIComponent(id)}/status`, { method: 'POST', body: b }),
  transactions: () => req('/blockchain/transactions'),
};

export const fmtDate = (s) => (s ? new Date(s).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : '–');
export const fmtTime = (s) => (s ? new Date(s).toLocaleString('en-GB') : '–');
export const isExpired = (m) => m.expiryDate < new Date().toISOString().slice(0, 10);
export const short = (tx) => (tx ? tx.slice(0, 10) + '…' + tx.slice(-6) : '–');
