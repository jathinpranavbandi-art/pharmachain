package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const (
	// Only identities from this MSP (the Org1 admin/app identity) may write.
	authorisedMSP = "Org1MSP"
	dateLayout    = "2006-01-02"
)

var validStatuses = map[string]bool{
	"REGISTERED": true, "IN_TRANSIT": true, "IN_STOCK": true,
	"DISPENSED": true, "FLAGGED": true, "RECALLED": true,
}

// MedicineContract implements the PharmaChain business logic.
type MedicineContract struct {
	contractapi.Contract
}

// Medicine is the world-state record stored under key = BatchID.
type Medicine struct {
	BatchID           string `json:"batchId"`
	MedicineName      string `json:"medicineName"`
	Manufacturer      string `json:"manufacturer"`
	ManufacturerID    string `json:"manufacturerId"`
	ManufacturingDate string `json:"manufacturingDate"`
	ExpiryDate        string `json:"expiryDate"`
	Quantity          int    `json:"quantity"`
	MedicineType      string `json:"medicineType"`
	Description       string `json:"description"`
	CurrentOwner      string `json:"currentOwner"`
	PreviousOwner     string `json:"previousOwner"`
	CurrentLocation   string `json:"currentLocation"`
	Status            string `json:"status"`
	LastAction        string `json:"lastAction"`
	RegisteredBy      string `json:"registeredBy"`
	CreatedAt         string `json:"createdAt"`
	UpdatedAt         string `json:"updatedAt"`
}

// HistoryEntry is one committed version of a medicine (from Fabric key history).
type HistoryEntry struct {
	TxID      string   `json:"txId"`
	Timestamp string   `json:"timestamp"`
	IsDelete  bool     `json:"isDelete"`
	Medicine  Medicine `json:"medicine"`
}

// VerificationResult is returned by VerifyMedicine.
type VerificationResult struct {
	Exists   bool      `json:"exists"`
	Valid    bool      `json:"valid"`
	Expired  bool      `json:"expired"`
	Flagged  bool      `json:"flagged"`
	Message  string    `json:"message"`
	Medicine *Medicine `json:"medicine,omitempty"`
}

func requireAuthorised(ctx contractapi.TransactionContextInterface) error {
	msp, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("access denied: cannot read caller identity: %v", err)
	}
	if msp != authorisedMSP {
		return fmt.Errorf("access denied: MSP %s is not authorised to modify medicine records", msp)
	}
	return nil
}

func txTime(ctx contractapi.TransactionContextInterface) time.Time {
	ts, err := ctx.GetStub().GetTxTimestamp()
	if err != nil || ts == nil {
		return time.Now().UTC()
	}
	return ts.AsTime().UTC()
}

func readMedicine(ctx contractapi.TransactionContextInterface, batchID string) (*Medicine, error) {
	b, err := ctx.GetStub().GetState(batchID)
	if err != nil {
		return nil, fmt.Errorf("failed to read ledger: %v", err)
	}
	if b == nil {
		return nil, fmt.Errorf("medicine %s not found", batchID)
	}
	var m Medicine
	if err := json.Unmarshal(b, &m); err != nil {
		return nil, err
	}
	return &m, nil
}

func writeMedicine(ctx contractapi.TransactionContextInterface, m *Medicine) error {
	b, err := json.Marshal(m)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(m.BatchID, b)
}

func mutate(ctx contractapi.TransactionContextInterface, batchID string, fn func(m *Medicine) error) error {
	m, err := readMedicine(ctx, batchID)
	if err != nil {
		return err
	}
	if err := fn(m); err != nil {
		return err
	}
	m.UpdatedAt = txTime(ctx).Format(time.RFC3339)
	return writeMedicine(ctx, m)
}

// RegisterMedicine creates a new medicine batch. Fails if the BatchID exists.
func (c *MedicineContract) RegisterMedicine(ctx contractapi.TransactionContextInterface,
	batchID, medicineName, manufacturer, manufacturerID, manufacturingDate, expiryDate string,
	quantity int, medicineType, description, location, owner, status, registeredBy string) error {

	if err := requireAuthorised(ctx); err != nil {
		return err
	}
	batchID = strings.TrimSpace(batchID)
	if batchID == "" || strings.TrimSpace(medicineName) == "" || strings.TrimSpace(manufacturer) == "" ||
		strings.TrimSpace(location) == "" || strings.TrimSpace(owner) == "" {
		return fmt.Errorf("invalid input: batchID, medicineName, manufacturer, location and owner are required")
	}
	mfg, err := time.Parse(dateLayout, manufacturingDate)
	if err != nil {
		return fmt.Errorf("invalid manufacturingDate: use YYYY-MM-DD")
	}
	exp, err := time.Parse(dateLayout, expiryDate)
	if err != nil {
		return fmt.Errorf("invalid expiryDate: use YYYY-MM-DD")
	}
	if !exp.After(mfg) {
		return fmt.Errorf("invalid dates: expiryDate must be after manufacturingDate")
	}
	if quantity <= 0 {
		return fmt.Errorf("invalid quantity: must be greater than zero")
	}
	if status == "" {
		status = "REGISTERED"
	}
	if !validStatuses[status] {
		return fmt.Errorf("invalid status %s", status)
	}
	existing, err := ctx.GetStub().GetState(batchID)
	if err != nil {
		return fmt.Errorf("failed to read ledger: %v", err)
	}
	if existing != nil {
		return fmt.Errorf("medicine %s already exists", batchID)
	}
	now := txTime(ctx).Format(time.RFC3339)
	return writeMedicine(ctx, &Medicine{
		BatchID: batchID, MedicineName: medicineName, Manufacturer: manufacturer,
		ManufacturerID: manufacturerID, ManufacturingDate: manufacturingDate, ExpiryDate: expiryDate,
		Quantity: quantity, MedicineType: medicineType, Description: description,
		CurrentOwner: owner, CurrentLocation: location, Status: status, LastAction: "REGISTERED",
		RegisteredBy: registeredBy, CreatedAt: now, UpdatedAt: now,
	})
}

