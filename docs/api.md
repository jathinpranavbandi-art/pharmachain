# REST API (base `/api`, JSON). `Authorization: Bearer <token>` unless marked public.

| Method | Path | Role | Description |
|---|---|---|---|
| GET | /health | public | Status, ledger mode (`fabric` or `demo`), QR host |
| POST | /auth/login | public | `{username,password}` → `{token,user}` |
| GET | /verify/:batchId | public | Safe verification result + history |
| POST | /medicines/register | ADMIN | Register batch → `201 {txId, medicine}` (409 if duplicate) |
| GET | /medicines | any | List (non-admins: own batches only) |
| GET | /medicines/:batchId | owner/ADMIN | Full record |
| GET | /medicines/:batchId/history | owner/ADMIN | Events with tx IDs |
| POST | /medicines/:batchId/transfer | owner/ADMIN | `{newOwner, location?}` |
| POST | /medicines/:batchId/location | owner/ADMIN | `{location}` |
| POST | /medicines/:batchId/status | owner/ADMIN | `{status}` one of REGISTERED, IN_TRANSIT, IN_STOCK, DISPENSED, FLAGGED, RECALLED |
| GET | /medicines/:batchId/qr?host= | any | `{verifyUrl, qrDataUrl, registered}` (works for unregistered IDs, for the fake-QR test) |
| GET | /blockchain/transactions | any | Latest 100 transactions across visible batches |

Register body: `batchId, medicineName, manufacturer, manufacturerId, manufacturingDate, expiryDate (YYYY-MM-DD or MM/DD/YYYY), quantity, medicineType, description, initialLocation, initialOwner, status`.
Errors: `{error, details?}` with 400 (validation), 401, 403, 404, 409, 503.
Public verify unregistered: `{registered:false, verified:false, message}`. Registered: adds `expired`, `flagged`, `medicine{…}`, `history[]`, `blockchainRef`, `verifiedBy`.
