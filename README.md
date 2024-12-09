# indexomator

Simple webapp to mark students and employees entry and exit times. Made by students, for students. Built in SvelteKit + Postgres (with fuzzystrmatch extention).

## Development

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

To start the app (with database migrations):

```bash
pnpm run dev
```

This will start the server on: `http://localhost:5173`.

## Production

Just use the `docker-compose.prod.yaml`:

```bash
docker compose -f docker-compose.prod.yaml up -d
```

or:

```bash
podman-compose -f docker-compose.prod.yaml up -d
```
