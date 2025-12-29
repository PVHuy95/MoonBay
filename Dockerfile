FROM php:8.3-apache

# 1. Cài đặt thư viện hệ thống
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql

# 2. Thiết lập thư mục làm việc (Giúp các lệnh sau gọn hơn)
WORKDIR /var/www/html

# 3. Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. TỐI ƯU CACHE:
# giúp Docker không phải cài lại thư viện
COPY composer.json composer.lock ./

# 5. Cài đặt thư viện (Chạy trước khi copy source code)
ENV COMPOSER_MEMORY_LIMIT=-1
RUN composer install --no-dev --optimize-autoloader --no-scripts --prefer-dist

# 6. Copy toàn bộ source code còn lại vào container
COPY . .

# 7. Cấu hình Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# 8. Bật rewrite module và cấu hình VirtualHost
RUN a2enmod rewrite

# tạo VirtualHost
RUN echo '<VirtualHost *:80>\n\
    ServerName moonbay.onrender.com\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# 9. Phân quyền
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 10. Expose port
EXPOSE 80

# 11. Script khởi động
CMD php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear && \
    php artisan cache:clear && \
    php artisan migrate --force && \
    apache2-foreground