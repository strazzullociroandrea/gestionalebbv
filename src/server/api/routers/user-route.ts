import {createTRPCRouter, userProcedure} from "@/server/api/trpc";
import {z} from "zod";
import {TRPCError} from "@trpc/server";
import {Associate, Athlete} from "@/db/schema";
import {and, eq} from "drizzle-orm";

export const UserProcedure = createTRPCRouter({
    getAllAthletes: userProcedure
        .input(
            z.object({
                idUser: z.string().min(1, "Attenzione! L'id dell'utente non è valido."),
            })
        )
        .query(async ({input, ctx}) => {
            const {idUser} = input;

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

    getAthleteInfo: userProcedure
        .input(
            z.object({
                idUser: z.string().min(1, "Attenzione! L'id dell'utente non è valido."),
                idAthlete: z.string().min(1, "Attenzione! L'id dell'atleta non è valido."),
            })
        )
        .query(async ({input, ctx}) => {
            const {idUser, idAthlete} = input;

            try {
                const result = await ctx.db
                    .select({
                        athlete: Athlete,
                        associate: Associate,
                    })
                    .from(Athlete)
                    .innerJoin(Associate, eq(Athlete.id, Associate.athleteId))
                    .where(
                        and(
                            eq(Athlete.id, idAthlete),
                            eq(Associate.userId, idUser)
                        )
                    )
                    .limit(1);

                const athleteInfo = result[0].athlete;

                if (!athleteInfo) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Atleta non trovato o non associato a questo utente.",
                    });
                }

                return athleteInfo;
            } catch (error) {
                console.error("[GETATHLETEINFO USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile recuperare le informazioni sull'atleta.",
                });
            }
        }),
    updateAthlete: userProcedure
        .input(
            z.object({
                idUser: z.string().min(1, "Attenzione! L'id dell'utente non è valido."),
                idAthlete: z.string().min(1, "Attenzione! L'id dell'atleta non è valido."),
                name: z.string().optional(),
                surname: z.string().optional(),
                dateOfBirth: z.string().optional().nullable(),
                expirationMedicalCertificate: z.string().optional().nullable(),
                homeAddress: z.string().optional().nullable(),
                nin: z.string().optional().nullable(),
                birthPlace: z.string().optional().nullable(),
                countryBirthPlace: z.string().optional().nullable(),
            })
        )
        .mutation(async ({input, ctx}) => {
            const {
                idUser,
                idAthlete,
                name,
                surname,
                dateOfBirth,
                expirationMedicalCertificate,
                homeAddress,
                nin,
                birthPlace,
                countryBirthPlace,
            } = input;

            try {
                const association = await ctx.db
                    .select({athleteId: Associate.athleteId})
                    .from(Associate)
                    .where(
                        and(
                            eq(Associate.athleteId, idAthlete),
                            eq(Associate.userId, idUser)
                        )
                    )
                    .limit(1);

                if (!association.length) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Non hai i permessi per modificare questo atleta o non è associato al tuo utente.",
                    });
                }

                const updatePayload: Record<string, any> = {};

                if (name !== undefined) updatePayload.name = name;
                if (surname !== undefined) updatePayload.surname = surname;
                if (dateOfBirth !== undefined) {
                    updatePayload.dateOfBirth = dateOfBirth ? new Date(dateOfBirth).toISOString() : null;
                }
                if (expirationMedicalCertificate !== undefined) {
                    updatePayload.expirationMedicalCertificate = expirationMedicalCertificate
                        ? new Date(expirationMedicalCertificate).toISOString()
                        : null;
                }
                if (homeAddress !== undefined) updatePayload.homeAddress = homeAddress;
                if (nin !== undefined) updatePayload.nin = nin;
                if (birthPlace !== undefined) updatePayload.birthPlace = birthPlace;
                if (countryBirthPlace !== undefined) updatePayload.countryBirthPlace = countryBirthPlace;

                const result = await ctx.db
                    .update(Athlete)
                    .set(updatePayload)
                    .where(eq(Athlete.id, idAthlete))
                    .returning();


                if (result.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Impossibile aggiornare l'atleta specificato.",
                    });
                }

                return result[0];

            } catch (error) {
                console.error("[UPDATEATHLETE USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile aggiornare le informazioni sull'atleta.",
                });
            }
        }),
});