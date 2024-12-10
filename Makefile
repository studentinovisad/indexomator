prod-start:
	docker compose -f docker-compose.prod.yaml up -d
prod-stop:
	docker compose -f docker-compose.prod.yaml down
prod-logs:
	docker compose -f docker-compose.prod.yaml logs
