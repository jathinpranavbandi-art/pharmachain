# 5–10 minute demonstration script
**Before class:** start everything, put laptop + phone on the same Wi-Fi, confirm header badge, register nothing yet (or use a fresh Batch ID).

1. **Architecture (1 min)** – show `docs/architecture.md` diagram: phone → React → Express → Fabric → chaincode.
2. **Fabric network (1 min)** – terminal: `docker ps` (peers, orderer); mention channel `mychannel`; header badge "Hyperledger Fabric".
3. **Chaincode (1 min)** – open `contract.go`: RegisterMedicine, MSP check, GetHistoryForKey.
4. **Admin login (30 s)** – admin / admin123.
5. **Register medicine (1 min)** – BATCH003 Azithromycin 500mg, PharmaCorp, qty 1000, expiry 2027-12-31 → REGISTER MEDICINE.
6. **Blockchain transaction (30 s)** – point at the Tx ID; open Blockchain History.
7. **QR generation (30 s)** – show QR, link with LAN IP; mention download/print/copy.
8. **Scan with phone (1 min)** – scan QR from the laptop screen.
9. **Verified page (1 min)** – ✓ VERIFIED MEDICINE, "Registered in PharmaChain", details, blockchain reference.
10. **Fake QR (1 min)** – QR Generator → BATCH999 → scan → ✕ MEDICINE NOT VERIFIED.
11. **Supply chain (1 min)** – Supply Chain → transfer to ABC Distributors (Bangalore), then XYZ Pharmacy (Chennai); refresh phone page to show history.
12. **Communication (30 s)** – explain React → REST → Gateway SDK → peer endorse → orderer → commit; mention prototype disclaimer.
