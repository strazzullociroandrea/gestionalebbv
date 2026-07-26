import {createCallerFactory, createTRPCRouter} from "@/server/api/trpc";
import {PublicRoutes} from "@/server/api/routers/public-route";

export const appRouter = createTRPCRouter({
    public: PublicRoutes
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);