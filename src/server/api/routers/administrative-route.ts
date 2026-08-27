import {administrativeProcedure, adminProcedure, createTRPCRouter} from "@/server/api/trpc";
import {z} from "zod";
import {
    Associate,
    Athlete,
    IsIn,
    Sponsor,
    SportSeason,
    Team,
    ToSponsor,
    User,
    Session,
    Championship, Account, Verification
} from "@/db/schema";
import {eq, and, ne, desc, notInArray, or} from "drizzle-orm";
import {TRPCError} from "@trpc/server";
import {createAdministrativeUser} from "@/lib/template-mail/create-administrative-user";
import {sendEmail} from "@/lib/send-mail";
import {hashPassword} from "better-auth/crypto";
import {auth} from "@/lib/auth";
import {getCloudflareContext} from "@opennextjs/cloudflare";
import {CloudflareSchemas} from "@/lib/schemas/cloudflare-schemas";


export const AdministrativeRoute = createTRPCRouter({
    getSeason: administrativeProcedure.input(z.void())
        .query(async ({ctx}) => {
            try {
                return await ctx.db.select().from(SportSeason).orderBy(SportSeason.status);
            } catch (error) {
                console.error("[GET-SEASON API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare le stagioni sportive.",
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

                console.log("[ADD-SEASON API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }


                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile procedere con la creazione della stagione",
                });
            }
        }),

    getAllTeams: administrativeProcedure.input(z.void())
        .query(async ({ctx}) => {
            try {

                return await ctx.db
                    .select({
                        team: Team,
                        season: SportSeason,
                    })
                    .from(Team)
                    .innerJoin(SportSeason, eq(Team.idSeason, SportSeason.id))
                    .orderBy(desc(SportSeason.season));

            } catch (error) {
                console.error("[GET-TEAMS API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare i team",
                });
            }
        }),

    addTeam: administrativeProcedure
        .input(
            z.object({
                name: z.string().min(1, "Il nome della squadra è obbligatorio"),
                subscribePassword: z.string().min(1, "La password di iscrizione è obbligatoria"),
                idSeason: z.string().min(1, "L'ID della stagione è obbligatorio"),
            })
        )
        .mutation(async ({ctx, input}) => {
            try {

                const seasonExists = await ctx.db
                    .select()
                    .from(SportSeason)
                    .where(eq(SportSeason.id, input.idSeason))
                    .limit(1);

                if (seasonExists.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! La stagione selezionata non esiste o è stata rimossa.",
                    });
                }

                const existingTeam = await ctx.db
                    .select()
                    .from(Team)
                    .where(and(eq(Team.name, input.name), eq(Team.idSeason, input.idSeason)))
                    .limit(1);

                if (existingTeam.length > 0) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Attenzione! La squadra inserita esiste già per la stagione selezionata. Inserisci un nome diverso.",
                    });
                }

                const [newTeam] = await ctx.db.insert(Team).values({
                    id: crypto.randomUUID(),
                    name: input.name,
                    subscribePassword: input.subscribePassword,
                    idSeason: input.idSeason,
                }).returning();

                return {
                    success: true,
                    data: newTeam,
                };

            } catch (error) {

                console.log("[ADD-TEAM API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile procedere con la creazione della squadra",
                });
            }
        }),
    getAllAthletes: administrativeProcedure
        .input(
            z.object({
                idUser: z.string().min(1, "Attenzione! L'id dell'utente non è valido.").nullable(),
            })
        )
        .query(async ({input, ctx}) => {
            const {idUser} = input;

            try {

                const athletes = await ctx.db
                    .select({
                        id: Athlete.id,
                        name: Athlete.name,
                        surname: Athlete.surname,
                        status: Athlete.status,
                    })
                    .from(Athlete);

                return athletes.map((athlete) => ({
                    id: athlete.id,
                    name: athlete.name,
                    surname: athlete.surname,
                    status: athlete.status === "active" ? "Attivo" : "Non attivo",
                }));

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
    getAthleteInfo: administrativeProcedure
        .input(
            z.object({
                idUser: z.string().optional(),
                idAthlete: z.string().min(1, "Attenzione! L'id dell'atleta non è valido."),
            })
        )
        .query(async ({input, ctx}) => {
            const {idAthlete} = input;

            try {


                const result = await ctx.db
                    .select({
                        athlete: Athlete,
                        user: User,
                    })
                    .from(Athlete)
                    .leftJoin(Associate, eq(Athlete.id, Associate.athleteId))
                    .leftJoin(User, eq(Associate.userId, User.id))
                    .where(eq(Athlete.id, idAthlete))
                    .limit(1);

                if (!result.length || !result[0].athlete) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Atleta non trovato nel sistema.",
                    });
                }

                return result[0];

            } catch (error) {
                console.error("[GETATHLETEINFO ADMINISTRATIVE API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile recuperare le informazioni dell'atleta.",
                });
            }
        }),
    updateAthlete: administrativeProcedure
        .input(
            z.object({
                idUser: z.string().min(1, "Attenzione! L'id dell'utente non è valido."),
                idAthlete: z.string().min(1, "Attenzione! L'id dell'atleta non è valido."),
                name: z.string().min(2, "Attenzione! Il nome deve essere composto da almeno 2 caratteri.").max(100, "Attenzione! Il nome non può superare i 100 caratteri."),
                surname: z.string().min(2, "Attenzione! Il cognome deve essere composto da almeno 2 caratteri.").max(100, "Attenzione! Il cognome non può superare i 100 caratteri."),
                dateOfBirth: z.string(),
                expirationMedicalCertificate: z.string(),
                homeAddress: z.string().min(5, "Attenzione! L'indirizzo di casa deve essere composto da almeno 5 caratteri.").max(200, "Attenzione! L'indirizzo di casa non può superare i 200 caratteri."),
                nin: z.string().length(16, "Attenzione! Il codice fiscale deve essere composto da esattamente 16 caratteri.").toUpperCase(),
                birthPlace: z.string().min(2, "Attenzione! Il luogo di nascita deve essere composto da almeno 2 caratteri.").max(100, "Attenzione! Il luogo di nascita non può superare i 100 caratteri."),
                countryBirthPlace: z.string().length(2, "Attenzione! Il paese di nascita deve essere composto da esattamente 2 caratteri.").toUpperCase(),
                status: z.enum(["active", "inactive"], "Attenzione! Lo stato dell'atleta non è valido."),
                ci: z.string(),
                expiredCI: z.string()
            })
        )
        .mutation(async ({input, ctx}) => {
            const {idUser, idAthlete, ...athleteData} = input;

            try {


                const existingAthlete = await ctx.db
                    .select()
                    .from(Athlete)
                    .where(eq(Athlete.id, idAthlete))
                    .limit(1);

                if (existingAthlete.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! L'atleta selezionato non esiste o è stato rimosso.",
                    });
                }

                await ctx.db
                    .update(Athlete)
                    .set({
                        ...athleteData,
                        dateOfBirth: athleteData.dateOfBirth,
                        expirationMedicalCertificate: athleteData.expirationMedicalCertificate ? athleteData.expirationMedicalCertificate : "",
                    })
                    .where(eq(Athlete.id, idAthlete));

            } catch (error) {
                console.error("[UPDATEATHLETE USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile aggiornare le informazioni dell'atleta.",
                });
            }
        }),
    subscribedTeam: administrativeProcedure
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
    ubsubscribedAthleteTeam: administrativeProcedure
        .input(z.object({
            idAthlete: z.string(),
            idTeam: z.string()
        }))
        .mutation(async ({input, ctx}) => {
            const {idAthlete, idTeam} = input;

            try {

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
    deleteSeason: administrativeProcedure
        .input(z.object({
            idSeason: z.string().min(1, "Attenzione! L'id della stagione non è valido."),
        }))
        .mutation(async ({input, ctx}) => {
            const {idSeason} = input;

            try {

                await ctx.db.delete(SportSeason)
                    .where(and(eq(SportSeason.id, idSeason), ne(SportSeason.status, "active")));

                return {success: true}
            } catch (error) {
                console.error("[DELETESEASON API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile eliminare la stagione richiesta.",
                });
            }
        }),
    getInfoTeam: administrativeProcedure
        .input(z.object({
            idTeam: z.string()
        }))
        .query(async ({ctx, input}) => {
            const {idTeam} = input;

            try {


                const teamInfo = await ctx.db
                    .select({
                        team: Team,
                        season: SportSeason.season
                    })
                    .from(Team)
                    .innerJoin(SportSeason, eq(Team.idSeason, SportSeason.id))
                    .where(eq(Team.id, idTeam))
                    .limit(1);

                const athletes = await ctx.db
                    .select({Athlete})
                    .from(Athlete)
                    .innerJoin(IsIn, eq(Athlete.id, IsIn.idAthlete))
                    .where(eq(IsIn.idTeam, idTeam));

                const championships = await ctx.db
                    .select({Championship})
                    .from(Championship)
                    .where(eq(Championship.idTeam, teamInfo[0].team.id))


                return {teamInfo, athletes, championships};

            } catch (error) {
                console.error("[GETINFOTEAM API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile recuperare le informazioni della squadra.",
                });
            }

        }),
    updateTeamPassword: administrativeProcedure
        .input(z.object({
            idTeam: z.string(),
            subscribePassword: z.string()
        }))
        .mutation(async ({ctx, input}) => {
            const {idTeam, subscribePassword} = input;

            try {


                await ctx.db.update(Team)
                    .set({subscribePassword: subscribePassword})
                    .where(eq(Team.id, idTeam));

                console.log("UPDATED");
                return {success: true, subscribePassword};

            } catch (error) {
                console.error("[UPDATETEAMPASSWORD API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile aggiornare la password della squadra.",
                });
            }
        }),
    getAllUsers: administrativeProcedure.input(z.void())
        .query(async ({ctx}) => {
            try {
                return await ctx.db.select().from(User).where(eq(User.role, "user")).orderBy(User.role);
            } catch (error) {
                console.error("[GET-USERS API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare gli utenti",
                });
            }
        }),
    getInfoUser: administrativeProcedure
        .input(z.object({
            userId: z.string()
        }))
        .query(async ({ctx, input}) => {
            try {
                const {userId} = input;


                const userData = await ctx.db.select({
                    email: User.email,
                    id: User.id,
                    name: User.name,
                    phoneNumber: User.phoneNumber,
                    surname: User.surname,
                }).from(User)
                    .where(eq(User.id, userId))
                    .limit(1);

                if (userData.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Utente non trovato"
                    });
                }


                return {
                    user: userData[0]
                };

            } catch (error) {
                console.error("[GET-USER INFO API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare le informazioni dell'utente",
                });
            }
        }),
    updateInfoUser: administrativeProcedure
        .input(z.object({
            userId: z.string(),
            name: z.string().min(2, "Il nome deve essere composto da almeno 2 caratteri.").max(100, "Il nome non può superare i 100 caratteri."),
            surname: z.string().min(2, "Il cognome deve essere composto da almeno 2 caratteri.").max(100, "Il cognome non può superare i 100 caratteri."),
            phoneNumber: z.string().nullable(),
            email: z.email("L'email inserita non è valida.").max(100, "L'email non può superare i 100 caratteri."),
        }))
        .mutation(async ({ctx, input}) => {
            try {

                const {userId, name, surname, phoneNumber, email} = input;

                const existingUser = await ctx.db.select().from(User).where(eq(User.email, email)).limit(1);

                if (existingUser.length > 0 && existingUser[0].id !== userId) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Attenzione! L'email inserita è già in uso da un altro utente. Inserisci un'email diversa.",
                    });
                }

                await ctx.db.update(User)
                    .set({
                        name,
                        surname,
                        phoneNumber,
                        email
                    })
                    .where(eq(User.id, userId));

                return {success: true};

            } catch (error) {
                console.error("[UPDATE-USER INFO API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile aggiornare le informazioni dell'utente",
                });
            }
        }),
    getAssociateAthlete: administrativeProcedure
        .input(z.object({
            idUser: z.string()
        }))
        .query(async ({ctx, input}) => {
            try {


                const {idUser} = input;


                return await ctx.db
                    .select({
                        athlete: Athlete,
                    })
                    .from(Associate)
                    .innerJoin(Athlete, eq(Associate.athleteId, Athlete.id))
                    .where(eq(Associate.userId, idUser));


            } catch (error) {
                console.error("[GET-ASSOCIATE ATHLETE API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare gli atleti associati all'utente",
                });
            }
        }),
    removeAssociateAthlete: administrativeProcedure
        .input(z.object({
            idUser: z.string(),
            idAthlete: z.string()
        })).mutation(async ({ctx, input}) => {
            try {
                const {idUser, idAthlete} = input;


                await ctx.db.delete(Associate)
                    .where(and(eq(Associate.userId, idUser), eq(Associate.athleteId, idAthlete)));

                return {success: true};

            } catch (error) {
                console.error("[REMOVE-ASSOCIATE ATHLETE API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile rimuovere l'associazione dell'atleta all'utente",
                });
            }
        }),
    getAvailableAthletsPerUsers: administrativeProcedure
        .input(z.object({
            idUser: z.string()
        }))
        .query(async ({ctx, input}) => {
            try {
                const {idUser} = input;


                const associatedAthletes = await ctx.db
                    .select({athleteId: Associate.athleteId})
                    .from(Associate)
                    .where(eq(Associate.userId, idUser));

                const associatedAthleteIds = associatedAthletes.map(a => a.athleteId);

                return await ctx.db
                    .select({Athlete})
                    .from(Athlete)
                    .where(notInArray(Athlete.id, associatedAthleteIds as string[]));

            } catch (error) {
                console.error("[GET-AVAILABLE ATHLETES PER USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare gli atleti disponibili per l'associazione all'utente",
                });
            }
        }),
    associateAthleteToUser: administrativeProcedure
        .input(z.object({
            idUser: z.string(),
            idAthlete: z.string()
        }))
        .mutation(async ({ctx, input}) => {
            try {
                const {idUser, idAthlete} = input;


                await ctx.db.insert(Associate).values({
                    userId: idUser,
                    athleteId: idAthlete
                });

                return {success: true};

            } catch (error) {
                console.error("[ASSOCIATE ATHLETE TO USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile associare l'atleta all'utente",
                });
            }
        }),

    getAllSponsor: administrativeProcedure
        .input(z.void())
        .query(async ({ctx}) => {
            try {


                const rs = await ctx.db
                    .select({
                        sponsor: Sponsor,
                        season: SportSeason
                    })
                    .from(Sponsor)
                    .innerJoin(ToSponsor, eq(Sponsor.id, ToSponsor.idSponsor))
                    .innerJoin(SportSeason, eq(ToSponsor.idSeason, SportSeason.id))
                    .orderBy(SportSeason.status, desc(SportSeason.season));

                const finalData: {
                    season: string,
                    sponsor: {
                        id: string
                        name: string
                        description: string | null
                        email: string | null
                        phone: string | null
                    }[]
                }[] = [];

                rs.forEach((row) => {
                    let existingGroup = finalData.find((item) => item.season === row.season.season);

                    if (!existingGroup) {
                        existingGroup = {
                            season: row.season.season,
                            sponsor: []
                        };
                        finalData.push(existingGroup);
                    }

                    if (!existingGroup.sponsor.some((s) => s.id === row.sponsor.id)) {
                        existingGroup.sponsor.push(row.sponsor);
                    }
                });
                return {data: finalData};

            } catch (error) {
                console.error("[GET ALL SPONSOR API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare gli sponsor.",
                });
            }
        }),
    addSponsor: administrativeProcedure
        .input(z.object({
            name: z.string().min(1, "Il nome dello sponsor è obbligatorio"),
            description: z.string().optional(),
            email: z.string().email("L'email inserita non è valida.").optional(),
            phone: z.string().optional()
        }))
        .mutation(async ({ctx, input}) => {
            try {
                const {name, description, email, phone} = input;


                const existingSponsor = await ctx.db
                    .select()
                    .from(Sponsor)
                    .where(or(eq(Sponsor.name, name), eq(Sponsor.email, email || ""), eq(Sponsor.phone, phone || "")))


                if (existingSponsor.length > 0) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Attenzione! Esiste già uno sponsor con questi dati.",
                    });
                }


                const idSeasonActive = await ctx.db
                    .select({id: SportSeason.id})
                    .from(SportSeason)
                    .where(eq(SportSeason.status, "active"))
                    .limit(1);


                if (idSeasonActive.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! Non esiste una stagione attiva. Creane una prima di aggiungere uno sponsor.",
                    });
                }

                const [newSponsor] = await ctx.db.insert(Sponsor).values({
                    id: crypto.randomUUID(),
                    name: name || "",
                    description: description || "",
                    email: email || "",
                    phone: phone || ""
                }).returning();

                if (newSponsor) {

                    await ctx.db.insert(ToSponsor).values({
                        idSponsor: newSponsor.id,
                        idSeason: idSeasonActive[0].id
                    });

                } else {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! Non è stato possibile creare lo sponsor. Riprova.",
                    });
                }

            } catch (error) {
                console.error("[ADD SPONSOR API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile creare lo sponsor.",
                });
            }

        }),
    renewSponsorSeason: administrativeProcedure
        .input(z.object({
            idSponsor: z.string()
        }))
        .mutation(async ({ctx, input}) => {
            try {
                const {idSponsor} = input;

                const idSeasonActive = await ctx.db
                    .select({id: SportSeason.id})
                    .from(SportSeason)
                    .where(eq(SportSeason.status, "active"))
                    .limit(1);

                if (idSeasonActive.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! Non esiste una stagione attiva. Creane una prima di rinnovare lo sponsor.",
                    });
                }

                await ctx.db.insert(ToSponsor).values({
                    idSponsor: idSponsor,
                    idSeason: idSeasonActive[0].id
                });

                return {success: true};

            } catch (error) {
                console.error("[RENEW SPONSOR SEASON API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile rinnovare lo sponsor per la stagione attiva.",
                });
            }
        }),
    updateSponsor: administrativeProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1, "Il nome dello sponsor è obbligatorio"),
            description: z.string().optional(),
            email: z.string().email("L'email inserita non è valida.").optional(),
            phone: z.string().optional()
        }))
        .mutation(async ({ctx, input}) => {
            try {
                const {id, name, description, email, phone} = input;

                await ctx.db.update(Sponsor)
                    .set({
                        name,
                        description: description || "",
                        email: email || "",
                        phone: phone || ""
                    })
                    .where(eq(Sponsor.id, id));

                return {success: true};


            } catch (error) {
                console.error("[UPDATE SPONSOR API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile aggiornare i dati dello sponsor.",
                });
            }
        }),
    createAdministrativeUser: adminProcedure
        .input(z.object({
            username: z.string(),
            surname: z.string(),
            email: z.string().email(),
            phone: z.string().optional()
        }))
        .mutation(async ({ctx, input}) => {
            try {
                const {env} = await getCloudflareContext({async: true}) as unknown as { env: CloudflareSchemas };
                const authInstance = auth(env);
                const tempPassword = crypto.randomUUID().slice(0, 12);

                const newUser = await authInstance.api.signUpEmail({
                    body: {
                        email: input.email,
                        password: tempPassword,
                        name: input.username.toUpperCase(),
                        surname: input.surname.toUpperCase(),
                        role: "administrative",
                        phoneNumber: input.phone
                    }
                });

                if (!newUser) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Impossibile registrare l'utente.",
                    });
                }


                const mailContent = createAdministrativeUser(input.username, input.email, tempPassword, "https://gestionale.blackbullsvolley.it");

                await sendEmail(input.email, "Creazione Account Amministrativo", "text", mailContent);

                return {success: true};

            } catch (error) {
                console.error("[CREATE USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile creare l'utente.",
                });
            }
        }),
    getAdministrativeUser: adminProcedure
        .input(z.void())
        .query(async ({ctx}) => {
            try {

                return await ctx.db.select().from(User).where(eq(User.role, "administrative")).orderBy(User.surname);

            } catch (error) {
                console.error("[GET ADMINISTRATIVE USER API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare gli utenti amministrativi.",
                });
            }
        }),
    updateUserProfile: adminProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1, "Il nome è obbligatorio"),
            surname: z.string().min(1, "Il cognome è obbligatorio"),
            email: z.string().email("L'email inserita non è valida.").min(1, "L'email è obbligatoria"),
            phoneNumber: z.string().optional()
        }))
        .mutation(async ({ctx, input}) => {
            try {

                const existingUser = await ctx.db.select().from(User).where(eq(User.id, input.id)).limit(1);

                if (existingUser.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! L'utente selezionato non esiste o è stato rimosso.",
                    });
                }

                const emailInUse = await ctx.db.select().from(User).where(eq(User.email, input.email)).limit(1);

                if (emailInUse.length > 0 && emailInUse[0].id !== input.id) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Attenzione! L'email inserita è già in uso da un altro utente. Inserisci un'email diversa.",
                    });
                }

                await ctx.db.update(User)
                    .set({
                        name: input.name,
                        surname: input.surname,
                        email: input.email,
                        phoneNumber: input.phoneNumber || null
                    })
                    .where(eq(User.id, input.id));

                return {success: true};

            } catch (error) {

                console.error("[UPDATE ADMINISTRATIVE USER PROFILE API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile aggiornare il profilo dell'utente amministrativo.",
                });

            }
        }),
    deleteAdministrativeProfile: adminProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({ctx, input}) => {
            try {
                const existingUser = await ctx.db.select().from(User).where(eq(User.id, input.id)).limit(1);

                if (existingUser.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! L'utente selezionato non esiste o è stato rimosso.",
                    });
                }

                await ctx.db.delete(User).where(eq(User.id, input.id));
                await ctx.db.delete(Session).where(eq(Session.userId, input.id));

                return {success: true};

            } catch (error) {
                console.error("[DELETE ADMINISTRATIVE PROFILE API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile eliminare il profilo dell'utente amministrativo.",
                });
            }
        }),
    addTeamChampionship: administrativeProcedure
        .input(z.object({
            idTeam: z.string(),
            name: z.string(),
            organizer: z.enum(["FIPAV", "CSI", "PGS", "VolleyCup"]),
            isPaid: z.boolean()
        }))
        .mutation(async ({input, ctx}) => {

            try {

                await ctx.db.insert(Championship)
                    .values({
                        id: crypto.randomUUID(),
                        paid: input.isPaid,
                        name: input.name,
                        sportsCommittee: input.organizer,
                        idTeam: input.idTeam
                    })

                return {success: true}

            } catch (error) {
                console.error("[ADD TEAM CHAMPIONSHIP API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile associare il campionato alla squadra.",
                });
            }
        }),
    removeTeamChampionship: administrativeProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({input, ctx}) => {
            try {

                await ctx.db.delete(Championship)
                    .where(eq(Championship.id, input.id)).limit(1);

            } catch (error) {
                console.error("[REMOVE TEAM CHAMPIONSHIP API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile rimuovere il campionato dalla squadra.",
                });
            }
        }),

    editChampionship: administrativeProcedure
        .input(z.object({
            id: z.string(),
            name: z.string(),
            organizer: z.enum(["FIPAV", "CSI", "PGS", "VolleyCup"]),
            isPaid: z.boolean()
        }))
        .mutation(async ({input, ctx}) => {
            try {

                const exist = await ctx.db.select().from(Championship).where(eq(Championship.id, input.id)).limit(1);

                if (exist.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! Il campionato selezionato non esiste o è stato rimosso.",
                    })
                }

                await ctx.db.update(Championship)
                    .set({
                        name: input.name,
                        sportsCommittee: input.organizer,
                        paid: input.isPaid
                    })
                    .where(eq(Championship.id, input.id)).limit(1);

                return {success: true}

            } catch (error) {
                console.error("[EDIT TEAM CHAMPIONSHIP API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile modificare il campionato della squadra.",
                });
            }
        }),
    deleteTeam: administrativeProcedure
        .input(z.object({
            idTeam: z.string()
        }))
        .mutation(async ({input, ctx}) => {
            try {

                const {idTeam} = input;

                const existingTeam = await ctx.db.select().from(Team).where(eq(Team.id, idTeam)).limit(1);

                if (existingTeam.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! La squadra selezionata non esiste o è stata rimossa.",
                    });
                }

                await ctx.db.delete(Team).where(eq(Team.id, idTeam)).limit(1);

                return {success: true}

            } catch (error) {
                console.error("[DELETE TEAM API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile eliminare la squadra.",
                });
            }
        }),
    deleteSponsor: administrativeProcedure
        .input(z.object({
            id: z.string()
        })).mutation(async ({input, ctx}) => {
            try {

                const {id} = input;

                const existingSponsor = await ctx.db.select().from(Sponsor).where(eq(Sponsor.id, id)).limit(1);

                if (existingSponsor.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! Lo sponsor selezionato non esiste o è stato rimosso.",
                    });
                }

                await ctx.db.delete(Sponsor).where(eq(Sponsor.id, id)).limit(1);

                return {success: true}

            } catch (error) {
                console.error("[DELETE SPONSOR API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile eliminare lo sponsor selezionato.",
                });
            }
        }),
    deleteAthleteProfile: administrativeProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({input, ctx}) => {
            try {

                const {id} = input;

                const existingAthlete = await ctx.db.select().from(Athlete).where(eq(Athlete.id, id)).limit(1);

                if (existingAthlete.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Attenzione! L'atleta selezionato non esiste o è stato rimosso.",
                    });
                }

                await ctx.db.delete(Athlete).where(eq(Athlete.id, id)).limit(1);

                return {success: true}

            } catch (error) {
                console.error("[DELETE ATHLETE API ERROR] ", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile eliminare l'atleta selezionato.",
                });
            }
        }),
    getStats: administrativeProcedure
        .input(z.void())
        .query(async ({ctx}) => {
            try {

                const activeSeason = await ctx.db.select({season: SportSeason.season})
                    .from(SportSeason)
                    .where(eq(SportSeason.status, "active"))
                    .limit(1);

                const totalTeams = await ctx.db.select().from(Team);
                const totalAthletes = await ctx.db.select().from(Athlete);

                return {
                    activeSeason: activeSeason[0]?.season || "N/A",
                    teamNumber: totalTeams.length.toString(),
                    athleteNumber: totalAthletes.length.toString(),
                }
            } catch (error) {
                console.error("[GET STATS API ERROR] ", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Attenzione. Non è stato possibile recuperare le statistiche.",
                });
            }
        })

})