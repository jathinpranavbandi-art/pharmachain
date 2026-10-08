#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$ROOT/.env" ] || cp "$ROOT/.env.example" "$ROOT/.env"
set -a; . "$ROOT/.env"; set +a
export FABRIC_PATH="${FABRIC_PATH:-$HOME/fabric-samples}"
export CHANNEL_NAME="${CHANNEL_NAME:-mychannel}"
export CHAINCODE_NAME="${CHAINCODE_NAME:-drugcontract}"
export PATH="$FABRIC_PATH/bin:$PATH"
export FABRIC_CFG_PATH="$FABRIC_PATH/config"
