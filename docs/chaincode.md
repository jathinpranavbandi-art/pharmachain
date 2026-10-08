# Chaincode: `drugcontract` (Go, fabric-contract-api-go)

Access control: every write checks the caller's MSP ID is `Org1MSP`; otherwise `access denied`. Reads are open to channel members.

| Function | Type | Description |
|---|---|---|
| RegisterMedicine(batchID, medicineName, manufacturer, manufacturerID, manufacturingDate, expiryDate, quantity, medicineType, description, location, owner, status, registeredBy) | write | Validates input/dates, rejects duplicates, stores record |
| GetMedicine(batchID) | read | Current record or `not found` |
| VerifyMedicine(batchID) | read | `{exists, valid, expired, flagged, message, medicine}`; unknown batch → `exists:false` |
| TransferOwnership(batchID, newOwner, newLocation) | write | Sets previous/current owner; blocked for RECALLED |
| UpdateLocation(batchID, newLocation) | write | Updates location |
| UpdateStatus(batchID, newStatus) | write | Validated status |
| GetMedicineHistory(batchID) | read | Every version: txId, timestamp, record (Fabric `GetHistoryForKey`) |
| GetAllMedicines() | read | All batches via range query |

Timestamps come from the transaction timestamp (deterministic across peers).

Peer CLI example (after `deploy-chaincode.sh`, from `fabric-samples/test-network`, with the standard `peer` env from the Fabric docs):
`peer chaincode query -C mychannel -n drugcontract -c '{"Args":["GetAllMedicines"]}'`
