#!/usr/bin/env bash
# Packages, installs, approves and commits the Go chaincode.
set -e
. "$(dirname "$0")/common.sh"
command -v go >/dev/null || { echo "Go not found. Install Go 1.20+ from https://go.dev/dl/"; exit 1; }
( cd "$ROOT/chaincode/drugcontract" && go mod tidy )
cd "$FABRIC_PATH/test-network"
./network.sh deployCC -c "$CHANNEL_NAME" -ccn "$CHAINCODE_NAME" -ccp "$ROOT/chaincode/drugcontract" -ccl go
echo ">> Chaincode '$CHAINCODE_NAME' deployed on '$CHANNEL_NAME'. Next: scripts/start-project.sh"
