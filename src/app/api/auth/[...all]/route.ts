import { getRequestContext } from "@cloudflare/next-on-pages";
import { auth } from "@/lib/auth";
import { CloudflareSchemas } from "@/lib/schemas/cloudflare-schemas";

const handleRequest = async (request: Request) => {
    try {
        const { env } = getRequestContext() as unknown as { env: CloudflareSchemas };
        const authInstance = auth(env);

        console.log(`[AUTH DEBUG] Richiesta: ${request.method} ${new URL(request.url).pathname}`);

        const response = await authInstance.handler(request);

        if (response.status !== 200) {
            const body = await response.clone().text();
            console.error(`[AUTH ERROR] Status: ${response.status} | Body: ${body}`);
        }

        return response;
    } catch (error) {
        console.error("[AUTH CRITICAL FAILURE]", error);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: String(error) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const GET = handleRequest;
export const POST = handleRequest;