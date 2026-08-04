import { createTRPCRouter, userProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Associate, Athlete } from "@/db/schema";
import { eq } from "drizzle-orm";

export const UserProcedure = createTRPCRouter({
    getAllAthletes: userProcedure
        .input(
            z.object({
                idUser: z.string().min(1, "Attenzione! L'id dell'utente non è valido."),
            })
        )
        .query(async ({ input, ctx }) => {
            const { idUser } = input;

            try {
                return await ctx.db
                    .select({
                        id: Athlete.id,
                        name: Athlete.name,
                        surname: Athlete.surname,
                    })
                    .from(Athlete)
                    .innerJoin(Associate, eq(Athlete.id, Associate.athleteId))
                    .where(eq(Associate.userId, idUser));
            } catch (error) {
                console.error("[GETALLATHLETE USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile recuperare gli atleti associati all'utente.",
                });
            }
        }),
});