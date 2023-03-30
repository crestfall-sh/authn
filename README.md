# authn

Crestfall Authentication API

#### Requirements

- PostgreSQL at port 5432
- PostgREST at port 5433
- Redis at port 6379

#### Development

Publishing at GitHub Container Registry

1. Create your Personal Access Token with `write:packages` scope.

2. Log-in with your Docker.

```sh
export GHCR_ACCESS_TOKEN=XYZ
echo $GHCR_ACCESS_TOKEN | sudo docker login ghcr.io -u joshxyzhimself --password-stdin
```

3. Build your Docker image.

```sh
sudo docker build --tag=authn ./
```

4. Run your Docker Container (for testing)

```sh
# at ./dependencies/
sudo docker compose up
```

```sh
# at ./
sudo docker run --detach --network=host --name=authn authn
```

#### License

MIT