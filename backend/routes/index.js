const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const auth = require('../controllers/authController');
const med = require('../controllers/medicineController');
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Public
router.get('/health', h(med.health));
router.post('/auth/login', h(auth.login));
router.get('/verify/:batchId', h(med.verify));

// Authenticated
router.use(authenticate);
router.post('/medicines/register', requireRole('ADMIN'), h(med.register));
router.get('/medicines', h(med.list));
router.get('/blockchain/transactions', h(med.transactions));
router.get('/medicines/:batchId', h(med.get));
router.get('/medicines/:batchId/history', h(med.history));
router.get('/medicines/:batchId/qr', h(med.qr));
router.post('/medicines/:batchId/transfer', h(med.transfer));
router.post('/medicines/:batchId/location', h(med.location));
router.post('/medicines/:batchId/status', h(med.status));

module.exports = router;
