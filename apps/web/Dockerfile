FROM oven/bun:1.3.10 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bunfig.toml turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
RUN bun install --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN bun run --cwd apps/web build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app .
EXPOSE 4000
CMD ["bun", "run", "--cwd", "apps/web", "start"]
