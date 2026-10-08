package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	cc, err := contractapi.NewChaincode(&MedicineContract{})
	if err != nil {
		log.Panicf("error creating drugcontract chaincode: %v", err)
	}
	if err := cc.Start(); err != nil {
		log.Panicf("error starting drugcontract chaincode: %v", err)
	}
}
