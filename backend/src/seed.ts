import { auth } from './auth';

async function seedAdmin() {
    try {
        console.log("Attempting to seed admin user...");
        // Using the programmatic server-side API to register a user
        const res = await auth.api.signUpEmail({
            body: {
                email: "ophrynt@gmail.com",
                password: "kodinginmawon",
                name: "Admin"
            }
        });
        console.log("Success! Admin user seeded.");
    } catch (e: any) {
        console.error("Seed failed (user might already exist):", e.message || e);
    }
}

seedAdmin();
