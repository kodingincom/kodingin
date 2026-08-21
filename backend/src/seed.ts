import { auth } from './auth.js';

async function seedAdmin() {
    try {
        console.log("Attempting to seed admin user...");
        const email = process.env.ADMIN_INITIAL_EMAIL || "ophrynt@gmail.com";
        const password = process.env.ADMIN_INITIAL_PASSWORD || "kodinginmawon";

        // Using the programmatic server-side API to register a user
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "Admin"
            }
        });
        console.log("Success! Admin user seeded.");
    } catch (e: any) {
        console.log("Seed note (user may already exist):", e.message || e);
    }
}

seedAdmin();
