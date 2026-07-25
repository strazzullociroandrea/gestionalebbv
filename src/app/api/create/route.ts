import {getRequestContext} from "@cloudflare/next-on-pages";
import {auth} from "@/lib/auth";
import {CloudflareSchemas} from "@/lib/schemas/cloudflare-schemas";
import {NextResponse} from "next/server";

export const runtime = "edge";

export async function createTemporaryUserWithAuth() {
    const {env} = getRequestContext() as unknown as { env: CloudflareSchemas };
    const authInstance = auth(env);

    try {
        const newUser = await authInstance.api.signUpEmail({
            body: {
                email: "ciroandreastrazzullo06@gmail.com",
                password: "prova123",
                name: `Ciro Andrea`,
                surname: 'Strazzullo',

                role: "user",
            } as any,
        });

        return NextResponse.json({success: true, data: newUser});
    } catch (error) {
        console.error("[BETTER-AUTH TEMP USER ERROR]", error);
        return NextResponse.json({success: false, error: String(error)});
    }
}

export const GET = createTemporaryUserWithAuth;
