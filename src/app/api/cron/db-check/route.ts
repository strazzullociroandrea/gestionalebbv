import {NextResponse} from "next/server";
import {Associate, Athlete, Notification, User} from "@/db/schema";
import {getDb} from "@/db";
import {eq, lte, or} from "drizzle-orm";
import {getCloudflareContext} from "@opennextjs/cloudflare";
import {expirationDocuments} from "@/lib/template-mail/expiration-documents";
import {sendEmail} from "@/lib/send-mail";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    /*const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    */
    try {
        const {env} = await getCloudflareContext({async: true});
        const d1 = env.gestionale_bbv;

        if (!d1) {
            throw new Error("Database binding gestionale_bbv non trovato");
        }

        const db = getDb(d1);

        // Calcoliamo le date in JS in formato stringa 'YYYY-MM-DD' per un confronto sicuro con SQLite
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const thirtyDaysLater = new Date(now);
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

        const todayStr = now.toISOString().split('T')[0];
        const thirtyDaysStr = thirtyDaysLater.toISOString().split('T')[0];

        // Usiamo gli operatori nativi di Drizzle (lte, or) invece di sql`date(...)`
        const targets = await db.select({
            notificationId: Notification.id,
            dateExpiration: Notification.dateExpiration,
            athleteId: Athlete.id,
            name: Athlete.name,
            surname: Athlete.surname,
        })
            .from(Notification)
            .innerJoin(Athlete, eq(Notification.idAthlete, Athlete.id))
            .where(
                or(
                    lte(Notification.dateExpiration, todayStr),
                    lte(Notification.dateExpiration, thirtyDaysStr)
                )
            )
            .execute();

        let totalEmailsSent = 0;
        const uniqueAthletesMap: { id: string, name: string, surname: string }[] = [];

        for (const row of targets) {
            if (!uniqueAthletesMap.some(athlete => athlete.id === row.athleteId)) {
                uniqueAthletesMap.push({
                    id: row.athleteId,
                    name: row.name,
                    surname: row.surname,
                });
            }
        }

        for (const athlete of uniqueAthletesMap) {
            const userAssociate = await db.select({
                name: User.name,
                email: User.email
            })
                .from(User)
                .innerJoin(Associate, eq(User.id, Associate.userId))
                .where(eq(Associate.athleteId, athlete.id));

            for (const user of userAssociate) {
                const emailContent = expirationDocuments(user.name, athlete.name, athlete.surname);

                await sendEmail(user.email, "Scadenza documenti atleta", "text", emailContent);
                totalEmailsSent++;
            }
        }

        console.log(`[Notification Cron] Controllo completato. Atleti notificati: ${uniqueAthletesMap.length}. Email inviate: ${totalEmailsSent}`);

        return NextResponse.json({
            success: true,
            message: "Controllo e invio notifiche completato",
            notifiedCount: totalEmailsSent
        });

    } catch (error: any) {
        console.error("Errore durante il controllo del DB:", error);
        return NextResponse.json({success: false, error: error?.message || String(error)}, {status: 500});
    }
}