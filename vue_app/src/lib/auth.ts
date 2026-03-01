import { createAuthClient } from "better-auth/vue"
import { adminClient } from "better-auth/client/plugins"

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = rawApiUrl ? rawApiUrl.replace(/\/api\/?$/, '') : (import.meta.env.DEV ? 'http://localhost:4000' : '');

export const authClient = createAuthClient({
    baseURL: API_BASE,
    plugins: [
        adminClient() // Note: the backend natively uses emailAndPassword: true which is built-in
    ]
})
