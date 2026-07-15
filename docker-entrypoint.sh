#!/bin/bash

# Create .env file from runtime environment variables
echo "APP_NAME=Laravel" > /var/www/html/.env
echo "APP_ENV=${APP_ENV:-production}" >> /var/www/html/.env
echo "APP_KEY=${APP_KEY}" >> /var/www/html/.env
echo "APP_DEBUG=${APP_DEBUG:-true}" >> /var/www/html/.env
echo "APP_URL=${APP_URL:-https://carvex-carparts.onrender.com}" >> /var/www/html/.env
echo "LOG_CHANNEL=stack" >> /var/www/html/.env
echo "DB_CONNECTION=${DB_CONNECTION:-pgsql}" >> /var/www/html/.env
echo "DB_HOST=${DB_HOST}" >> /var/www/html/.env
echo "DB_PORT=${DB_PORT:-5432}" >> /var/www/html/.env
echo "DB_DATABASE=${DB_DATABASE}" >> /var/www/html/.env
echo "DB_USERNAME=${DB_USERNAME}" >> /var/www/html/.env
echo "DB_PASSWORD=${DB_PASSWORD}" >> /var/www/html/.env
echo "CACHE_DRIVER=file" >> /var/www/html/.env
echo "SESSION_DRIVER=file" >> /var/www/html/.env
echo "QUEUE_CONNECTION=sync" >> /var/www/html/.env

# Run migrations
php artisan migrate --force || true

# Seed database
php artisan db:seed --force || true

# Start Apache
apache2-foreground
