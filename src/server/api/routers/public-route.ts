import {publicProcedure, createTRPCRouter} from "@/server/api/trpc";
import {z} from "zod";
import {TRPCError} from "@trpc/server";
import {Athlete, Associate, IsIn, Team, User} from "@/db/schema";
import {eq, inArray} from "drizzle-orm";
import {ConfirmUserCreated} from "@/lib/template-mail/confirm-user-created";
import {sendEmail} from "@/lib/send-mail";

export const PublicRoutes = createTRPCRouter({
    welcomeUser: publicProcedure.input(z.object({
        name: z.string(),
        surname: z.string(),
        email: z.string(),
    }))
        .mutation(async ({input}) => {
            try {

                const {name, surname, email} = input;

                const generate = ConfirmUserCreated(name, surname, "https://gestionale.blackbullsvolley.it");

                await sendEmail(
                    email,
                    "Benvenuto nel portale ufficiale ASD Club Black Bulls Volley",
                    "text",
                    generate
                );

                return {success: true};

            } catch (error) {

                console.log("[WELCOMEUSER API ERROR] ", error);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Non è stato possibile inviare la mail di benvenuto.",
                });
            }
        })
});