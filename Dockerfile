FROM php:8.2-fpm

# Install dependencies untuk Laravel dan pustaka yang diperlukan untuk mbstring
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    git \
    libicu-dev \
    libxml2-dev \
    libonig-dev \
    libpq-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install gd pdo pdo_pgsql zip mbstring

# Salin composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Set working directory
WORKDIR /var/www

COPY . .

# Jalankan perintah composer install dengan user appuser
RUN composer install --optimize-autoloader

RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

# Expose port 9000 (default PHP-FPM port)
EXPOSE 9000

CMD chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache && php-fpm
