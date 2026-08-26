"use client";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {ClipboardList, User, Users} from "lucide-react";
import {SubscriptionTeam} from "@/components/user/subscription";
import {SubscribedTeam} from "@/components/user/subscribed";
import {AthleteCreate} from "@/components/user/athlete-create";
import {authClient} from "@/lib/auth-client";
export const dynamic = "force-dynamic";

export default function AddAthletePage() {

    const [createdId, setCreatedId] = useState<undefined | string>(undefined);
    const [activeTab, setActiveTab] = useState<"anagrafica" | "iscrizione" | "squadre">("anagrafica");
    const {data: session, isPending: isSessionLoading} = authClient.useSession();
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
                    disabled={!createdId}
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
                    disabled={!createdId}
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
                <AthleteCreate
                    idUser={userId}
                    emailUser={userEmail}
                    setIdAthlete={setCreatedId}
                />
            )}

            {activeTab === "iscrizione" && (
                <SubscriptionTeam
                    idUser={userId}
                    idAthlete={createdId || ""}
                />
            )}

            {activeTab === "squadre" && (
                <SubscribedTeam
                    idAthlete={createdId || ""}
                    idUser={userId}

                />
            )}

        </div>
    )
}