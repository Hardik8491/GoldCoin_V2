# Troubleshooting Guide

## Common Issues and Solutions

### Development Environment

#### Port Already in Use

**Problem**: Cannot start server, port 3000 or 8000 already in use.

**Solution**:
```bash
# Find process using port
lsof -i :3000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

#### Module Not Found

**Problem**: Import errors or module not found.

**Solution**:
```bash
# Frontend
cd apps/web
rm -rf node_modules package-lock.json
npm install

# Backend
cd apps/api
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### TypeScript Errors

**Problem**: Type errors or path aliases not working.

**Solution**:
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"

# Verify tsconfig.json paths are correct
cat tsconfig.json | grep paths
```

### Database Issues

#### Connection Refused

**Problem**: Cannot connect to PostgreSQL database.

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS
brew services start postgresql@14
# Linux
sudo systemctl start postgresql

# Verify credentials in .env file
cat apps/api/.env | grep DATABASE_URL
```

#### Migration Errors

**Problem**: Database schema mismatch.

**Solution**:
```bash
# Drop and recreate database (WARNING: loses data)
dropdb goldcoin_db
createdb goldcoin_db

# Rerun migrations
cd apps/api
psql goldcoin_db < migrations/001_init_schema.sql
psql goldcoin_db < migrations/002_add_indexes.sql
```

#### Permission Denied

**Problem**: Cannot access database tables.

**Solution**:
```bash
# Grant permissions
psql goldcoin_db
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### Backend Issues

#### Import Errors (Python)

**Problem**: ModuleNotFoundError or ImportError.

**Solution**:
```bash
# Verify virtual environment is activated
which python  # Should point to venv/bin/python

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check Python path
python -c "import sys; print(sys.path)"
```

#### SQLAlchemy Errors

**Problem**: Database model or session errors.

**Solution**:
```bash
# Verify DATABASE_URL format
# Should be: postgresql://user:pass@host:port/dbname

# Test connection
python -c "from app.db.session import engine; print(engine.connect())"

# Check if tables exist
psql goldcoin_db -c "\dt"
```

#### JWT Authentication Issues

**Problem**: Token invalid or expired.

**Solution**:
```bash
# Verify SECRET_KEY is set
echo $SECRET_KEY

# Check token expiration in config
cat apps/api/app/core/config.py | grep EXPIRE

# Clear browser cookies and localStorage
# Login again to get new token
```

### Frontend Issues

#### API Calls Failing

**Problem**: Network errors or 401/403 responses.

**Solution**:
```typescript
# Verify API URL is correct
console.log(process.env.NEXT_PUBLIC_API_URL);

# Check if backend is running
curl http://localhost:8000/health

# Verify authentication token
// Open browser devtools -> Application -> LocalStorage
// Check for 'auth_token'
```

#### Styling Not Applied

**Problem**: Tailwind classes not working.

**Solution**:
```bash
# Restart dev server
npm run dev

# Rebuild Tailwind
npx tailwindcss -i ./app/globals.css -o ./dist/output.css

# Check tailwind.config.ts content paths
cat tailwind.config.ts | grep content
```

#### Build Errors

**Problem**: Production build fails.

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Remove type errors
npm run build 2>&1 | grep error

# Fix TypeScript strict mode issues
# Edit tsconfig.json: "strict": false (temporary)
```

### Docker Issues

#### Container Won't Start

**Problem**: Docker container exits immediately.

**Solution**:
```bash
# Check logs
docker logs <container_id>

# Inspect container
docker inspect <container_id>

# Rebuild image
docker-compose up -d --build
```

#### Cannot Connect to Database from Container

**Problem**: Backend can't reach PostgreSQL.

**Solution**:
```bash
# Use service name instead of localhost
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/goldcoin_db

# Verify network
docker network ls
docker network inspect <network_name>

# Check if containers are on same network
docker ps --format "{{.Names}} {{.Networks}}"
```

#### Volume Permission Errors

**Problem**: Permission denied when accessing volumes.

**Solution**:
```bash
# Fix permissions
sudo chown -R $USER:$USER ./apps

# Or use named volumes instead of bind mounts
```

### Celery Issues

#### Worker Not Processing Tasks

**Problem**: Celery tasks stuck in queue.

**Solution**:
```bash
# Check if worker is running
ps aux | grep celery

# Check Redis connection
redis-cli ping

# Restart Celery worker
pkill celery
cd apps/api
celery -A app.celery_app worker --loglevel=info
```

#### Task Timeout

**Problem**: Tasks taking too long or timing out.

**Solution**:
```python
# Increase timeout in task decorator
@celery_app.task(time_limit=300)  # 5 minutes
def long_running_task():
    pass
```

### Performance Issues

#### Slow Page Load

**Problem**: Frontend takes too long to load.

**Solution**:
- Enable Next.js production mode
- Use React.memo for expensive components
- Implement code splitting
- Enable image optimization
- Check network tab for slow API calls

#### Slow API Responses

**Problem**: Backend endpoints are slow.

**Solution**:
```bash
# Add database indexes
psql goldcoin_db < migrations/002_add_indexes.sql

# Enable query logging
# Edit apps/api/app/core/config.py
# Set SQLALCHEMY_ECHO = True

# Use database connection pooling
# Check SQLAlchemy pool settings
```

#### High Memory Usage

**Problem**: Application consuming too much RAM.

**Solution**:
```bash
# Monitor memory
docker stats

# Limit container memory
docker-compose.yml:
  services:
    backend:
      mem_limit: 1g
```

### Authentication Issues

#### Login Not Working

**Problem**: Unable to log in or register.

**Solution**:
```bash
# Check backend logs
docker logs finance-api

# Verify user in database
psql goldcoin_db -c "SELECT * FROM users;"

# Test login endpoint directly
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

#### Session Expires Too Quickly

**Problem**: User logged out too frequently.

**Solution**:
```python
# Increase token expiration
# apps/api/app/core/config.py
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours
```

### Production Issues

#### 502 Bad Gateway

**Problem**: Nginx can't reach backend.

**Solution**:
```bash
# Check if backend is running
curl http://localhost:8000/health

# Verify Nginx configuration
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

#### CORS Errors

**Problem**: Cross-origin requests blocked.

**Solution**:
```python
# Update ALLOWED_ORIGINS in backend config
ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "http://localhost:3000",
]
```

#### SSL Certificate Issues

**Problem**: HTTPS not working or certificate errors.

**Solution**:
```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate expiry
openssl x509 -in cert.pem -noout -dates

# Test SSL
curl -vI https://yourdomain.com
```

## Getting Help

If you're still experiencing issues:

1. Check the logs (application, database, server)
2. Search GitHub issues
3. Review the documentation in `/docs`
4. Create a new issue with:
   - Environment details (OS, versions)
   - Steps to reproduce
   - Error messages
   - Relevant logs

## Useful Debugging Commands

```bash
# Check all service statuses
docker-compose ps

# View all logs
docker-compose logs -f

# Check disk space
df -h

# Check memory usage
free -m

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Test API
curl http://localhost:8000/health

# Check environment variables
env | grep -E "DATABASE|API|SECRET"
```
