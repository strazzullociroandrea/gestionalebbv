import {createTRPCRouter, userProcedure} from "@/server/api/trpc";
import {z} from "zod";
import {TRPCError} from "@trpc/server";
import {Associate, Athlete, Team, IsIn, SportSeason, User, Notification} from "@/db/schema";
import {and, eq, notInArray, inArray} from "drizzle-orm";

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
                expirationMedicalCertificate: z.string(),
                homeAddress: z.string().optional().nullable(),
                nin: z.string().optional().nullable(),
                birthPlace: z.string().optional().nullable(),
                countryBirthPlace: z.string().optional().nullable(),
                ci: z.string().optional().nullable(),
                expiredCI: z.string().optional().nullable()
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
                ci,
                expiredCI
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

                if (name !== undefined) updatePayload.name = name.toUpperCase();
                if (surname !== undefined) updatePayload.surname = surname.toUpperCase();
                if (dateOfBirth !== undefined) {
                    updatePayload.dateOfBirth = dateOfBirth ? new Date(dateOfBirth).toISOString() : null;
                }
                if (expirationMedicalCertificate !== undefined) {
                    updatePayload.expirationMedicalCertificate = expirationMedicalCertificate
                        ? new Date(expirationMedicalCertificate).toISOString()
                        : "";
                }
                if (homeAddress !== undefined) updatePayload.homeAddress = homeAddress?.toUpperCase();
                if (nin !== undefined) updatePayload.nin = nin?.toUpperCase();
                if (birthPlace !== undefined) updatePayload.birthPlace = birthPlace?.toUpperCase();
                if (countryBirthPlace !== undefined) updatePayload.countryBirthPlace = countryBirthPlace?.toUpperCase();
                if (ci !== undefined) updatePayload.ci = ci?.toUpperCase();
                if (expiredCI !== undefined) updatePayload.expiredCI = expiredCI?.toUpperCase();

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

    getAvailableTeams: userProcedure
        .input(z.object({
            idAthlete: z.string()
        }))
        .query(async ({ctx, input}) => {
            const {idAthlete} = input;
            try {

                const athleteTeams = ctx.db
                    .select({idTeam: IsIn.idTeam})
                    .from(IsIn)
                    .where(eq(IsIn.idAthlete, idAthlete));

                const activeSeason = ctx.db
                    .select({id: SportSeason.id})
                    .from(SportSeason)
                    .where(eq(SportSeason.status, "active"));

                return await ctx.db
                    .select()
                    .from(Team)
                    .innerJoin(SportSeason, eq(Team.idSeason, SportSeason.id))
                    .where(
                        and(
                            notInArray(Team.id, athleteTeams),
                            inArray(Team.idSeason, activeSeason)
                        )
                    );

            } catch (error) {
                console.error("[GETAVAILABLETEAMS USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile recuperare le squadre disponibili.",
                });
            }
        }),

    isAthleteActive: userProcedure
        .input(z.object({
            idAthlete: z.string()
        }))
        .query(async ({ctx, input}) => {
            const {idAthlete} = input;

            try {

                const athlete = await ctx.db.select()
                    .from(Athlete)
                    .where(eq(Athlete.id, idAthlete))
                    .limit(1);

                if (!athlete.length || !athlete[0]) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Atleta non trovato.",
                    });
                }

                return athlete[0].status === "active";

            } catch (error) {
                console.error("[ISATHLETEACTIVE USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile verificare lo stato dell'atleta.",
                });
            }
        }),
    userTeamSubscribe: userProcedure
        .input(z.object({
            idAthlete: z.string(),
            idUser: z.string(),
            idTeam: z.string(),
            subscibePassword: z.string()
        })).mutation(async ({input, ctx}) => {

            const {idAthlete, idUser, idTeam, subscibePassword} = input;

            try {

                const association = await ctx.db
                    .select()
                    .from(Associate)
                    .where(
                        and(
                            eq(Associate.athleteId, idAthlete),
                            eq(Associate.userId, idUser)
                        )
                    )
                    .limit(1);

                if (!association.length || !association) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "L'atleta non è gestito da questo utente.",
                    });
                }


                const isYetSub = await ctx.db.select()
                    .from(IsIn)
                    .where(
                        and(
                            eq(IsIn.idAthlete, idAthlete),
                            eq(IsIn.idTeam, idTeam)
                        )
                    )
                    .limit(1);

                if (isYetSub.length) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "L'atleta risulta già iscritto a questa squadra.",
                    });
                }

                const verifyCredential = await ctx.db.select()
                    .from(Team)
                    .where(
                        and(
                            eq(Team.id, idTeam),
                            eq(Team.subscribePassword, subscibePassword)
                        )
                    ).limit(1);

                if (!verifyCredential.length || !verifyCredential[0]) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "Password di iscrizione errata.",
                    });
                }


                await ctx.db.insert(IsIn)
                    .values({
                        idTeam: idTeam,
                        idAthlete: idAthlete
                    })

                return {success: true}

            } catch (error) {
                console.error("[USERTEAMSUBSCRIBE USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile iscriversi alla squadra.",
                });
            }

        }),
    subscribedTeam: userProcedure
        .input(z.object({
            idAthlete: z.string(),
        }))
        .query(async ({ctx, input}) => {
            const {idAthlete} = input;

            try {

                return await ctx.db
                    .select({
                        team: Team,
                        season: SportSeason.season
                    })
                    .from(IsIn)
                    .innerJoin(Team, eq(IsIn.idTeam, Team.id))
                    .innerJoin(SportSeason, eq(Team.idSeason, SportSeason.id))
                    .where(eq(IsIn.idAthlete, idAthlete));


            } catch (error) {
                console.error("[SUBSCRIBEDATHLETE USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile iscriversi alla squadra.",
                });
            }

        }),
    ubsubscribedAthleteTeam: userProcedure
        .input(z.object({
            idAthlete: z.string(),
            idUser: z.string(),
            idTeam: z.string()
        }))
        .mutation(async ({input, ctx}) => {
            const {idAthlete, idUser, idTeam} = input;

            try {

                const association = await ctx.db
                    .select()
                    .from(Associate)
                    .where(
                        and(
                            eq(Associate.athleteId, idAthlete),
                            eq(Associate.userId, idUser)
                        )
                    )
                    .limit(1);

                if (!association.length || !association) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "L'atleta non è gestito da questo utente.",
                    });
                }

                await ctx.db.delete(IsIn)
                    .where(
                        and(
                            eq(IsIn.idAthlete, idAthlete),
                            eq(IsIn.idTeam, idTeam)
                        )
                    );

                return {success: true}
            } catch (error) {
                console.error("[UNSUBSCRIBE ATHLETE TEAM API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile annullare l'iscrizione alla squadra.",
                });
            }
        }),
    addAthletesToUser: userProcedure.input(z.object({
        idUser: z.string(),
        name: z.string(),
        surname: z.string(),
        dateOfBirth: z.string(),
        homeAddress: z.string(),
        nin: z.string(),
        expirationMedicalCertificate: z.string(),
        birthPlace: z.string(),
        countryBirthPlace: z.string(),
        ci: z.string(),
        expiredCI: z.string()
    }))
        .mutation(async ({ctx, input}) => {
            try {

                const existingAthlete = await ctx.db
                    .select()
                    .from(Athlete)
                    .where(eq(Athlete.nin, input.nin));

                if (existingAthlete.length > 0) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Attenzione! E' stato inserito un'atleta già registrato. Se sei un genitore o tutore legale, contatta la società per associarti.",
                    });
                }

                const insertedAthletes = await ctx.db
                    .insert(Athlete)
                    .values(
                        {
                            id: crypto.randomUUID(),
                            name: input.name.toUpperCase(),
                            surname: input.surname.toUpperCase(),
                            dateOfBirth: input.dateOfBirth,
                            homeAddress: input.homeAddress.toUpperCase(),
                            nin: input.nin.trim().toUpperCase(),
                            expirationMedicalCertificate: input.expirationMedicalCertificate,
                            birthPlace: input.birthPlace.toUpperCase(),
                            countryBirthPlace: input.countryBirthPlace.toUpperCase(),
                            status: "active" as const,
                            ci: input.ci,
                            expiredCI: input.expiredCI
                        }
                    )
                    .returning({id: Athlete.id});

                await ctx.db.insert(Notification)
                    .values(
                        {
                            id: crypto.randomUUID(),
                            dateCreation: new Date().toISOString(),
                            dateExpiration: input.expiredCI,
                            text: "Scadenza carta di identità",
                            idAthlete: insertedAthletes[0].id
                        }
                    );

                if (input.expirationMedicalCertificate && input.expirationMedicalCertificate.trim() !== "") {
                    await ctx.db.insert(Notification)
                        .values(
                            {
                                id: crypto.randomUUID(),
                                dateCreation: new Date().toISOString(),
                                dateExpiration: input.expirationMedicalCertificate,
                                text: "Scadenza certificato medico",
                                idAthlete: insertedAthletes[0].id
                            }
                        );
                }

                await ctx.db.insert(Associate)
                    .values(
                        {
                            userId: input.idUser,
                            athleteId: insertedAthletes[0].id
                        }
                    );

                return {success: true, id: insertedAthletes[0].id};

            } catch (error) {

                console.log("[ADDATHLETETOUSER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile associare gli atleti all'utente.",
                });
            }
        }),
    getStats: userProcedure
        .input(z.object({
            userId: z.string()
        }))
        .query(async ({ctx, input}) => {

            const {userId} = input;

            try {

                const nAthletes = await ctx.db.select()
                    .from(Associate)
                    .where(eq(Associate.userId, userId));

                const activeSportSeason = await ctx.db.select({
                    season: SportSeason.season
                })
                    .from(SportSeason)
                    .where(eq(SportSeason.status, "active"));

                const associateAthlete = await ctx.db.select({
                    id: Athlete.id,
                    name: Athlete.name,
                    surname: Athlete.surname,
                })
                    .from(Athlete)
                    .innerJoin(Associate, eq(Associate.athleteId, Athlete.id))
                    .where(eq(Associate.userId, userId));


                return {
                    success: true,
                    data: {
                        nAthletes: nAthletes.length,
                        activeSportSeason: activeSportSeason.length > 0 ? activeSportSeason[0].season : null,
                        associateAthlete: associateAthlete
                    }
                }

            } catch (error) {
                console.log("[GETSTATS API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile recuperare le statistiche utente.",
                });
            }

        }),
    updateUserProfile: userProcedure
        .input(z.object({
            userId: z.string(),
            name: z.string().optional(),
            surname: z.string().optional(),
            email: z.string().optional(),
            phoneNumber: z.string().optional(),
        }))
        .mutation(async ({ctx, input}) => {
            const {userId, name, surname, email, phoneNumber} = input;

            try {

                const updatePayload: Record<string, any> = {};

                if (name !== undefined) updatePayload.name = name.toUpperCase();
                if (surname !== undefined) updatePayload.surname = surname.toUpperCase();
                if (email !== undefined) updatePayload.email = email.toLowerCase();
                if (phoneNumber !== undefined) updatePayload.phoneNumber = phoneNumber;

                const result = await ctx.db
                    .update(User)
                    .set(updatePayload)
                    .where(eq(User.id, userId))
                    .returning();

                if (result.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Impossibile aggiornare il profilo utente specificato.",
                    });
                }

                return result[0];

            } catch (error) {
                console.error("[UPDATEUSERPROFILE USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile aggiornare le informazioni del profilo utente.",
                });
            }
        }),
    areValidDocuments: userProcedure
        .input(z.object({
            idAthlete: z.string()
        }))
        .query(async ({ctx, input}) => {
            const {idAthlete} = input;

            try {

                const data = await ctx.db.select({
                    expiredCI: Athlete.expiredCI,
                    expirationMedicalCertificate: Athlete.expirationMedicalCertificate,
                }).from(Athlete)
                    .where(eq(Athlete.id, idAthlete))
                    .limit(1);

                if (data.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Atleta non trovato.",
                    });
                }


                const athleteData = data[0];
                const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
                const now = new Date().getTime();

                const {expirationMedicalCertificate, expiredCI} = athleteData;
                const messages: string[] = [];

                if (!expirationMedicalCertificate) {
                    messages.push("Certificato medico non presente.");
                } else if (new Date(expirationMedicalCertificate).getTime() < now) {
                    messages.push("Certificato medico scaduto.");
                } else if (new Date(expirationMedicalCertificate).getTime() - now < oneMonthInMs) {
                    messages.push("Certificato medico in scadenza tra meno di un mese.");
                }

                if (!expiredCI) {
                    messages.push("Carta di identità non presente.");
                } else if (new Date(expiredCI).getTime() < now) {
                    messages.push("Carta di identità scaduta.");
                } else if (new Date(expiredCI).getTime() - now < oneMonthInMs) {
                    messages.push("Carta di identità in scadenza tra meno di un mese.");
                }

                return {
                    isValid: messages.length === 0,
                    messages
                };

            } catch (error) {
                console.error("[ARE VALID ATHLETES DOCUMENTS USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile verificare la validità dei documenti dell'atleta.",
                });
            }
        })

});