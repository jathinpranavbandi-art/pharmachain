#!/usr/bin/env bash
set -e
. "$(dirname "$0")/common.sh"
cd "$FABRIC_PATH/test-network" && ./network.sh down
