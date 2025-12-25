install:
	pnpm i --frozen-lockfile

prod-start:
	docker compose -f docker-compose.yml up -d
prod-stop:
	docker compose -f docker-compose.yml down
prod-logs:
	docker compose -f docker-compose.yml logs
prod-update:
	docker compose -f docker-compose.yml up -d --build

dev-start:
	docker compose -f docker-compose.dev.yml up -d
dev-stop:
	docker compose -f docker-compose.dev.yml down
dev-logs:
	docker compose -f docker-compose.dev.yml logs
dev-update:
	docker compose -f docker-compose.dev.yml up -d --build