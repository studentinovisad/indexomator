FROM node:lts-slim AS base
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN corepack enable

FROM base AS build
RUN pnpm i --frozen-lockfile
COPY . .
# Ugly workaround some build bug that tries to connect to the DB while bundling
ENV STAGE build
RUN pnpm run build

FROM base AS deps
RUN pnpm i --frozen-lockfile --prod

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS final
WORKDIR /app
COPY --from=base /app/package.json .
COPY --from=base /app/pnpm-lock.yaml .
COPY --from=build /app/build .
COPY --from=deps /app/node_modules ./node_modules
COPY drizzle ./drizzle
# Hardcode the migrations path
ENV MIGRATIONS_PATH ./drizzle
EXPOSE 3000
CMD ["./index.js"]
