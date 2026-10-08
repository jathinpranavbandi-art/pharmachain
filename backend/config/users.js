// Demo users (academic prototype). Passwords are hashed in memory and never sent to the frontend.
const bcrypt = require('bcryptjs');
const mk = (username, password, role, org, name) => ({
  username, role, org, name, passwordHash: bcrypt.hashSync(password, 8),
});
module.exports = [
  mk('admin', process.env.ADMIN_PASSWORD || 'admin123', 'ADMIN', 'PharmaChain Administrator', 'System Administrator'),
  mk('pharmacorp', 'pharma123', 'MANUFACTURER', 'PharmaCorp', 'PharmaCorp Manufacturer'),
  mk('abcdist', 'dist123', 'DISTRIBUTOR', 'ABC Distributors', 'ABC Distributors'),
  mk('wholesale', 'whole123', 'WHOLESALER', 'MediWholesale', 'MediWholesale'),
  mk('xyzpharmacy', 'pharm123', 'PHARMACY', 'XYZ Pharmacy', 'XYZ Pharmacy'),
];
