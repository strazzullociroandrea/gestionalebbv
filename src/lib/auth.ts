import {betterAuth} from "better-auth";
import {Kysely} from "kysely";
import {D1Dialect} from "kysely-d1";
import {CloudflareSchemas} from "@/lib/schemas/cloudflare-schemas";
import {D1Database} from "@cloudflare/workers-types";
import {customSession, emailOTP} from "better-auth/plugins";
import {headers} from "next/headers";
import {getRequestContext} from "@cloudflare/next-on-pages";
import {i18n} from "@better-auth/i18n";

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
            i18n({
                defaultLocale: "it",
                detection: ["cookie", "header"],
                localeCookie: "locale",
                translations: {
                    it: {
                        USER_NOT_FOUND: "Utente non trovato",
                        INVALID_PASSWORD: "Password non valida",
                        INVALID_EMAIL: "Email non valida",
                        USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Attenzione: l'utente esiste già, utilizza un'altra email",
                        INVALID_OTP: "OTP non valido",
                        OTP_EXPIRED: "OTP scaduto",
                        OTP_ALREADY_USED: "OTP già utilizzato",
                        INVALID_SESSION: "Sessione non valida",
                        SESSION_EXPIRED: "Sessione scaduta",
                    },
                },
            })
        ],
    });
};

export const auth = (env: CloudflareSchemas) => getAuthInstance(env);

export const getServerSession = async () => {
    const {env} = getRequestContext() as unknown as { env: CloudflareSchemas };
    const authInstance = getAuthInstance(env);

    const h = new Headers(await headers());
    h.set("Accept-Language", "it-IT,it;q=0.9");

    return authInstance.api.getSession({
        headers: h,
    });
};