#!/bin/bash
# Ejecutar EN LA EC2 (por SSH) para actualizar código tras un git push.
set -euo pipefail

INSTALL_ROOT="${INSTALL_ROOT:-/var/www/senti2}"
REPO_DIR="$INSTALL_ROOT/repo"
FRONTEND_DIR="$INSTALL_ROOT/frontend"
BACKEND_DIR="$REPO_DIR/senti2-backend"
ANGULAR_DIR="$REPO_DIR/Senti2"
BRANCH="${BRANCH:-main}"

get_public_ip() {
  TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
  curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
    http://169.254.169.254/latest/meta-data/public-ipv4
}

cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

PUBLIC_IP="$(get_public_ip)"
APP_URL="http://${PUBLIC_IP}"

cd "$BACKEND_DIR"
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force

if grep -q '^APP_URL=' .env; then
  sed -i "s|^APP_URL=.*|APP_URL=$APP_URL|" .env
  sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=$APP_URL|" .env
fi

cd "$ANGULAR_DIR"
npm ci
npm run build -- --configuration=aws
rm -rf "$FRONTEND_DIR"
cp -a dist/senti2/browser "$FRONTEND_DIR"

chown -R www-data:www-data "$FRONTEND_DIR" "$BACKEND_DIR/storage" "$BACKEND_DIR/bootstrap/cache"
systemctl reload nginx

echo "Redeploy OK: $APP_URL"
