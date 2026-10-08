#!/usr/bin/env bash
. "$(dirname "$0")/common.sh"
cd "$ROOT/backend"
[ -d node_modules ] || npm install
exec node app.js
