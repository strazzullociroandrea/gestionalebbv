"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {authClient} from "@/lib/auth-client";
import {User, Users, ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {AthleteInfo} from "@/components/administrative/athlete-info";
import {SubscribedTeam} from "@/components/administrative/subscribed";

export default function AthletePage() {
    const params = useParams();
    const router = useRouter();

    const idAthlete = (
        params?.id ||
        params?.idAthlete ||
        params?.athletes ||
        (Object.values(params || {})[0] as string) ||
        ""
    ) as string;

    const {data: session, isPending: isSessionLoading} = authClient.useSession();
    const [activeTab, setActiveTab] = useState<"anagrafica" | "squadre">("anagrafica");

    const userId = session?.user?.id as string;
    const userEmail = session?.user?.email;

    if (isSessionLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto p-6 text-center text-zinc-400">
                <p className="animate-pulse font-semibold">Caricamento in corso...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-4 md:p-6 space-y-6 bg-background text-foreground max-w-6xl mx-auto">

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 border border-border rounded-3xl shadow-sm bg-card w-full max-w-2xl">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="cursor-pointer font-bold uppercase tracking-wider text-xs text-muted-foreground hover:text-zinc-950 px-4 h-10 rounded-2xl"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4"/> Indietro
                </Button>

                <Button
                    variant={activeTab === "anagrafica" ? "default" : "ghost"}
                    onClick={() => setActiveTab("anagrafica")}
                    className={`cursor-pointer flex-1 font-bold uppercase tracking-wider text-xs sm:text-sm h-10 rounded-2xl transition-all ${
                        activeTab === "anagrafica"
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            : "text-muted-foreground hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                >
                    <User className="mr-2 h-4 w-4"/>
                    Anagrafica
                </Button>

                <Button
                    variant={activeTab === "squadre" ? "default" : "ghost"}
                    onClick={() => setActiveTab("squadre")}
                    className={`cursor-pointer flex-1 font-bold uppercase tracking-wider text-xs sm:text-sm h-10 rounded-2xl transition-all ${
                        activeTab === "squadre"
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            : "text-muted-foreground hover:bg-zinc-100 hover:text-zinc-950"
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

            {activeTab === "squadre" && (
                <SubscribedTeam
                    idAthlete={idAthlete}
                />
            )}
        </div>
    );
}