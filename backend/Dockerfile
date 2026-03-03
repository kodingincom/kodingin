FROM node:20

WORKDIR /app

# Copy application files
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

# On startup: push DB schema, seed admin user, then start the server
CMD sh -c "npx drizzle-kit push && npx tsx src/seed.ts && npm run start"
