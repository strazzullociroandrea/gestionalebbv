import {fetchRequestHandler} from "@trpc/server/adapters/fetch";
import {appRouter} from "@/server/api/root";
import {createTRPCContext} from "@/server/api/trpc";
import {getRequestContext} from "@cloudflare/next-on-pages";

export const runtime = "edge";

const handler = async (req: Request) => {
    const {env} = getRequestContext() as unknown as { env: any };

    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: () => createTRPCContext({
            headers: req.headers,
            env: env,
        }),
    });
};

export {handler as GET, handler as POST};