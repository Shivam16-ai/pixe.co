#!/bin/sh
set -eu

if [ ! -f /data/dev.db ]; then
  npm run db:migrate
fi

exec npm start
