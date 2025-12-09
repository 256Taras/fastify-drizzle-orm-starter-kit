.PHONY: test test-local test-ci test-deps-up test-deps-down

test:
	@echo "🧪 Running tests with coverage..."
	ENV_NAME=test npx c8 node --test

test-local:
	@echo "🐳 Starting test dependencies..."
	docker compose -f infra/docker/docker-compose.test.yml up -d db-test --remove-orphans
	@sleep 3
	@echo "📦 Running database migrations..."
	@ENV_NAME=test npm run database:push:test || true
	@echo "🧪 Running tests with coverage..."
	ENV_NAME=test npx c8 node --test
	@echo "✅ Done!"

test-ci:
	@echo "🐳 Running tests in Docker..."
	docker compose -f infra/docker/docker-compose.test.yml --profile ci up --abort-on-container-exit --build

test-deps-up:
	@echo "🐳 Starting test dependencies..."
	docker compose -f infra/docker/docker-compose.test.yml up -d db-test --remove-orphans
	@echo "✅ Test dependencies started!"

test-deps-down:
	@echo "🐳 Stopping test dependencies..."
	docker compose -f infra/docker/docker-compose.test.yml down -v --remove-orphans
	@echo "✅ Test dependencies stopped!"

