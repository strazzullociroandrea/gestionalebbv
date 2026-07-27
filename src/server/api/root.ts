import {createCallerFactory, createTRPCRouter} from "@/server/api/trpc";
import {PublicRoutes} from "@/server/api/routers/public-route";
import {AdministrativeRoute} from "@/server/api/routers/administrative-route";

export const appRouter = createTRPCRouter({
    public: PublicRoutes,
    administrative: AdministrativeRoute
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);