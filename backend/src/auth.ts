import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";

const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
    trustedOrigins: [
        'https://kodingin.com',
        'https://www.kodingin.com',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:4000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080',
        ...configuredOrigins
    ],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification
        }
    }),
    emailAndPassword: {
        enabled: true,
    }
});
