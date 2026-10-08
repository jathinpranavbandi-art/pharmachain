# PharmaChain – Blockchain-Based Pharmaceutical Supply Chain and Medicine Verification

> **This is an academic prototype.** The administrator represents the authorized verification authority in the prototype. It does not constitute actual government certification or regulatory approval. It needs additional security hardening before any production use.

An administrator registers genuine medicine batches on a **Hyperledger Fabric** ledger (Go chaincode). Each batch gets a QR code. A citizen scans it with a phone (no login) and sees **✓ VERIFIED MEDICINE** or **✕ MEDICINE NOT VERIFIED**, plus the supply-chain history.

## Two ways to run

| Mode | Needs | Ledger |
|---|---|---|
| **A. Quick demo** (try this first) | Node.js 18+ | `DEMO MODE – Local Ledger` (a JSON file, **not** a blockchain, clearly labelled in the UI) |
| **B. Full Fabric** (for marking) | Docker, Go, Node.js, Git, curl | Real Hyperledger Fabric test-network |

Fabric needs Linux-style tools. **macOS:** works natively. **Windows:** use WSL2 (Ubuntu) + Docker Desktop for Mode B; Mode A runs natively on Windows.

## Install once
- Node.js 18+ (https://nodejs.org) – check with `node -v`
- Mode B only: Docker Desktop (https://docker.com), Go 1.20+ (https://go.dev/dl), Git

## macOS
```bash
cd PharmaChain
# Mode A – quick demo
./scripts/start-project.sh --demo

# Mode B – real Fabric (first run downloads Fabric, ~10 min)
./scripts/start-fabric.sh
./scripts/deploy-chaincode.sh
./scripts/start-project.sh
```
If scripts are not executable: `chmod +x scripts/*.sh`.

## Windows
**Mode A (no Docker):** open the extracted folder, double-click `scripts\start-demo.bat` (or in PowerShell: `.\scripts\start-demo.bat`).

**Mode B (Fabric):** open *Ubuntu (WSL2)*, enable Docker Desktop → Settings → Resources → WSL integration, then:
```bash
cd /mnt/c/Users/YOU/Downloads/PharmaChain   # path to the extracted folder
sudo apt update && sudo apt install -y dos2unix nodejs npm golang-go
dos2unix scripts/*.sh
./scripts/start-fabric.sh && ./scripts/deploy-chaincode.sh && ./scripts/start-project.sh
```
Open the app from Windows at `http://localhost:5173`.

## Open the app
- Admin: `http://localhost:5173` → login **admin / admin123**
- The header badge shows `Hyperledger Fabric` (green) or `DEMO MODE – Local Ledger` (amber).

## Demo accounts (demo only)
| Username | Password | Role / organisation |
|---|---|---|
| admin | admin123 | ADMIN |
| pharmacorp | pharma123 | MANUFACTURER – PharmaCorp |
| abcdist | dist123 | DISTRIBUTOR – ABC Distributors |
| wholesale | whole123 | WHOLESALER – MediWholesale |
| xyzpharmacy | pharm123 | PHARMACY – XYZ Pharmacy |

Non-admin users only see batches currently owned by their organisation and can transfer / update them.

## Register → QR → phone verify
1. Login → **Register Medicine** (form is pre-filled with BATCH003 Azithromycin 500mg) → **REGISTER MEDICINE**.
2. A transaction ID and the QR appear. The QR holds `http://<your-LAN-IP>:5173/verify/BATCH003` (auto-detected; change it in the QR panel or set `APP_HOST` in `.env`).
3. Phone on the **same Wi-Fi** → scan → verification page opens, no login.
4. Fake test: **QR Generator** → `BATCH999` → scan → **MEDICINE NOT VERIFIED**.

## Configuration (`.env`, created automatically)
`FABRIC_PATH`, `CHANNEL_NAME`, `CHAINCODE_NAME`, `API_PORT`, `APP_HOST`, plus `FRONTEND_PORT`, `JWT_SECRET`, `FABRIC_MODE` (`auto|fabric|demo`). Defaults work as-is.

## Testing
With the backend running: `cd backend && npm test` (runs all 11 documented tests). See `docs/testing.md`.

## Troubleshooting
| Problem | Fix |
|---|---|
| Badge says DEMO MODE but you wanted Fabric | Run `start-fabric.sh` + `deploy-chaincode.sh` first; set `FABRIC_MODE=fabric` to see the exact error |
| Phone can't open the link | Same Wi-Fi? Set `APP_HOST` (e.g. `192.168.1.5`) or edit the host in the QR panel; allow Node through the firewall |
| `port 5173 in use` | Close the old terminal, or change `FRONTEND_PORT` in `.env` |
| `go mod tidy` fails | Needs internet and Go 1.20+ |
| `Docker is not running` | Start Docker Desktop |
| `bad interpreter` on scripts (WSL) | `dos2unix scripts/*.sh` |
| Reset demo data | Delete `backend/data/demo-ledger.json`; for Fabric rerun `start-fabric.sh` |

More: `docs/architecture.md`, `docs/api.md`, `docs/chaincode.md`, `docs/testing.md`, `docs/demonstration.md`, `PROJECT_REQUIREMENTS.md`.
