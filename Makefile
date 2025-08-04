.PHONY: help up down start stop restart logs shell-backend shell-frontend shell-db clean build dev install

# Default target
help:
	@echo "SentiBlog Development Commands:"
	@echo "  make up          - Start all services with docker-compose"
	@echo "  make down        - Stop all services"
	@echo "  make start       - Start stopped services"
	@echo "  make stop        - Stop running services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs from all services"
	@echo "  make shell-backend - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"
	@echo "  make shell-db    - Open PostgreSQL shell"
	@echo "  make clean       - Remove containers and volumes"
	@echo "  make build       - Build all Docker images"
	@echo "  make dev         - Start development environment"
	@echo "  make install     - Install dependencies locally"

# Docker commands
up:
	docker-compose up -d
	@echo "Services started! Access the app at:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:3001"
	@echo "  pgAdmin:  http://localhost:5050"

down:
	docker-compose down

start:
	docker-compose start

stop:
	docker-compose stop

restart:
	docker-compose restart

logs:
	docker-compose logs -f

# Shell access
shell-backend:
	docker exec -it sentiblog-backend sh

shell-frontend:
	docker exec -it sentiblog-frontend sh

shell-db:
	docker exec -it sentiblog-postgres psql -U sentiblog -d sentiblog_dev

# Development
build:
	docker-compose build

clean:
	docker-compose down -v
	rm -rf backend/node_modules frontend/node_modules

dev: up logs

# Local installation (without Docker)
install:
	cd backend && npm install
	cd frontend && npm install
	cp .env.example .env
	@echo "Dependencies installed! Don't forget to update .env with your API keys."