"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// This script creates all database tables if they don't exist.
// It runs before the server starts, ensuring the schema is ready.
async function migrate() {
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kodingin';
    console.log('🔄 Running database migrations...');
    console.log('📡 Connecting to:', connectionString.replace(/:[^:@]+@/, ':***@')); // log URL with hidden password
    const pool = new pg_1.Pool({ connectionString });
    try {
        // Test connection first
        await pool.query('SELECT 1');
        console.log('✅ Database connection successful!');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "categories" (
                "id" SERIAL PRIMARY KEY,
                "name" TEXT NOT NULL,
                "slug" TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS "posts" (
                "id" SERIAL PRIMARY KEY,
                "title" TEXT NOT NULL,
                "slug" TEXT NOT NULL UNIQUE,
                "content" TEXT NOT NULL,
                "image_url" TEXT,
                "category_id" INTEGER NOT NULL REFERENCES "categories"("id"),
                "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS "user" (
                "id" TEXT PRIMARY KEY,
                "name" TEXT NOT NULL,
                "email" TEXT NOT NULL UNIQUE,
                "emailVerified" BOOLEAN NOT NULL,
                "image" TEXT,
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "session" (
                "id" TEXT PRIMARY KEY,
                "expiresAt" TIMESTAMP NOT NULL,
                "token" TEXT NOT NULL UNIQUE,
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                "ipAddress" TEXT,
                "userAgent" TEXT,
                "userId" TEXT NOT NULL REFERENCES "user"("id")
            );

            CREATE TABLE IF NOT EXISTS "account" (
                "id" TEXT PRIMARY KEY,
                "accountId" TEXT NOT NULL,
                "providerId" TEXT NOT NULL,
                "userId" TEXT NOT NULL REFERENCES "user"("id"),
                "accessToken" TEXT,
                "refreshToken" TEXT,
                "idToken" TEXT,
                "accessTokenExpiresAt" TIMESTAMP,
                "refreshTokenExpiresAt" TIMESTAMP,
                "scope" TEXT,
                "password" TEXT,
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "verification" (
                "id" TEXT PRIMARY KEY,
                "identifier" TEXT NOT NULL,
                "value" TEXT NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP,
                "updatedAt" TIMESTAMP
            );
        `);
        console.log('✅ All tables created/verified successfully!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        // Don't exit — let the server try to start anyway
    }
    finally {
        await pool.end();
    }
}
migrate();
//# sourceMappingURL=migrate.js.map