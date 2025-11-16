#!/bin/bash

# Start Celery worker
celery -A celery_tasks worker --loglevel=info

# Start Celery beat (scheduler)
# celery -A celery_tasks beat --loglevel=info
