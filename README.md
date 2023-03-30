# authn

Crestfall Authentication API

#### Requirements

- PostgreSQL at port 5432
- PostgREST at port 5433
- Redis at port 6379

#### Docker Compose Usage

Docker Image tag is `ghcr.io/crestfall-sh/authn:latest`.

```yml

# docker-compose.yml
# This Docker Compose YAML file shows an example usage of authn server.
# The network "crestfall-network" is used to give it access to PostgREST and Redis.
#
# sudo docker compose up --build --force-recreate
#

version: '3.8'

services:

  postgresql:
    image: postgres:latest
    restart: "no"
    ports:
      - 5432:5432
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: ${POSTGRES_USER:?error}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?error}
      POSTGRES_HOST: localhost
      POSTGRES_PORT: 5432
    volumes:
      - ./postgresql/entrypoint:/docker-entrypoint-initdb.d
      - ./volumes/postgresql/data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready --username=postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - crestfall-network

  postgrest:
    image: postgrest/postgrest:latest
    restart: "no"
    ports:
      - 5433:5433
    environment:
      PGRST_DB_ANON_ROLE: anon
      PGRST_DB_SCHEMAS: ${PGRST_DB_SCHEMAS:?error}
      PGRST_DB_EXTRA_SEARCH_PATH: ${PGRST_DB_EXTRA_SEARCH_PATH:?error}
      PGRST_DB_URI: postgresql://${POSTGRES_USER:?error}:${POSTGRES_PASSWORD:?error}@postgresql:5432/postgres
      PGRST_SERVER_PORT: 5433
      PGRST_JWT_SECRET: ${PGRST_JWT_SECRET:?error}
      PGRST_JWT_SECRET_IS_BASE64: ${PGRST_JWT_SECRET_IS_BASE64:?error}
      PGRST_JWT_AUD: crestfall
      PGRST_LOG_LEVEL: warn
    depends_on:
      postgresql:
        condition: service_healthy
    networks:
      - crestfall-network

  redis:
    image: redis:latest
    restart: "no"
    ports:
      - 6379:6379
    environment:
      REDIS_PORT: 6379
    volumes:
      - ./volumes/redis/data:/data
    command: redis-server --save 60 1 --loglevel warning
    depends_on:
      postgresql:
        condition: service_healthy
    networks:
      - crestfall-network
  
  authn:
    image: ghcr.io/crestfall-sh/authn:latest
    restart: "no"
    ports:
      - 8080:8080
    environment:
      PGRST_JWT_SECRET: ${PGRST_JWT_SECRET:?error}
      POSTGREST_HOST: "postgrest"
      REDIS_HOST: "redis"
    depends_on:
      postgresql:
        condition: service_healthy
    networks:
      - crestfall-network

networks:
  crestfall-network:

```

#### API Documentation

To do.

#### Development

Publishing at GitHub Container Registry

1. Create your Personal Access Token with `write:packages` scope.

2. Log-in with your Docker.

```sh
export GHCR_ACCESS_TOKEN=XYZ
echo $GHCR_ACCESS_TOKEN | sudo docker login ghcr.io -u joshxyzhimself --password-stdin
```

3. Build your Docker Image.

```sh
sudo docker build --tag=ghcr.io/crestfall-sh/authn ./
```

4. Run your Docker Container (for testing)

```sh
# at ./dependencies/
sudo docker compose up
```

```sh
# at ./
sudo docker run --detach --network=host --name=authn --env PGRST_JWT_SECRET=4JLbS4XURTDIxQI6/2Rdw5pEkDuRxwjRZ6h0hsRxuIk= ghcr.io/crestfall-sh/authn
sudo docker kill authn
sudo docker rm authn
```

5. Push your Docker Image to GitHub Container Registry.

```sh
sudo docker push ghcr.io/crestfall-sh/authn:latest
```

5. Check your Docker Image in GitHub Container Registry.

- https://github.com/orgs/crestfall-sh/packages

#### License

MIT