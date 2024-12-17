install:
	pnpm i --frozen-lockfile
prod-start:
	docker compose -f docker-compose.prod.yml up -d
prod-stop:
	docker compose -f docker-compose.prod.yml down
prod-logs:
	docker compose -f docker-compose.prod.yml logs
prod-update:
	docker compose -f docker-compose.prod.yml up -d --build