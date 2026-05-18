FROM php:8.4-cli-alpine

RUN apk add --no-cache sqlite sqlite-dev libzip-dev libxml2-dev bash icu-dev icu-libs \
    && docker-php-ext-install pdo_sqlite zip xml bcmath intl sockets mbstring

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/app
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && cp .env.example .env \
    && sed -i 's|^APP_ENV=.*|APP_ENV=production|'           .env \
    && sed -i 's|^APP_DEBUG=.*|APP_DEBUG=false|'             .env \
    && sed -i 's|^APP_URL=.*|APP_URL=http://localhost|'      .env \
    && sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=http://localhost|' .env \
    && sed -i 's|^DB_CONNECTION=.*|DB_CONNECTION=sqlite|'    .env \
    && sed -i 's|^DB_DATABASE=.*|DB_DATABASE=/var/www/app/database/database.sqlite|' .env \
    && sed -i 's|^MAIL_MAILER=.*|MAIL_MAILER=log|'          .env \
    && php artisan key:generate \
    && touch database/database.sqlite \
    && php artisan migrate --force \
    && php artisan db:seed --force \
    && chown -R www-data:www-data storage bootstrap/cache database

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
