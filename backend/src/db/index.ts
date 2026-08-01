import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import dns from 'dns';

try {
    dns.setDefaultResultOrder('ipv6first');
} catch (e) {}

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kodingin';
const isRemote = connectionString.includes('supabase') || process.env.NODE_ENV === 'production';

const pool = new Pool({
    connectionString,
    ...(isRemote && { ssl: { rejectUnauthorized: false } })
});

export const db = drizzle(pool, { schema });
