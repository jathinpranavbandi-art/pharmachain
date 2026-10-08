const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

function lanIp() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) return i.address;
  }
  return 'localhost';
}

module.exports = {
  port: Number(process.env.API_PORT) || 4000,
  frontendPort: Number(process.env.FRONTEND_PORT) || 5173,
  appHost: process.env.APP_HOST || lanIp(),
  jwtSecret: process.env.JWT_SECRET || 'change-this-demo-secret',
  jwtExpires: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  fabricMode: (process.env.FABRIC_MODE || 'auto').toLowerCase(),
  fabricPath: process.env.FABRIC_PATH || path.join(os.homedir(), 'fabric-samples'),
  channel: process.env.CHANNEL_NAME || 'mychannel',
  chaincode: process.env.CHAINCODE_NAME || 'drugcontract',
  mspId: 'Org1MSP',
};
