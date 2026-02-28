import { createAuthClient } from "better-auth/vue"
import { adminClient } from "better-auth/client/plugins"

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:4000'

export const authClient = createAuthClient({
    baseURL: API_BASE,
    plugins: [
        adminClient() // Note: the backend natively uses emailAndPassword: true which is built-in
    ]
})
