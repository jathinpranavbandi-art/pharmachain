const express = require('express');
const cors = require('cors');
const cfg = require('./config');
const ledger = require('./fabric');

const app = express();
app.use(cors({ origin: cfg.corsOrigin === '*' ? true : cfg.corsOrigin.split(',') }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', require('./routes'));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(require('./middleware/error'));

ledger.init()
  .then(() => app.listen(cfg.port, '0.0.0.0', () => {
    const i = ledger.info();
    console.log(`PharmaChain API on http://localhost:${cfg.port}  |  ledger: ${i.label}`);
    console.log(`QR codes will point to http://${cfg.appHost}:${cfg.frontendPort}/verify/<BATCH_ID>`);
  }))
  .catch((e) => { console.error(e.message); process.exit(1); });
