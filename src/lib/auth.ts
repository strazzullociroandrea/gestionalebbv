import {betterAuth} from "better-auth";
import {Kysely} from "kysely";
import {D1Dialect} from "kysely-d1";
import {CloudflareSchemas} from "@/lib/schemas/cloudflare-schemas";
import {D1Database} from "@cloudflare/workers-types";
import {customSession, emailOTP} from "better-auth/plugins";
import {headers} from "next/headers";
import {getRequestContext} from "@cloudflare/next-on-pages";

const getAuthInstance = (env: CloudflareSchemas) => {
    const databaseBinding = (env as any).gestionale_bbv;

    return betterAuth({
        database: {
            db: new Kysely({
                dialect: new D1Dialect({
                    database: databaseBinding as D1Database,
                }),
            }),
            type: "sqlite",
            generateId: false,
        },
        advanced: {
            ipAddress: {
                ipAddressHeaders: ["CF-Connecting-IP"],
            },
        },
        secret: env.BETTER_AUTH_SECRET,
        baseURL: env.BETTER_AUTH_URL,
        emailAndPassword: {
            enabled: true,
            autoSignIn: true,
        },
        user: {
            additionalFields: {
                role: {
                    type: "string",
                    required: false,
                    defaultValue: "user",
                },
                surname: {
                    type: "string",
                    required: false,
                    defaultValue: "",
                },
            },
        },
        basePath: "/api/auth",
        plugins: [
            emailOTP({
                disableSignUp: true,
                async sendVerificationOTP({email, otp}) {
                    console.log(`[DEBUG] OTP per ${email}: ${otp}`);
                },
            }),
            customSession(async ({user, session}) => {
                return {
                    session,
                    user: {
                        ...user,
                        role: (user as any).role ?? "user",
                    },
                };
            }),
        ],
    });
};

export const auth = (env: CloudflareSchemas) => getAuthInstance(env);

export const getServerSession = async () => {
    const {env} = getRequestContext() as unknown as { env: CloudflareSchemas };
    const authInstance = getAuthInstance(env);
    return authInstance.api.getSession({
        headers: await headers(),
    });
};