"use client";

import {useState} from "react";
import {useParams} from "next/navigation";
import {authClient} from "@/lib/auth-client";
import {User, ClipboardList, Users} from "lucide-react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AthleteInfo} from "@/components/user/athlete-info";
import {SubscriptionTeam} from "@/components/user/subscription";
import {SubscribedTeam} from "@/components/user/subscribed";

export default function AthletePage() {
    const params = useParams();

    const idAthlete = (
        params?.id ||
        params?.idAthlete ||
        params?.athletes ||
        (Object.values(params || {})[0] as string) ||
        ""
    ) as string;

    const {data: session, isPending: isSessionLoading} = authClient.useSession();
    const [activeTab, setActiveTab] = useState<"anagrafica" | "iscrizione" | "squadre">("anagrafica");

    const userId = session?.user?.id as string;
    const userEmail = session?.user?.email;

    if (isSessionLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto p-6 text-center text-zinc-400">
                <p className="animate-pulse font-semibold">Caricamento sessione in corso...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-4 md:p-6 space-y-6 bg-background text-foreground">
            <div
                className="flex flex-wrap items-center gap-2 p-1.5 border border-border rounded-3xl shadow-lg bg-card">
                <Button
                    variant={activeTab === "anagrafica" ? "default" : "ghost"}
                    onClick={() => setActiveTab("anagrafica")}
                    className={`cursor-pointer flex-1 min-w-35 font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${
                        activeTab === "anagrafica"
                            ? "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
                            : "text-muted-foreground"
                    }`}
                >
                    <User className="mr-2 h-4 w-4"/>
                    Anagrafica
                </Button>

                <Button
                    variant={activeTab === "iscrizione" ? "default" : "ghost"}
                    onClick={() => setActiveTab("iscrizione")}
                    className={`cursor-pointer flex-1 min-w-35 font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${
                        activeTab === "iscrizione"
                            ? "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
                            : "text-muted-foreground"
                    }`}
                >
                    <ClipboardList className="mr-2 h-4 w-4"/>
                    Iscrizione
                </Button>

                <Button
                    variant={activeTab === "squadre" ? "default" : "ghost"}
                    onClick={() => setActiveTab("squadre")}
                    className={`cursor-pointer flex-1 min-w-35 font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${
                        activeTab === "squadre"
                            ? "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
                            : "text-muted-foreground"
                    }`}
                >
                    <Users className="mr-2 h-4 w-4"/>
                    Squadre
                </Button>
            </div>

            {activeTab === "anagrafica" && (
                <AthleteInfo
                    idUser={userId}
                    idAthlete={idAthlete}
                    emailUser={userEmail}
                />
            )}

            {activeTab === "iscrizione" && (
                <SubscriptionTeam
                    idUser={userId}
                    idAthlete={idAthlete}
                />
            )}

            {activeTab === "squadre" && (
                <SubscribedTeam
                    idAthlete={idAthlete}
                    idUser={userId}

                />
            )}
        </div>
    );
}