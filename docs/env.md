# Configuration Settings for Starter Kit Application

This documentation outlines the environment variables and configuration settings for the Starter Kit application. These settings control various aspects of the application's behavior in development and production environments.

## Application Configurations

- `APPLICATION_NAME`: The name of the application. Default is `starter-kit`.
- `APPLICATION_URL`: The base URL of the application. Default is `http://localhost:8000`.
- `APPLICATION_DOMAIN`: The domain under which the application is accessible. Default is `http://localhost:8000`.
- `ENV_NAME`: The environment name, e.g., `development`.
- `NODE_ENV`: Node.js environment setting. Default is `test`.
- `VERSION`: The version of the application. Default is `latest`.
- `IP`: IP configuration for the server accessibility. Use `127.0.0.1` for local access, `0.0.0.0` for external access.
- `HTTP_PORT`: The HTTP port the application listens on. Default is `8000`.
- `SHUTDOWN_TIMEOUT`: Time in milliseconds before shutdown (e.g., `3000` for 3 seconds).
- `REQUEST_TIMEOUT`: Maximum request time in milliseconds (e.g., `6000` for 6 seconds).

## Logging

- `LOG_LEVEL`: The level of logging (e.g., `debug`).
- `ENABLE_PRETTY_LOG`: Set to `1` to enable pretty logging.
- `ENABLE_COLORIZED_LOG`: Set to `1` to enable color in logs.
- `ENABLE_DB_LOGGING`: Set to `1` to enable database-related logs.
- `ENABLE_REQUEST_LOGGING`: Set to `1` to log incoming requests.
- `ENABLE_RESPONSE_LOGGING_BODY`: Set to `1` to log response bodies.
- `ENABLE_DEVELOPER_MESSAGE`: Set to `1` to enable developer-specific messages.
- `ENABLE_PERSISTENCE_FORCE_LOGGING`: Set to `1` to persist logs forcefully.
- `ENABLE_DEBUG`: Set to `1` to enable debug mode.

## Rate Limiting

- `RATE_LIMIT_MAX`: The maximum number of requests from a single IP in the window period. Default is `10`.
- `RATE_LIMIT_TIME_WINDOW`: The time window for rate limit in milliseconds. Default is `60000` (1 minute).

## Database

- `DATABASE_URL`: The URL connection string for the PostgreSQL database.
- `ENABLE_SEEDS`: Set to `1` to enable database seeding.

## Security

- `JWT_REFRESH_TOKEN_SECRET`: Secret key for JWT refresh tokens.
- `JWT_REFRESH_TOKEN_EXPIRATION_TIME`: Expiration time for JWT refresh tokens. Default is `30d`.
- `JWT_ACCESS_TOKEN_SECRET`: Secret key for JWT access tokens.
- `JWT_ACCESS_TOKEN_EXPIRATION_TIME`: Expiration time for JWT access tokens. Default is `15m`.

## Docker Compose

- `COMPOSE_PROJECT_NAME`: The name of the Docker Compose project for this deployment. Default is `development_deployment`.
- `PGADMIN_DEFAULT_EMAIL`: Default email address for PgAdmin.
- `PGADMIN_DEFAULT_PASSWORD`: Default password for PgAdmin.

## Timezone

- `TZ`: The timezone setting for the application. Default is `UTC+0`.

Please ensure you configure these variables appropriately based on your development and production requirements.
