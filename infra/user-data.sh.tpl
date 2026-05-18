#!/bin/bash
set -euo pipefail

LOG="/var/log/senti2-user-data.log"
exec > >(tee -a "$LOG") 2>&1

echo "=== Senti2 deploy started at $(date -Is) ==="

export DEBIAN_FRONTEND=noninteractive

INSTALL_ROOT="${app_install_root}"
REPO_DIR="$INSTALL_ROOT/repo"
FRONTEND_DIR="$INSTALL_ROOT/frontend"
BACKEND_DIR="$REPO_DIR/senti2-backend"
ANGULAR_DIR="$REPO_DIR/Senti2"

GITHUB_REPO="${github_repo_url}"
GITHUB_BRANCH="${github_branch}"

get_public_ip() {
  TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
  curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
    http://169.254.169.254/latest/meta-data/public-ipv4
}

apt-get update -y
apt-get install -y software-properties-common curl git unzip nginx

add-apt-repository -y ppa:ondrej/php
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get update -y

apt-get install -y \
  php8.4-fpm php8.4-cli php8.4-sqlite3 php8.4-mbstring php8.4-xml \
  php8.4-curl php8.4-zip php8.4-bcmath php8.4-intl php8.4-sockets \
  nodejs

if ! command -v composer >/dev/null 2>&1; then
  curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi

mkdir -p "$INSTALL_ROOT"
rm -rf "$REPO_DIR"
git clone --depth 1 --branch "$GITHUB_BRANCH" "$GITHUB_REPO" "$REPO_DIR"

PUBLIC_IP="$(get_public_ip)"
APP_URL="http://$${PUBLIC_IP}"

echo "Public IP: $APP_URL"

# --- Backend Laravel ---
cd "$BACKEND_DIR"
composer install --no-dev --optimize-autoloader --no-interaction

cp .env.example .env
php artisan key:generate --force

sqlite_path="$BACKEND_DIR/database/database.sqlite"
touch "$sqlite_path"

sed -i 's|^APP_ENV=.*|APP_ENV=production|' .env
sed -i 's|^APP_DEBUG=.*|APP_DEBUG=false|' .env
sed -i "s|^APP_URL=.*|APP_URL=$APP_URL|" .env
sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=$APP_URL|" .env
sed -i 's|^DB_CONNECTION=.*|DB_CONNECTION=sqlite|' .env
sed -i "s|^DB_DATABASE=.*|DB_DATABASE=$sqlite_path|" .env
sed -i 's|^MAIL_MAILER=.*|MAIL_MAILER=log|' .env

php artisan migrate --force
php artisan db:seed --force

chown -R www-data:www-data storage bootstrap/cache database
chmod -R ug+rwx storage bootstrap/cache
chmod 664 "$sqlite_path"

# --- Frontend Angular ---
cd "$ANGULAR_DIR"
npm ci
npm run build -- --configuration=aws

rm -rf "$FRONTEND_DIR"
cp -a dist/senti2/browser "$FRONTEND_DIR"
chown -R www-data:www-data "$FRONTEND_DIR"

# --- Nginx ---
rm -f /etc/nginx/sites-enabled/default
cp "$REPO_DIR/infra/files/nginx-senti2.conf" /etc/nginx/sites-available/senti2.conf
ln -sf /etc/nginx/sites-available/senti2.conf /etc/nginx/sites-enabled/senti2.conf
nginx -t

systemctl enable nginx php8.4-fpm
systemctl restart php8.4-fpm nginx

echo "=== Senti2 deploy finished at $(date -Is) ==="
echo "App URL: $APP_URL"
