"use client";

import {useParams, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {ArrowLeft, User, Users} from "lucide-react";
import {useState} from "react";
import {UserInfo} from "@/components/administrative/user-info";
import {AssociateAthletes} from "@/components/administrative/associate-athletes";

export default function TeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"anagrafica" | "atleti">("anagrafica");

    const idUser = (
        params?.id ||
        params?.userId ||
        params?.user ||
        (Object.values(params || {})[0] as string) ||
        ""
    ) as string;


    return (
        <div
            className="min-h-screen flex flex-col items-center p-4 md:p-6 space-y-6 bg-background text-foreground max-w-6xl mx-auto">

            <div
                className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 border border-border rounded-3xl shadow-sm bg-card w-full max-w-2xl">
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
                    variant={activeTab === "atleti" ? "default" : "ghost"}
                    onClick={() => setActiveTab("atleti")}
                    className={`cursor-pointer flex-1 font-bold uppercase tracking-wider text-xs sm:text-sm h-10 rounded-2xl transition-all ${
                        activeTab === "atleti"
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            : "text-muted-foreground hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                >
                    <Users className="mr-2 h-4 w-4"/>
                    Atleti
                </Button>
            </div>

            {activeTab === "anagrafica" && (
                <UserInfo idUser={idUser}/>

            )}

            {activeTab === "atleti" && (
                <AssociateAthletes idUser={idUser}/>
            )}
        </div>
    );
}