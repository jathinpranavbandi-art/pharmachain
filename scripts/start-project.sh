#!/usr/bin/env bash
# Starts backend + frontend. Use "--demo" to skip Fabric (DEMO MODE - Local Ledger).
. "$(dirname "$0")/common.sh"
[ "$1" = "--demo" ] && export FABRIC_MODE=demo
cd "$ROOT/backend"; [ -d node_modules ] || npm install
cd "$ROOT/frontend"; [ -d node_modules ] || npm install
cd "$ROOT/backend"; node app.js & BACK=$!
trap 'kill $BACK 2>/dev/null' EXIT INT TERM
cd "$ROOT/frontend"; npm run dev
