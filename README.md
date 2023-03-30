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