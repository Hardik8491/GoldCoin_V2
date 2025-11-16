# Deployment Guide

## Overview

This guide covers deploying GoldCoin to production environments.

## Prerequisites

- Docker and Docker Compose
- PostgreSQL 14+
- Redis 7+
- SSL certificates for HTTPS
- Domain name (for production)

## Environment Configuration

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Backend (.env)

```
DATABASE_URL=postgresql://user:pass@host:5432/goldcoin_db
SECRET_KEY=your-production-secret-key
REDIS_URL=redis://host:6379
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://yourdomain.com
```

## Docker Deployment

### Build Images

```bash
# Build frontend
docker build -t finance-web -f docker/Dockerfile.frontend ./apps/web

# Build backend
docker build -t finance-api -f docker/Dockerfile.backend ./apps/api

# Build Celery worker
docker build -t finance-celery -f docker/Dockerfile.celery ./apps/api
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Vercel Deployment (Frontend)

### Install Vercel CLI

```bash
npm i -g vercel
```

### Deploy

```bash
cd apps/web
vercel
```

### Environment Variables

Add in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`

## Backend Deployment Options

### Option 1: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd apps/api
railway up
```

### Option 2: Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Option 3: AWS/DigitalOcean

```bash
# Using gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app

# With systemd service
sudo systemctl enable finance-api
sudo systemctl start finance-api
```

## Database Setup

### Create Production Database

```bash
# PostgreSQL
createdb finance_db_prod

# Run migrations
cd apps/api
psql finance_db_prod < migrations/001_init_schema.sql
psql finance_db_prod < migrations/002_add_indexes.sql
```

### Database Backups

```bash
# Backup
pg_dump goldcoin_db_prod > backup_$(date +%Y%m%d).sql

# Restore
psql goldcoin_db_prod < backup_20250115.sql
```

## SSL/HTTPS Setup

### Using Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx config
sudo nano /etc/nginx/sites-available/finance-app
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring

### Health Checks

```bash
# Frontend
curl https://yourdomain.com

# Backend
curl https://api.yourdomain.com/health
```

### Logging

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# View specific service
docker logs <container_id>
```

## Performance Optimization

### Frontend

1. Enable Next.js image optimization
2. Use static generation where possible
3. Implement code splitting
4. Enable CDN for static assets

### Backend

1. Enable database connection pooling
2. Add Redis caching for frequently accessed data
3. Use database indexes
4. Enable gzip compression

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables properly secured
- [ ] Database credentials rotated
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using ORM)
- [ ] XSS protection enabled
- [ ] Security headers configured

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
      
  frontend:
    deploy:
      replicas: 2
```

### Load Balancing

Use Nginx or cloud load balancers to distribute traffic across multiple instances.

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -h host -U user -d finance_db_prod

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Application Errors

```bash
# Check backend logs
docker logs finance-api

# Check Celery worker
docker logs finance-celery

# Check frontend build
npm run build
```

### Performance Issues

- Monitor database query performance
- Check Redis connection
- Review application logs for bottlenecks
- Use profiling tools to identify slow endpoints

## Rollback Procedure

```bash
# Stop current deployment
docker-compose down

# Restore database backup
psql goldcoin_db_prod < backup_previous.sql

# Deploy previous version
git checkout <previous-commit>
docker-compose up -d
```

## Support

For deployment issues:
- Check logs first
- Review environment variables
- Verify network connectivity
- Consult documentation at `/docs`
