# Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

3. **Set Environment Variables in Vercel**
   Go to your Vercel project settings > Environment Variables and add:
   
   ```
   APP_NAME=Carvex-Carparts
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-app.vercel.app
   APP_KEY=your-generated-app-key
   
   DB_CONNECTION=pgsql
   DB_HOST=your-neon-host.neon.tech
   DB_PORT=5432
   DB_DATABASE=neondb
   DB_USERNAME=your-neon-username
   DB_PASSWORD=your-neon-password
   
   CACHE_DRIVER=file
   SESSION_DRIVER=file
   QUEUE_CONNECTION=sync
   ```

4. **Generate APP_KEY**
   ```bash
   php artisan key:generate
   ```
   Copy the generated key and add it to Vercel environment variables.

## Neon Database Setup

### Prerequisites
- Neon account (https://neon.tech)

### Steps

1. **Create a Neon Project**
   - Go to https://neon.tech
   - Sign up and create a new project
   - Choose PostgreSQL as the database

2. **Get Connection Details**
   - Go to your Neon project dashboard
   - Copy the connection string or individual connection details:
     - Host
     - Port (usually 5432)
     - Database name
     - Username
     - Password

3. **Update Environment Variables**
   Add the Neon connection details to your `.env` file locally and Vercel environment variables:
   ```
   DB_CONNECTION=pgsql
   DB_HOST=your-neon-host.neon.tech
   DB_PORT=5432
   DB_DATABASE=neondb
   DB_USERNAME=your-neon-username
   DB_PASSWORD=your-neon-password
   ```

4. **Run Migrations**
   After setting up the database connection, run migrations to create tables:
   ```bash
   php artisan migrate
   ```

5. **Seed Database (Optional)**
   ```bash
   php artisan db:seed
   ```

## Production Considerations

### SSL Mode
Neon requires SSL connections. The `vercel.json` and `config/database.php` are already configured with `sslmode: require`.

### Database URL
Alternatively, you can use the DATABASE_URL environment variable with the full connection string:
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### Storage
For file storage in production, consider using:
- AWS S3
- Cloudflare R2
- Or configure Vercel's storage options

## Troubleshooting

### Database Connection Issues
- Verify your Neon credentials are correct
- Check that SSL is enabled in the connection
- Ensure your IP is whitelisted in Neon (if applicable)

### Build Errors
- Ensure all PHP extensions are available in Vercel
- Check that composer dependencies are properly installed
- Verify environment variables are set correctly

## Additional Resources
- [Vercel PHP Documentation](https://vercel.com/docs/concepts/functions/overview)
- [Neon Documentation](https://neon.tech/docs)
- [Laravel Deployment](https://laravel.com/docs/deployment)
