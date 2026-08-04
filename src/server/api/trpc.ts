import {initTRPC, TRPCError} from "@trpc/server";
import superjson from "superjson";
import {ZodError} from "zod";
import {auth} from "@/lib/auth";
import {CloudflareSchemas} from "@/lib/schemas/cloudflare-schemas";
import {getDb} from "@/db";

export const createTRPCContext = async (opts: { headers: Headers; env: CloudflareSchemas }) => {
    const authHandler = auth(opts.env);
    const db = getDb(opts.env.gestionale_bbv);
    const session = await authHandler.api.getSession({
        headers: opts.headers
    });

    const isAdmin = !!session?.user;
    const userId = session?.user?.id || null;

    return {
        headers: opts.headers,
        env: opts.env,
        isAdmin,
        db,
        userId,
        session
    };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({shape, error}) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

const isAdminMiddleware = t.middleware(({ctx, next}) => {
    if (ctx.session?.user.role !== "admin") {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Accesso non autorizzato. Devi essere un admin.",
        });
    }
    return next({
        ctx: {
            ...ctx,
            isAdmin: true,
        },
    });
});

const isAdministrativeMiddleware = t.middleware(({ctx, next}) => {
    if (ctx.session?.user.role !== "administrative") {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Accesso non autorizzato. Devi essere un membro segreteria.",
        });
    }
    return next({
        ctx: {
            ...ctx,
            isAdmin: true,
        },
    });
});

const isUserMiddleware = t.middleware(({ctx, next}) => {
    if (ctx.session?.user.role !== "user") {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Accesso non autorizzato. Devi essere un utente registrato.",
        });
    }
    return next({
        ctx: {
            ...ctx,
            isAdmin: true,
        },
    });
});


export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
export const administrativeProcedure = t.procedure.use(isAdministrativeMiddleware);
export const userProcedure = t.procedure.use(isUserMiddleware);
export const adminProcedure = t.procedure.use(isAdminMiddleware);