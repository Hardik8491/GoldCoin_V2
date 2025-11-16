# Restore database from backup
#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./scripts/restore.sh <backup_file>"
    exit 1
fi

BACKUP_FILE="$1"

set -a
source .env
set +a

echo "[$(date)] Starting database restore from $BACKUP_FILE..."

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
else
    docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    echo "[$(date)] Database restore completed successfully"
else
    echo "[$(date)] ERROR: Restore failed!"
    exit 1
fi
