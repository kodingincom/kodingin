import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
    trustedOrigins: ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    database: drizzleAdapter(db, {
        provider: "sqlite",
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
