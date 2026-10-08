// Picks the real Fabric gateway when reachable, otherwise the clearly-labelled demo ledger.
const cfg = require('../config');
let impl; let mode = 'demo'; let reason = '';

function normalize(e) {
  const msg = (e.details && e.details[0] && e.details[0].message) || e.message || 'Ledger error';
  const clean = msg.replace(/^.*?(?:message|error):?\s*/i, (m) => (m.length > 80 ? '' : m));
  let status = 500;
  if (/not found/i.test(msg)) status = 404;
  else if (/already exists/i.test(msg)) status = 409;
  else if (/access denied/i.test(msg)) status = 403;
  else if (/invalid|required/i.test(msg)) status = 400;
  else if (/UNAVAILABLE|DEADLINE/i.test(msg)) status = 503;
  return Object.assign(new Error(status === 500 || status === 503 ? msg : clean.trim()), { status });
}

exports.init = async () => {
  if (cfg.fabricMode !== 'demo') {
    try { const g = require('./gateway'); await g.init(); impl = g; mode = 'fabric'; return; }
    catch (e) {
      reason = e.message;
      if (cfg.fabricMode === 'fabric') throw new Error(`FABRIC_MODE=fabric but Fabric is not reachable: ${e.message}`);
      console.warn(`[ledger] Fabric not reachable (${e.message}). Falling back to DEMO MODE.`);
    }
  }
  impl = require('./demoLedger'); await impl.init(); mode = 'demo';
};
const wrap = (fn) => async (...a) => { try { return await impl[fn](...a); } catch (e) { throw normalize(e); } };
exports.invoke = wrap('invoke');
exports.query = wrap('query');
exports.info = () => ({ mode, label: mode === 'fabric' ? 'Hyperledger Fabric' : 'DEMO MODE – Local Ledger', reason });
