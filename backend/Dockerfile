FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN chmod -R +x node_modules/.bin/
COPY . .

EXPOSE 4000

# On startup: create tables, seed admin, then ALWAYS start the server
# The "|| true" ensures migration/seed failures don't block the server
CMD sh -c "(npx tsx src/migrate.ts || true) && (npx tsx src/seed.ts || true) && npm run start"
