FROM node:lts-slim AS base
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm@9

FROM base AS build
RUN pnpm i --frozen-lockfile
COPY . .
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
