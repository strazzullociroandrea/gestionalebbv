import {publicProcedure, createTRPCRouter} from "@/server/api/trpc";
import {z} from "zod";
import {TRPCError} from "@trpc/server";
import {Athlete, Associate, User} from "@/db/schema";
import {eq, inArray} from "drizzle-orm";

export const PublicRoutes = createTRPCRouter({
    addAthletesToUser: publicProcedure.input(z.object({
        userId: z.string(),
        athletes: z.object({
            name: z.string(),
            surname: z.string(),
            dateOfBirth: z.string(),
            homeAddress: z.string(),
            nin: z.string(),
            expirationMedicalCertificate: z.string(),
            birthPlace: z.string(),
            countryBirthPlace: z.string(),
        }).array()
    }))
        .mutation(async ({ctx, input}) => {
            try {
                const {
                    userId,
                    athletes,
                } = input;

                await ctx.db
                    .update(User)
                    .set({emailVerified: true})
                    .where(eq(User.id, userId));

                const existingAthletes = await ctx.db
                    .select()
                    .from(Athlete)
                    .where(inArray(Athlete.nin, athletes.map(a => a.nin.trim().toUpperCase())));

                if (existingAthletes.length > 0) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Attenzione! E' stato inserito uno o più atleti già registrati. Se sei un genitore o tutore legale, contatta la società per associarti.",
                    });
                }

                const insertedAthletes = await ctx.db
                    .insert(Athlete)
                    .values(
                        athletes.map((athlete) => ({
                            id: crypto.randomUUID(),
                            name: athlete.name,
                            surname: athlete.surname,
                            dateOfBirth: athlete.dateOfBirth,
                            homeAddress: athlete.homeAddress,
                            nin: athlete.nin.trim().toUpperCase(),
                            expirationMedicalCertificate: athlete.expirationMedicalCertificate,
                            birthPlace: athlete.birthPlace,
                            countryBirthPlace: athlete.countryBirthPlace,
                            status: "inactive" as const,
                        }))
                    )
                    .returning({id: Athlete.id});

                await ctx.db.insert(Associate).values(
                    insertedAthletes.map((newAthlete) => ({
                        userId: userId,
                        athleteId: newAthlete.id,
                    }))
                );

                return {success: true};

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
        })
});