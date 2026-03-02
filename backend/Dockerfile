FROM node:20

WORKDIR /app

# Copy application files
COPY package*.json ./
RUN npm install

COPY . .

# Generate drizzle sqlite db script?
# RUN npx drizzle-kit generate:sqlite

EXPOSE 4000

CMD ["npm", "run", "dev"]
