FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

ENV DATABASE_URL="file:/data/dev.db"
RUN npm run db:generate && npm run build

ENV NODE_ENV="production"
ENV PORT="8080"

EXPOSE 8080

CMD ["sh", "scripts/start-fly.sh"]
