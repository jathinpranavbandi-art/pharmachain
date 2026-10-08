#!/usr/bin/env bash
# Installs Fabric (first run only) and starts the test network + channel.
set -e
. "$(dirname "$0")/common.sh"
command -v docker >/dev/null || { echo "Docker not found. Install Docker Desktop first."; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker is not running. Start Docker Desktop, then retry."; exit 1; }
if [ ! -d "$FABRIC_PATH/test-network" ]; then
  echo ">> Installing Fabric samples, binaries and Docker images into $FABRIC_PATH (first run, takes a few minutes)"
  mkdir -p "$(dirname "$FABRIC_PATH")"; cd "$(dirname "$FABRIC_PATH")"
  curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
  chmod +x install-fabric.sh
  ./install-fabric.sh --fabric-version 2.5.9 docker samples binary
fi
cd "$FABRIC_PATH/test-network"
./network.sh down
./network.sh up createChannel -c "$CHANNEL_NAME"
echo ">> Fabric is up (2 peers, 1 orderer, channel '$CHANNEL_NAME'). Next: scripts/deploy-chaincode.sh"