// GetMedicine returns the current record for a batch.
func (c *MedicineContract) GetMedicine(ctx contractapi.TransactionContextInterface, batchID string) (*Medicine, error) {
	return readMedicine(ctx, batchID)
}

// VerifyMedicine never errors for unknown batches; it reports Exists=false instead.
func (c *MedicineContract) VerifyMedicine(ctx contractapi.TransactionContextInterface, batchID string) (*VerificationResult, error) {
	b, err := ctx.GetStub().GetState(batchID)
	if err != nil {
		return nil, fmt.Errorf("failed to read ledger: %v", err)
	}
	if b == nil {
		return &VerificationResult{Exists: false, Message: "No registered record found"}, nil
	}
	var m Medicine
	if err := json.Unmarshal(b, &m); err != nil {
		return nil, err
	}
	res := &VerificationResult{Exists: true, Medicine: &m}
	if exp, err := time.Parse(dateLayout, m.ExpiryDate); err == nil {
		res.Expired = exp.Before(txTime(ctx).Truncate(24 * time.Hour))
	}
	res.Flagged = m.Status == "FLAGGED" || m.Status == "RECALLED"
	res.Valid = !res.Expired && !res.Flagged
	switch {
	case res.Flagged:
		res.Message = "Registered, but flagged: do not use"
	case res.Expired:
		res.Message = "Registered, but this batch has expired"
	default:
		res.Message = "Authenticity verified against the registered record"
	}
	return res, nil
}

// TransferOwnership moves the batch to a new owner (and optionally a new location).
func (c *MedicineContract) TransferOwnership(ctx contractapi.TransactionContextInterface, batchID, newOwner, newLocation string) error {
	if err := requireAuthorised(ctx); err != nil {
		return err
	}
	newOwner = strings.TrimSpace(newOwner)
	if newOwner == "" {
		return fmt.Errorf("invalid input: newOwner is required")
	}
	return mutate(ctx, batchID, func(m *Medicine) error {
		if m.Status == "RECALLED" {
			return fmt.Errorf("invalid operation: recalled batches cannot be transferred")
		}
		m.PreviousOwner = m.CurrentOwner
		m.CurrentOwner = newOwner
		if strings.TrimSpace(newLocation) != "" {
			m.CurrentLocation = newLocation
		}
		m.LastAction = "TRANSFERRED"
		return nil
	})
}

// UpdateLocation records a new physical location.
func (c *MedicineContract) UpdateLocation(ctx contractapi.TransactionContextInterface, batchID, newLocation string) error {
	if err := requireAuthorised(ctx); err != nil {
		return err
	}
	if strings.TrimSpace(newLocation) == "" {
		return fmt.Errorf("invalid input: newLocation is required")
	}
	return mutate(ctx, batchID, func(m *Medicine) error {
		m.CurrentLocation = newLocation
		m.LastAction = "LOCATION_UPDATED"
		return nil
	})
}

// UpdateStatus changes the lifecycle status.
func (c *MedicineContract) UpdateStatus(ctx contractapi.TransactionContextInterface, batchID, newStatus string) error {
	if err := requireAuthorised(ctx); err != nil {
		return err
	}
	if !validStatuses[newStatus] {
		return fmt.Errorf("invalid status %s", newStatus)
	}
	return mutate(ctx, batchID, func(m *Medicine) error {
		m.Status = newStatus
		m.LastAction = "STATUS_UPDATED"
		return nil
	})
}

// GetMedicineHistory returns every committed version using Fabric's key history.
func (c *MedicineContract) GetMedicineHistory(ctx contractapi.TransactionContextInterface, batchID string) ([]*HistoryEntry, error) {
	it, err := ctx.GetStub().GetHistoryForKey(batchID)
	if err != nil {
		return nil, err
	}
	defer it.Close()
	out := []*HistoryEntry{}
	for it.HasNext() {
		r, err := it.Next()
		if err != nil {
			return nil, err
		}
		e := &HistoryEntry{TxID: r.TxId, IsDelete: r.IsDelete}
		if r.Timestamp != nil {
			e.Timestamp = r.Timestamp.AsTime().UTC().Format(time.RFC3339)
		}
		if !r.IsDelete {
			if err := json.Unmarshal(r.Value, &e.Medicine); err != nil {
				return nil, err
			}
		}
		out = append(out, e)
	}
	if len(out) == 0 {
		return nil, fmt.Errorf("medicine %s not found", batchID)
	}
	return out, nil
}

// GetAllMedicines returns all registered batches.
func (c *MedicineContract) GetAllMedicines(ctx contractapi.TransactionContextInterface) ([]*Medicine, error) {
	it, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer it.Close()
	out := []*Medicine{}
	for it.HasNext() {
		kv, err := it.Next()
		if err != nil {
			return nil, err
		}
		var m Medicine
		if err := json.Unmarshal(kv.Value, &m); err != nil {
			return nil, err
		}
		out = append(out, &m)
	}
	return out, nil
}
