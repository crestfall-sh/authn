# authn

Crestfall Authentication API is an open-source authentication server that provides identity management for your apps.

This includes account sign-up, sign-in, verification, and recovery. It takes advantage of the best resources on recommended security practices so you don't have to worry about it.

- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Cryptographic Right Answers](https://latacora.micro.blog/2018/04/03/cryptographic-right-answers.html)
- [Password Authentication for Web and Mobile Apps](https://dchest.com/authbook/)

If you have any recommendations, improvements, or suggestions, please reach out on any channel available (Twitter, GitHub Issues, etc).

#### Getting Started

Crestfall Authentication API depends on PostgreSQL, PostgREST, and Redis.

The Docker Image Tag is: `ghcr.io/crestfall-sh/authn:latest`.

This [Docker Compose YAML File](./dependencies//docker-compose.yml) is provided as a reference for a docker-based setup.

This [Environment File Shell Script](./env.sh) is provided as a reference for creating a `.env` file.

Crestfall Authentication API requires the following environment variables:

- `PGRST_JWT_SECRET`: Your base64-encoded secret.
- `POSTGREST_HOST`: Defaults to `localhost`.
- `REDIS_HOST`: Defaults to `localhost`.

The Docker Compose YAML File shows how the environment variables are used.

To run the Docker Compose YAML File:

```sh
cd ./dependencies/
docker compose up --build --force-recreate
```

#### User Sign-up

This [Node.js Script](./index.test.mjs) shows an example usage of the API.

1. Your server sends the user's credentials to Crestfall Authentication API.

```
Request URL: /sign-up/email
Content-Type: application/json; charset=utf-8
```

```json
{
  "email": "alice@example.com",
  "password": "correcthorsebatterystaple"
}
```

2. Receive the user's `session` data, containing the `user` object, `access_token`, and `refresh_token` .

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

```json
{
  "session": {
    "user": {
      "id": "2415e4ae-657a-4b48-94b1-db6c63eae2b6",
      "email": "alice@example.com",
      "email_verification_code": null, // hidden
      "email_verified_at": null,
      "email_recovery_code": null, // hidden
      "email_recovered_at": null,
      "phone": null,
      "phone_verification_code": null, // hidden
      "phone_verified_at": null,
      "phone_recovery_code": null, // hidden
      "phone_recovered_at": null,
      "password_salt": null, // hidden
      "password_hash": null, // hidden
      "created_at": "2023-03-31T02:02:00.803038+00:00",
      "updated_at": "2023-03-31T02:02:00.803038+00:00",
      "metadata": null
    },
    "access_token": "eyJhbG...", // JSON Web Token (JWT)
    "refresh_token": "df2514..." // 256-bit Random String
  }
}
```

3. You may now use the `user` object, `access_token`, and `refresh_token` in your web app client or mobile app client.

#### API Documentation

TypeScript Documentation is available at https://crestfall-sh.github.io/authn/.

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