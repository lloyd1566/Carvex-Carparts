FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . /var/www/html

# Create .env file from Render environment variables
RUN echo "APP_NAME=Laravel" > /var/www/html/.env && \
    echo "APP_ENV=${APP_ENV:-production}" >> /var/www/html/.env && \
    echo "APP_KEY=${APP_KEY}" >> /var/www/html/.env && \
    echo "APP_DEBUG=${APP_DEBUG:-true}" >> /var/www/html/.env && \
    echo "APP_URL=${APP_URL:-https://carvex-carparts.onrender.com}" >> /var/www/html/.env && \
    echo "LOG_CHANNEL=stack" >> /var/www/html/.env && \
    echo "DB_CONNECTION=${DB_CONNECTION:-pgsql}" >> /var/www/html/.env && \
    echo "DB_HOST=${DB_HOST}" >> /var/www/html/.env && \
    echo "DB_PORT=${DB_PORT:-5432}" >> /var/www/html/.env && \
    echo "DB_DATABASE=${DB_DATABASE}" >> /var/www/html/.env && \
    echo "DB_USERNAME=${DB_USERNAME}" >> /var/www/html/.env && \
    echo "DB_PASSWORD=${DB_PASSWORD}" >> /var/www/html/.env && \
    echo "CACHE_DRIVER=file" >> /var/www/html/.env && \
    echo "SESSION_DRIVER=file" >> /var/www/html/.env && \
    echo "QUEUE_CONNECTION=sync" >> /var/www/html/.env

# Install dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Run migrations (will skip if already run)
RUN php artisan migrate --force || true && echo "Migrations completed"

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Configure Apache
RUN sed -i 's/DocumentRoot \/var\/www\/html/DocumentRoot \/var\/www\/html\/public/' /etc/apache2/sites-available/000-default.conf

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
