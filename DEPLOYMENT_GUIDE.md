# Django Deployment Guide

This guide will help you deploy your Django application online. We'll cover multiple deployment platforms.

## Prerequisites

1. **Git Repository**: Ensure your code is in a Git repository (GitHub, GitLab, or Bitbucket)
2. **Database**: You'll need a MySQL database (can be provided by the platform or external)
3. **Environment Variables**: Prepare all necessary environment variables

## Required Environment Variables

Create these environment variables in your deployment platform:

```
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=3306
CELERY_BROKER_URL=redis://your-redis-url:6379/0
CELERY_RESULT_BACKEND=redis://your-redis-url:6379/0
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@ierms.denr.gov.ph
```

## Option 1: Railway (Recommended - Easiest)

Railway is one of the easiest platforms for deploying Django applications.

### Steps:

1. **Sign up** at [railway.app](https://railway.app)

2. **Create a New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add MySQL Database**:
   - Click "New" → "Database" → "Add MySQL"
   - Railway will automatically create a MySQL database
   - Note the connection details

4. **Add Redis** (for Celery):
   - Click "New" → "Database" → "Add Redis"
   - Note the Redis URL

5. **Configure Environment Variables**:
   - Go to your service → "Variables"
   - Add all the environment variables listed above
   - Use the database credentials from step 3
   - Use the Redis URL from step 4

6. **Deploy**:
   - Railway will automatically detect the Procfile
   - It will install dependencies from `server/requirements.txt`
   - Your app will be deployed automatically

7. **Run Migrations**:
   - Go to your service → "Deployments" → "View Logs"
   - Click on the deployment → "Run Command"
   - Run: `cd server && python manage.py migrate`
   - Create superuser: `cd server && python manage.py createsuperuser`

8. **Collect Static Files**:
   - Run: `cd server && python manage.py collectstatic --noinput`

### Railway Configuration:

Railway will automatically:
- Detect Python from `runtime.txt`
- Use `Procfile` for process types
- Install dependencies from `server/requirements.txt`

## Option 2: Render

Render is another excellent platform with a free tier.

### Steps:

1. **Sign up** at [render.com](https://render.com)

2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Build Settings**:
   - **Build Command**: `cd server && pip install -r requirements.txt && cd .. && npm install && npm run build`
   - **Start Command**: `cd server && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
   - **Environment**: Python 3

4. **Add PostgreSQL/MySQL Database**:
   - Click "New +" → "PostgreSQL" (or MySQL if available)
   - Note the connection details

5. **Add Redis**:
   - Click "New +" → "Redis"
   - Note the Redis URL

6. **Configure Environment Variables**:
   - Go to "Environment" tab
   - Add all required environment variables

7. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy your app

8. **Run Migrations**:
   - Go to "Shell" tab
   - Run: `cd server && python manage.py migrate`
   - Create superuser: `cd server && python manage.py createsuperuser`

## Option 3: DigitalOcean App Platform

### Steps:

1. **Sign up** at [digitalocean.com](https://www.digitalocean.com)

2. **Create App**:
   - Go to App Platform
   - Click "Create App"
   - Connect your GitHub repository

3. **Configure App**:
   - **Type**: Web Service
   - **Build Command**: `cd server && pip install -r requirements.txt && cd .. && npm install && npm run build`
   - **Run Command**: `cd server && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
   - **Environment Variables**: Add all required variables

4. **Add Database**:
   - Add MySQL database component
   - Configure connection

5. **Deploy**:
   - Click "Create Resources"
   - DigitalOcean will deploy your app

## Option 4: Heroku

### Steps:

1. **Install Heroku CLI**: [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   heroku create your-app-name
   ```

4. **Add MySQL Database**:
   ```bash
   heroku addons:create cleardb:ignite
   ```

5. **Add Redis**:
   ```bash
   heroku addons:create heroku-redis:hobby-dev
   ```

6. **Set Environment Variables**:
   ```bash
   heroku config:set DJANGO_SECRET_KEY=your-secret-key
   heroku config:set DEBUG=False
   heroku config:set ALLOWED_HOSTS=your-app-name.herokuapp.com
   # ... add all other variables
   ```

7. **Deploy**:
   ```bash
   git push heroku main
   ```

8. **Run Migrations**:
   ```bash
   heroku run python server/manage.py migrate
   heroku run python server/manage.py createsuperuser
   ```

## Post-Deployment Steps

### 1. Update CORS Settings

After deployment, update `server/core/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",  # Your frontend URL
    "http://localhost:5173",  # Keep for local development
]
```

### 2. Update Frontend API Configuration

Update `src/config/api.js` to point to your deployed backend URL.

### 3. Set Up Static Files

The `whitenoise` package is included in requirements.txt to serve static files. Ensure `STATIC_ROOT` is set correctly in settings.py.

### 4. Set Up Media Files

For production, consider using:
- **AWS S3** for media file storage
- **Cloudinary** for image storage
- **DigitalOcean Spaces** for object storage

### 5. SSL/HTTPS

Most platforms provide SSL certificates automatically. Ensure your `ALLOWED_HOSTS` includes your domain.

### 6. Monitoring

Consider setting up:
- **Sentry** for error tracking
- **New Relic** for performance monitoring
- Platform-specific monitoring tools

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**:
   - Verify database credentials
   - Check if database is accessible from the platform
   - Ensure `DB_HOST` includes port if needed

2. **Static Files Not Loading**:
   - Run `python manage.py collectstatic --noinput`
   - Verify `STATIC_ROOT` and `STATIC_URL` settings
   - Check `whitenoise` middleware is enabled

3. **CORS Errors**:
   - Update `CORS_ALLOWED_ORIGINS` with your frontend URL
   - Verify frontend is making requests to correct backend URL

4. **Celery Not Working**:
   - Verify Redis connection URL
   - Check if worker process is running
   - Review Celery logs

## Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Use strong `DJANGO_SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` correctly
- [ ] Use HTTPS only
- [ ] Secure database credentials
- [ ] Enable CORS only for trusted origins
- [ ] Set up proper logging
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts

## Recommended: Railway

For this project, **Railway** is recommended because:
- ✅ Easy setup and configuration
- ✅ Automatic deployments from Git
- ✅ Built-in MySQL and Redis support
- ✅ Free tier available
- ✅ Simple environment variable management
- ✅ Automatic SSL certificates
- ✅ Good documentation

## Next Steps

1. Choose a deployment platform
2. Set up your database and Redis
3. Configure environment variables
4. Deploy your application
5. Run migrations and create superuser
6. Update frontend to point to new backend URL
7. Test all functionality
8. Set up monitoring and backups

Good luck with your deployment! 🚀

