#!/bin/sh
set -e

cd /app

if [ ! -x node_modules/next/dist/bin/next ]; then
  echo "Reinstalling dependencies (incomplete node_modules volume)..."
  find node_modules -mindepth 1 -delete 2>/dev/null || true
fi

bun install --frozen-lockfile

exec "$@"
