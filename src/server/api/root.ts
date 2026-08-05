import {createCallerFactory, createTRPCRouter} from "@/server/api/trpc";
import {PublicRoutes} from "@/server/api/routers/public-route";
import {AdministrativeRoute} from "@/server/api/routers/administrative-route";
import {UserProcedure} from "@/server/api/routers/user-route";

export const appRouter = createTRPCRouter({
    public: PublicRoutes,
    administrative: AdministrativeRoute,
    user: UserProcedure
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);