#!/usr/bin/env bash
. "$(dirname "$0")/common.sh"
cd "$ROOT/frontend"
[ -d node_modules ] || npm install
exec npm run dev
