# FROM php:8.3-apache

# # Cài đặt thư viện cần thiết cho Laravel
# RUN apt-get update && apt-get install -y \
#     libpq-dev \
#     unzip \
#     && docker-php-ext-install pdo pdo_pgsql

# # Cài đặt Composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# # Copy code vào container
# COPY . /var/www/html

# # Cấu hình Apache
# ENV APACHE_DOCUMENT_ROOT /var/www/html/public
# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
# RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# # Bật rewrite module
# RUN a2enmod rewrite

# # Cho phép .htaccess override (QUAN TRỌNG!)
# RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# # Cài đặt gói PHP
# RUN composer install --no-dev --optimize-autoloader

# # Phân quyền
# RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# # Copy entrypoint script
# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# # Expose port
# EXPOSE 80

# # Use entrypoint script
# ENTRYPOINT ["docker-entrypoint.sh"]
FROM php:8.3-apache

# Cài đặt thư viện cần thiết cho Laravel
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy code vào container
COPY . /var/www/html

# Cấu hình Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Bật rewrite module
RUN a2enmod rewrite

# Cho phép .htaccess override
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Cài đặt gói PHP
RUN composer install --no-dev --optimize-autoloader

# Phân quyền
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port
EXPOSE 80

# Start services (migrations + cache + apache)
CMD sleep 5 && \
    php artisan migrate --force && \
    php artisan route:cache && \
    php artisan config:cache && \
    php artisan view:cache && \
    apache2-foreground