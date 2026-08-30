FROM node:24.20.0-alpine3.24 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://isd.local/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM caddy:2.11.4-alpine AS runtime

RUN setcap -r /usr/bin/caddy \
    && addgroup -S portal \
    && adduser -S -G portal portal \
    && chown -R portal:portal /srv

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=portal:portal /app/dist /srv

USER portal

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1:8080/healthz || exit 1
