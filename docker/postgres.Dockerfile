FROM postgres:15
COPY init-extensions.sql /docker-entrypoint-initdb.d/
