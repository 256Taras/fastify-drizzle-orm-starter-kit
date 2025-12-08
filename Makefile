.PHONY: test-local test-ci test-deps-up test-deps-down

# Локальна розробка (Node.js локально, БД в Docker)
test-local:
	@echo "🐳 Starting test dependencies..."
	docker compose -f infra/docker/docker-compose.test.yml up -d db-test --remove-orphans
	@sleep 3
	@echo "🧪 Running tests locally..."
	ENV_NAME=test node --test
	@echo "✅ Done!"

# CI/CD (все в Docker)
test-ci:
	@echo "🐳 Running tests in Docker..."
	docker compose -f infra/docker/docker-compose.test.yml --profile ci up --abort-on-container-exit --build

# Тільки підняти залежності (БД)
test-deps-up:
	@echo "🐳 Starting test dependencies..."
	docker compose -f infra/docker/docker-compose.test.yml up -d db-test --remove-orphans
	@echo "✅ Test dependencies started!"

# Зупинити і видалити залежності
test-deps-down:
	@echo "🐳 Stopping test dependencies..."
	docker compose -f infra/docker/docker-compose.test.yml down -v --remove-orphans
	@echo "✅ Test dependencies stopped!"

