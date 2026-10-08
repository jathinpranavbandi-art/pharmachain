# Architecture

```
Phone / Browser ──► React (Vite :5173) ──/api proxy──► Express API (:4000) ──gRPC──► Fabric peer0.org1 ──► Go chaincode ──► ledger
                                                           │
                                                           └── (DEMO MODE only) backend/data/demo-ledger.json
```
- **Frontend** (`frontend/`): React Router SPA. `/verify/:batchId` is public and mobile-first; everything else needs a JWT. Vite proxies `/api`, so a phone only needs port 5173.
- **Backend** (`backend/`): `routes → controllers → services → fabric`. Controllers validate and authorise; `services/ledgerService.js` maps to chaincode calls; `fabric/index.js` picks the Fabric gateway or the labelled demo ledger.
- **Chaincode** (`chaincode/drugcontract`): business rules + state. Key = Batch ID. History via `GetHistoryForKey`; each state change stores `lastAction`, so history reads as Registered / Transferred / Location Updated.
- **Fabric network**: `fabric-samples/test-network` (2 orgs, 1 orderer, 1 channel). Chaincode endorsement policy is the default (majority of orgs).
- **Roles**: ADMIN (all), MANUFACTURER/DISTRIBUTOR/WHOLESALER/PHARMACY (own batches), public (verify only).
- **QR**: `http://<APP_HOST>:<FRONTEND_PORT>/verify/<BATCH>`; host is auto-detected LAN IP or configurable.
- **Workflow**: Login → Register (tx) → QR → scan → `GET /api/verify/:id` → chaincode `VerifyMedicine` + history → result page.
- **Limits**: single gateway identity, demo credentials, no rate limiting or HTTPS: prototype only.
