"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./auth");
async function seedAdmin() {
    try {
        console.log("Attempting to seed admin user...");
        // Using the programmatic server-side API to register a user
        const res = await auth_1.auth.api.signUpEmail({
            body: {
                email: "ophrynt@gmail.com",
                password: "kodinginmawon",
                name: "Admin"
            }
        });
        console.log("Success! Admin user seeded.");
    }
    catch (e) {
        console.error("Seed failed (user might already exist):", e.message || e);
    }
}
seedAdmin();
//# sourceMappingURL=seed.js.map