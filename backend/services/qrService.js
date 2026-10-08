const QRCode = require('qrcode');
const cfg = require('../config');

exports.build = async (batchId, hostOverride) => {
  let host = String(hostOverride || cfg.appHost).trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!/^[A-Za-z0-9.\-:]+$/.test(host)) throw Object.assign(new Error('Invalid host'), { status: 400 });
  if (!host.includes(':')) host += `:${cfg.frontendPort}`; // phone opens the web app, which proxies /api
  const verifyUrl = `http://${host}/verify/${encodeURIComponent(batchId)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 480, margin: 2, errorCorrectionLevel: 'M' });
  return { verifyUrl, qrDataUrl, host };
};
