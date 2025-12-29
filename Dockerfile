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
# Tạo Apache VirtualHost config cho Laravel
RUN echo '<VirtualHost *:80>\n\
    ServerName moonbay.onrender.com\n\
    DocumentRoot /var/www/html/public\n\
    \n\
    <Directory /var/www/html/public>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    \n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf
# Cài đặt gói PHP với memory limit cao hơn
ENV COMPOSER_MEMORY_LIMIT=-1
RUN composer install --no-dev --optimize-autoloader --verbose
# Phân quyền
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port
EXPOSE 80

# Start services (migrations + cache + apache)
CMD php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear && \
    php artisan cache:clear && \
    php artisan migrate --force && \
    apache2-foreground