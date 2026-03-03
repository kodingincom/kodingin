# ============ Build Stage ============
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ============ Production Stage ============
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled JavaScript from build stage
COPY --from=build /app/dist ./dist

# Copy drizzle config (needed if you ever run drizzle-kit externally)
COPY drizzle.config.ts ./

EXPOSE 4000

# On startup: create tables, seed admin, then start the production server
CMD sh -c "(node dist/migrate.js || true) && (node dist/seed.js || true) && node dist/index.js"
