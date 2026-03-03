FROM node:20

WORKDIR /app

# Copy application files
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

# On startup: create tables if needed, seed admin user, then start the server
CMD sh -c "npx tsx src/migrate.ts && npx tsx src/seed.ts && npm run start"
