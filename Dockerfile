# syntax=docker/dockerfile:1

# --- Build stage -----------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# The project uses pnpm (see pnpm-lock.yaml); enable it via corepack.
RUN corepack enable

# Install dependencies first to leverage Docker layer caching.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the static site into /app/dist (also renders the OG images).
COPY . .
RUN pnpm run build

# --- Runtime stage ---------------------------------------------------------
FROM nginx:alpine AS runtime

# Host-based routing: nmrp.dev → landing, docs.nmrp.dev → docs.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Serve the generated static files.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
