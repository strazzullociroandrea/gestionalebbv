import {administrativeProcedure, createTRPCRouter} from "@/server/api/trpc";
import {z} from "zod";
import {SportSeason} from "@/db/schema"
import {eq} from "drizzle-orm";
import {TRPCError} from "@trpc/server";

export const AdministrativeRoute = createTRPCRouter({
    getSeason: administrativeProcedure.input(z.void())
        .query(async ({ctx}) => {
            try {

                return await ctx.db.select().from(SportSeason).orderBy(SportSeason.status)
            } catch (e) {
                console.error("[GET-SEASON API ERROR] ", e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare la stagione attiva",
                });
            }
        }),

    addSeason: administrativeProcedure
        .input(
            z.object({
                seasonName: z.string().min(1, "Il nome della stagione è obbligatorio"),
                newFee: z.number().positive("Il costo deve essere maggiore di zero"),
                renewalFee: z.number().positive("Il costo deve essere maggiore di zero"),
            })
        )
        .mutation(async ({ctx, input}) => {
            try {
                const existingSeason = await ctx.db
                    .select()
                    .from(SportSeason)
                    .where(eq(SportSeason.season, input.seasonName))
                    .limit(1);

                if (existingSeason.length > 0) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Attenzione! La stagione inserita esiste già. Inserisci un nome diverso.",
                    });
                }

                await ctx.db.update(SportSeason)
                    .set({status: "inactive"})
                    .where(eq(SportSeason.status, "active"));

                const [newSeason] = await ctx.db.insert(SportSeason).values({
                    id: crypto.randomUUID(),
                    season: input.seasonName,
                    newFee: input.newFee.toString(),
                    renewalFee: input.renewalFee.toString(),
                    status: "active"
                }).returning();

                return {
                    success: true,
                    data: newSeason,
                };

            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }

                console.log("[ADD-SEASON API ERROR] ", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile procedere con la creazione della stagione",
                });
            }
        }),
});