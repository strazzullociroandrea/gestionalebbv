"use client";

import {authClient} from "@/lib/auth-client";
import {Card} from "@/components/ui/card";
import {api} from "@/lib/api";
import {Users, Calendar, ArrowRight, Loader2} from "lucide-react";
import Link from "next/link";
import {AthleteDocumentAlert} from "@/components/user/athlete-document-alert";

export default function Home() {

    const {data: session, isPending: isSessionLoading} = authClient.useSession();
    const user = session?.user as {
        createdAt: Date,
        email: string,
        emailVerified: boolean,
        id: string,
        image?: string | null | undefined,
        name: string,
        updatedAt: Date
    };

    const {
        data: stats,
        isLoading: isStatsLoading
    } = api.user.getStats.useQuery({userId: user?.id}, {enabled: !!user?.id});

    const {
        data: athletes = [],
        isLoading: isAthletesLoading
    } = api.user.getAllAthletes.useQuery({idUser: user?.id ?? ""}, {enabled: !!user?.id});

    if (isSessionLoading || isStatsLoading || isAthletesLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento in corso...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">Bentornato, {session?.user?.name.toUpperCase()}</h1>
                <p className="text-zinc-500 font-medium text-sm sm:text-base">Panoramica utente.</p>
            </div>

            {athletes.map((athlete) => (
                <AthleteDocumentAlert key={athlete.id} athlete={athlete}/>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-3xl border border-zinc-200 shadow-sm bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-red-50 rounded-2xl text-red-600 border border-red-100">
                            <Calendar className="w-6 h-6"/>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Stagione Attiva</p>
                            <p className="text-2xl font-black text-zinc-950 mt-0.5">{stats?.data?.activeSportSeason || "N/D"}</p>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-3xl border border-zinc-200 shadow-sm bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-red-50 rounded-2xl text-red-600 border border-red-100">
                            <Users className="w-6 h-6"/>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Atleti
                                Associati</p>
                            <p className="text-2xl font-black text-zinc-950 mt-0.5">{athletes.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">I tuoi atleti</h2>
                    <span
                        className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{athletes.length} Registrati</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {athletes.map((athlete) => (
                        <Link key={athlete.id} href={`/athletes/${athlete.id}`} className="group block">
                            <Card
                                className="rounded-2xl border border-zinc-200 shadow-sm bg-white p-5 transition-all duration-300 group-hover:border-red-600/50 group-hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div
                                            className="size-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 font-black text-sm">
                                            {athlete.name?.[0]?.toUpperCase() || ""}{athlete.surname?.[0]?.toUpperCase() || ""}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-zinc-950 truncate text-base group-hover:text-red-600 transition-colors">
                                                {athlete.name} {athlete.surname}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">Scheda
                                                Atleta</p>
                                        </div>
                                    </div>
                                    <div
                                        className="size-8 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all shrink-0">
                                        <ArrowRight className="w-4 h-4"/>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
