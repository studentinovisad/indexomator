# indexomator

Simple webapp to mark students and employees entry and exit times. Made by students, for students. Built in SvelteKit + Postgres (with fuzzystrmatch extention).

## Prerequisites

The following programs are needed to develop this project:

- `node`
- `pnpm`
- `docker` / `podman`
- `docker compose` / `podman-compose`
- `make` (optional)

Setup enviroment variables (adjust as needed):

```bash
cp .env.example .env
```

## Development

Install dependencies:

```bash
pnpm i --frozen-lockfile
```

or:

```bash
make install
```

You also need docker (with compose plugin) or podman (with podman-compose) to start up the Postgres database:

```bash
docker compose up -d
```

or:

```bash
podman-compose up -d
```

To start the app (with database migrations):

```bash
pnpm run dev
```

This will start the server on: `http://localhost:5173`.

## Production

Just use the [`docker-compose.prod.yml`](docker-compose.prod.yml):

```bash
make prod-start
```

or:

```bash
docker compose -f docker-compose.prod.yml up -d
```

or:

```bash
podman-compose -f docker-compose.prod.yml up -d
```

### Updating

In order to update you production deployment, first run:

```bash
git pull
```

And after that rebuild the images:

```bash
make prod-update
```

or:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## First steps

After deploying the project, either for development or production, visit `/admin` path and in the sidebar create at least 1 building, at least 1 department and at least 1 user. Afterwards, by going to the homepage you will be able to log in using the created user credentials. For all of the admin actions you must pass the secret set via the environment variable `SECRET`.
