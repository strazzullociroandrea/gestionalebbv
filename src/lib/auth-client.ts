import {createAuthClient} from "better-auth/react";

export const authClient = createAuthClient({
    baseURL:
        typeof window !== "undefined"
            ? window.location.origin
            : process.env.BETTER_AUTH_URL || "http://localhost:3000",
    additionalFields: {
        surname: {
            type: "string",
        },
        role: {
            type: "string",
        }
    }
});