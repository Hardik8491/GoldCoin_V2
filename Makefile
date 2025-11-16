.PHONY: help setup start stop logs clean build test deploy backup restore health monitor lint format security-check scale-workers

help:
	@echo "GoldCoin - Available Commands"
	@echo ""
	@echo "  make setup       - Initial setup (creates .env, builds containers)"
	@echo "  make start       - Start all services"
	@echo "  make stop        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View container logs"
	@echo "  make build       - Build Docker images"
	@echo "  make test        - Run all tests"
	@echo "  make test-backend - Run backend tests"
	@echo "  make test-frontend - Run frontend tests"
	@echo "  make clean       - Remove containers and volumes"
	@echo "  make shell-backend - Open Python shell in backend"
	@echo "  make migrate     - Run database migrations"
	@echo "  make backup      - Backup database"
	@echo "  make restore     - Restore database from backup"
	@echo "  make health      - Check service health"
	@echo "  make monitor     - Enable monitoring"
	@echo "  make lint        - Lint backend code"
	@echo "  make format      - Format backend code"
	@echo "  make security-check - Perform security checks"
	@echo "  make scale-workers - Scale the number of workers"
	@echo ""

setup:
	@bash scripts/setup.sh

start:
	@bash scripts/start.sh

stop:
	@bash scripts/stop.sh

restart: stop start

logs:
	docker-compose logs -f

build:
	docker-compose build

test: test-backend test-frontend

test-backend:
	docker-compose exec backend pytest backend/tests -v

test-frontend:
	docker-compose exec frontend pnpm test

clean:
	docker-compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

shell-backend:
	docker-compose exec backend python

migrate:
	docker-compose exec -T postgres psql -U ${POSTGRES_USER:-finance_user} -d ${POSTGRES_DB:-goldcoin} -f /docker-entrypoint-initdb.d/001_init_schema.sql

ps:
	docker-compose ps

push:
	git add .
	git commit -m "Add Docker configuration and deployment files"
	git push origin main

backup:
	@bash scripts/backup.sh

restore:
	@read -p "Enter backup file path: " backup_file; \
	bash scripts/restore.sh $$backup_file

health:
	@bash scripts/health-check.sh

monitor:
	@docker-compose exec backend python -c "from prometheus_metrics import *; print('Metrics enabled')"

lint:
	@docker-compose exec backend flake8 . --max-line-length=100

format:
	@docker-compose exec backend black . --line-length=100

security-check:
	@docker-compose exec backend bandit -r .
	@docker-compose exec backend safety check

scale-workers:
	@read -p "Enter number of workers: " workers; \
	docker-compose up -d --scale celery_worker=$$workers

deploy:
	@echo "Deploying to production..."
	docker-compose -f docker-compose.prod.yml build
	docker-compose -f docker-compose.prod.yml up -d
	docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head
