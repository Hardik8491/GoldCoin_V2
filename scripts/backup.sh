#!/bin/bash

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Get database credentials from .env
set -a
source .env
set +a

echo "[$(date)] Starting database backup..."

# Create backup
docker-compose exec -T postgres pg_dump \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    -h localhost \
    --format=plain > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup completed: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_FILE
    echo "[$(date)] Backup compressed"
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
    echo "[$(date)] Old backups cleaned up"
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi

# Optional: Upload to S3
if [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "[$(date)] Uploading to S3..."
    aws s3 cp "$BACKUP_FILE.gz" "s3://$S3_BUCKET/backups/" --sse AES256
fi

echo "[$(date)] Backup process completed successfully"
