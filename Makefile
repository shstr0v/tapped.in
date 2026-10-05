.DEFAULT_GOAL := help
COMPOSE ?= docker compose

.PHONY: help env up up-d down logs build rebuild ps config migrate revision \
        server-up server-down mobile-up mobile-down mobile-logs \
        test test-server test-root test-mobile mobile-check clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

env: ## Create server/.env and mobile/.env from the examples (never overwrites)
	@test -f server/.env || (cp server/.env.example server/.env && echo "created server/.env - edit the secrets")
	@test -f mobile/.env || (cp mobile/.env.example mobile/.env && echo "created mobile/.env")

# ---- whole stack (db + redis + backend + worker + scheduler + mobile) ----
up: ## Build and start everything in the foreground
	$(COMPOSE) up --build

up-d: ## Build and start everything in the background
	$(COMPOSE) up --build -d

down: ## Stop and remove containers (keeps the database volume)
	$(COMPOSE) down

logs: ## Follow logs of all services (make logs s=backend for one)
	$(COMPOSE) logs -f --tail=100 $(s)

build: ## Build all images
	$(COMPOSE) build

rebuild: ## Rebuild images and renew anonymous volumes (use after changing mobile dependencies)
	$(COMPOSE) up --build -V

ps: ## Show service status
	$(COMPOSE) ps

config: ## Validate the merged compose config (quiet: `docker compose config` would print secrets from server/.env)
	@$(COMPOSE) config -q && echo "compose config: OK"

migrate: ## Apply Alembic migrations in the running backend container
	$(COMPOSE) exec backend alembic upgrade head

revision: ## Autogenerate a migration: make revision m="add something"
	$(COMPOSE) exec backend alembic revision --autogenerate -m "$(m)"

# ---- parts ----
server-up: ## Start only db + redis + backend + worker + scheduler
	$(COMPOSE) up --build postgresql redis backend worker scheduler

server-down: ## Stop the backend part
	$(COMPOSE) stop backend worker scheduler postgresql redis

mobile-up: ## Start only the Expo dev server (Metro) in Docker
	$(COMPOSE) up --build --no-deps mobile

mobile-down: ## Stop the Expo dev server
	$(COMPOSE) stop mobile

mobile-logs: ## Follow Expo logs
	$(COMPOSE) logs -f mobile

# ---- tests ----
test: test-server test-root test-mobile ## Run all test suites

test-server: ## Server unit tests (host, via uv)
	cd server && uv run --extra test pytest tests -q

test-root: ## Root tests (unit + e2e; e2e needs E2E_BASE_URL, e.g. http://localhost:8000)
	cd server && uv run --extra test pytest ../tests -q

test-mobile: ## Mobile jest tests
	cd mobile && npm run test --silent

mobile-check: ## Mobile typecheck + lint
	cd mobile && npm run typecheck && npm run lint

clean: ## Stop everything and DELETE volumes (database data is lost)
	$(COMPOSE) down -v
