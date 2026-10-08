# Requirements Mapping

| # | Assignment requirement | Implementation | File / module | How to demonstrate |
|---|---|---|---|---|
| 1 | Blockchain network setup (Hyperledger Fabric) | Fabric `test-network`: 2 peers (Org1, Org2), 1 orderer, channel `mychannel`, org identities/certs, chaincode lifecycle (package → install → approve → commit) driven by scripts | `scripts/start-fabric.sh`, `scripts/deploy-chaincode.sh`, `scripts/stop-fabric.sh`, `backend/fabric/gateway.js` | Run the scripts; `docker ps` shows peers/orderer; header badge shows "Hyperledger Fabric" |
| 2 | Smart contract / chaincode (Go) | `MedicineContract`: RegisterMedicine, GetMedicine, VerifyMedicine, TransferOwnership, UpdateLocation, UpdateStatus, GetMedicineHistory, GetAllMedicines; MSP-based access control; world-state storage; key history | `chaincode/drugcontract/{contract,main}.go`, `docs/chaincode.md` | Show code; register a batch, then Blockchain History page lists tx IDs; call from peer CLI (docs/chaincode.md) |
| 3 | Frontend – blockchain integration | React + Vite UI → Express REST API → Fabric Gateway SDK; users submit transactions and read records | `frontend/src/`, `backend/routes`, `backend/controllers`, `backend/services`, `docs/api.md` | Register/transfer in UI, see tx IDs returned |
| 4 | Functional demonstration of core modules | Admin login → register → tx → QR → public scan → verified page with history; fake batch → NOT VERIFIED | `Register.jsx`, `QrPanel.jsx`, `PublicVerify.jsx`, `VerifyCard.jsx` | `docs/demonstration.md` (5–10 min script) |
| 5 | Code quality, documentation, review progress | Layered backend, validation, JWT + RBAC, automated tests, full docs | `README.md`, `docs/*.md`, `backend/tests/api.test.js` | `npm test`; open docs |

## Security features
JWT auth, role-based authorization, input validation, protected admin APIs, public verify API returns only safe fields (no `registeredBy`), env-based config, CORS config, central error handling, chaincode MSP check. Passwords are hashed server-side and never in frontend code.

## Honesty notes
- Prototype wording is "Verified by PharmaChain Administrator"; no government approval is claimed.
- `DEMO MODE – Local Ledger` is a JSON file, **not** a blockchain, and is labelled as such in the UI and `/api/health`.
- The backend signs all transactions with one Fabric identity (Org1 User1); per-user roles are enforced in the API layer, and the chaincode enforces that only the Org1 MSP can write.
