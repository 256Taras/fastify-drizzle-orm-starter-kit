#!/bin/bash

# Script to generate test HTTP requests for metrics collection
# Usage: ./test-metrics.sh

BASE_URL="http://localhost:8000"

echo "Generating test requests to create metrics..."

# Health check
echo "1. Health check..."
curl -s "$BASE_URL/api/health" > /dev/null

# API documentation
echo "2. API docs..."
curl -s "$BASE_URL/docs" > /dev/null

# Users endpoint (may require auth, but will generate metrics)
echo "3. Users list..."
curl -s "$BASE_URL/v1/users" > /dev/null

# Metrics endpoint itself
echo "4. Metrics endpoint..."
curl -s "$BASE_URL/api/metrics" > /dev/null

# Make a few more requests
for i in {1..5}; do
  echo "5.$i. Additional requests..."
  curl -s "$BASE_URL/api/healthcheck" > /dev/null
  sleep 0.5
done

echo ""
echo "Done! Check Grafana dashboard or Prometheus:"
echo "  - Grafana: http://localhost:3000"
echo "  - Prometheus: http://localhost:9090/graph?g0.expr=http_request_duration_seconds_count"
