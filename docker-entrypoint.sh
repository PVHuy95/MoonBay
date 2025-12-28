#!/bin/bash

echo "=== MoonBay Docker Entrypoint ==="

# Chờ database sẵn sàng
echo "Waiting for database connection..."
sleep 3

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Clear old caches
echo "Clearing old caches..."
php artisan route:clear
php artisan config:clear
php artisan view:clear

# Cache for production
echo "Caching routes and config for production..."
php artisan route:cache
php artisan config:cache
php artisan view:cache

echo "=== Starting Apache ==="
# Start Apache foreground
apache2-foreground