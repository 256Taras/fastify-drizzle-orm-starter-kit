# Blackbox install

## Blackbox requirements

- Docker v18+
- Docker Compose v1.23+

## Docker installation

- Full instruction:
  https://docs.docker.com/desktop/mac/install/
- TLDR:
  Download and install from https://desktop.docker.com/mac/main/amd64/Docker.dmg?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-mac-amd64

## Docker-compose installation

- On Mac docker compose should be installed with Docker Desktop
- Full instruction on all platforms:
  https://docs.docker.com/compose/install/

### TLDR for Linux:

- sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/
- sudo chmod +x /usr/local/bin/docker-compose
- docker-compose --version

## Blackbox startup

- in /configs create file ".env" as a copy of .env.example. Read all comments and decide what options should be picked.
- sudo systemctl start docker
- sudo docker-compose -f ./infra/docker/docker-compose.yml -f ./infra/docker/docker-compose.dev.yml up --build
