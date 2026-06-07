#!/bin/sh
set -e

if [ -z "$APP_KEY" ] && [ ! -f .env ]; then
  echo "ERROR: APP_KEY o archivo .env requerido para conectar con Neon."
  exit 1
fi

php artisan migrate --force
php artisan storage:link --force 2>/dev/null || true

exec "$@"
