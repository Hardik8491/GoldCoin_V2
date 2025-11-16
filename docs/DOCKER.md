# Docker Setup Guide

## Overview

The application uses Docker for containerization and Docker Compose for orchestration.

## Prerequisites

- Docker Desktop 24.0+
- Docker Compose 2.0+
- 4GB available RAM

## Docker Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │
│   (Next.js)     │     │   (FastAPI)     │
│   Port: 3000    │     │   Port: 8000    │
└─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │   Port: 5432    │
                        └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │     Redis       │
                        │   Port: 6379    │
                        └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │  Celery Worker  │
                        └─────────────────┘
```

## Quick Start

### Start All Services

```bash
docker-compose up -d
```

### Stop All Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Individual Services

### Frontend Container

```bash
# Build
docker build -t finance-web -f docker/Dockerfile.frontend ./apps/web

# Run
docker run -p 3000:3000 finance-web

# With environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  finance-web
```

### Backend Container

```bash
# Build
docker build -t finance-api -f docker/Dockerfile.backend ./apps/api

# Run
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host/db \
  -e SECRET_KEY=secret \
  finance-api
```

### Database Container

```bash
# Run PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=goldcoin_db \
  -p 5432:5432 \
  postgres:15-alpine

# Access database
docker exec -it postgres psql -U postgres -d goldcoin_db
```

### Redis Container

```bash
# Run Redis
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Check Redis
docker exec -it redis redis-cli ping
```

## Docker Compose Configuration

### Development (docker-compose.yml)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: goldcoin_db
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./apps/api
      dockerfile: ../../docker/Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres/finance_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./apps/web
      dockerfile: ../../docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on:
      - backend

  celery:
    build:
      context: ./apps/api
      dockerfile: ../../docker/Dockerfile.celery
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres/finance_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

## Useful Commands

### Container Management

```bash
# List running containers
docker ps

# Stop specific container
docker stop <container_id>

# Remove container
docker rm <container_id>

# Remove all stopped containers
docker container prune
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi <image_id>

# Remove unused images
docker image prune
```

### Volume Management

```bash
# List volumes
docker volume ls

# Remove volume
docker volume rm <volume_name>

# Remove unused volumes
docker volume prune
```

### Logs and Debugging

```bash
# Follow logs
docker logs -f <container_name>

# Last 100 lines
docker logs --tail 100 <container_name>

# Execute command in container
docker exec -it <container_name> /bin/sh

# Inspect container
docker inspect <container_name>
```

## Database Operations

### Run Migrations

```bash
docker-compose exec backend python -m alembic upgrade head
```

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres goldcoin_db > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres goldcoin_db
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs <container_name>

# Check if port is already in use
lsof -i :3000
lsof -i :8000

# Restart container
docker restart <container_name>
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec postgres pg_isready

# Check environment variables
docker exec backend env | grep DATABASE_URL
```

### Out of Disk Space

```bash
# Remove unused resources
docker system prune -a

# Check disk usage
docker system df
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

## Production Considerations

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

### Health Checks

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Logging

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Security

- Never commit `.env` files with secrets
- Use Docker secrets for sensitive data
- Regularly update base images
- Scan images for vulnerabilities: `docker scan <image_name>`
- Use non-root users in containers
- Limit container capabilities

## Performance Tips

- Use multi-stage builds to reduce image size
- Layer caching for faster builds
- Use `.dockerignore` to exclude unnecessary files
- Mount volumes for development hot-reload
- Use BuildKit for parallel builds

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
