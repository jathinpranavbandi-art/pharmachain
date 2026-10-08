# Testing
Automated: start the backend, then `cd backend && npm test`. Manual steps below use the UI.

| # | Test | Steps | Expected |
|---|---|---|---|
| 1 | Admin login | admin / admin123 | Redirect to dashboard |
| 2 | Register valid medicine | Register BATCH003 | Success banner, Tx ID, QR shown |
| 3 | Duplicate Batch ID | Register BATCH003 again | Error "already exists" (HTTP 409) |
| 4 | Generate QR | QR Generator → BATCH003 | QR + `http://<IP>:5173/verify/BATCH003`; download/print/copy work |
| 5 | Verify registered | Open the link | ✓ VERIFIED MEDICINE, details, history, tx ref |
| 6 | Verify unknown | `/verify/BATCH999` | ✕ MEDICINE NOT VERIFIED |
| 7 | Transfer ownership | Supply Chain → ABC Distributors, Bangalore | Tx committed; owner changes |
| 8 | Update location | Supply Chain → Chennai | Tx committed; location changes |
| 9 | View history | Supply Chain / public page | Registered, Transferred, Location Updated with tx IDs |
| 10 | Expired warning | Register a batch with past expiry (e.g. 2026-02-01) or view seeded BATCH002 in demo mode | Amber "REGISTERED – EXPIRED" |
| 11 | Unauthorized register | Login as pharmacorp / pharma123, `POST /medicines/register`; or no token | 403 / 401; Register page hidden for non-admins |
