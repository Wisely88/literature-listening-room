#!/bin/sh
set -eu
mkdir -p /app/data
npm run db:migrate
npm run db:seed
exec npm start -- -H 0.0.0.0 -p "${PORT:-3000}"
