"use client";

import {useState} from "react";
import {useParams} from "next/navigation";
import {authClient} from "@/lib/auth-client";
import {User, ClipboardList, Users} from "lucide-react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AthleteInfo} from "@/components/user/athlete-info";

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
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
            <div
                className="flex flex-wrap items-center gap-2 p-1.5 border border-zinc-800 rounded-xl shadow-lg bg-zinc-950">
                <Button
                    variant={activeTab === "anagrafica" ? "default" : "ghost"}
                    onClick={() => setActiveTab("anagrafica")}
                    className={`flex-1 min-w-35 font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${
                        activeTab === "anagrafica"
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                >
                    <User className="mr-2 h-4 w-4"/>
                    Anagrafica
                </Button>

                <Button
                    variant={activeTab === "iscrizione" ? "default" : "ghost"}
                    onClick={() => setActiveTab("iscrizione")}
                    className={`flex-1 min-w-35 font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${
                        activeTab === "iscrizione"
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                >
                    <ClipboardList className="mr-2 h-4 w-4"/>
                    Iscrizione
                </Button>

                <Button
                    variant={activeTab === "squadre" ? "default" : "ghost"}
                    onClick={() => setActiveTab("squadre")}
                    className={`flex-1 min-w-35 font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${
                        activeTab === "squadre"
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                >
                    <Users className="mr-2 h-4 w-4"/>
                    Squadre Iscritte
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
                <Card className="bg-zinc-950 border-zinc-800 text-white p-6">
                    <h3 className="text-lg font-bold text-red-500 uppercase">Modulo Iscrizione Squadra</h3>
                    <p className="text-sm text-zinc-400 mt-1">Sezione gestita per la registrazione ai tornei e
                        campionati agonistici.</p>
                </Card>
            )}

            {activeTab === "squadre" && (
                <Card className="bg-zinc-950 border-zinc-800 text-white p-6">
                    <h3 className="text-lg font-bold text-red-500 uppercase">Squadre Iscritte</h3>
                    <p className="text-sm text-zinc-400 mt-1">Elenco delle selezioni sportive a cui fa parte
                        l'atleta.</p>
                </Card>
            )}
        </div>
    );
}