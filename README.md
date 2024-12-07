# indexomator

## Prerequisites

Install dependencies:

```bash
pnpm i --frozen-lockfile
```

You also need docker (with compose plugin) or podman (with podman-compose) to start up the Postgres database:

```bash
docker compose up -d
```

or:

```bash
podman-compose up -d
```

## Development

To run migrations on the database and seed it with test data:

```bash
pnpm run dev
```

This will start the server on: `http://localhost:5173`. You can use `admin` for both username and password to login.
