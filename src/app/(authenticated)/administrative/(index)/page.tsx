"use client";

import {authClient} from "@/lib/auth-client";
import {Calendar, Loader2, Users, Trophy} from "lucide-react";
import {Card} from "@/components/ui/card";
import {api} from "@/lib/api";

export default function HomePage() {
    const {data: session, isPending: isSessionLoading} = authClient.useSession();

    const {data: stats, isLoading: isStatsLoading} = api.administrative.getStats.useQuery();

    const user = session?.user as {
        createdAt: Date;
        email: string;
        emailVerified: boolean;
        id: string;
        image?: string | null | undefined;
        name: string;
        updatedAt: Date;
    };

    if (isSessionLoading || isStatsLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin"/>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Caricamento in corso...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">Bentornato, {user?.name.toUpperCase()}</h1>
                <p className="text-zinc-500 font-medium text-sm sm:text-base">Panoramica amministrativa.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card
                    className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div
                            className="p-3.5 bg-red-50 rounded-2xl text-red-600 border border-red-100 shadow-sm shrink-0">
                            <Calendar className="w-6 h-6"/>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest truncate">Stagione
                                Attiva</p>
                            <p className="text-2xl font-black text-zinc-950 mt-0.5 tracking-tight">{stats?.activeSeason}</p>
                        </div>
                    </div>
                </Card>

                <Card
                    className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div
                            className="p-3.5 bg-orange-50 rounded-2xl text-orange-600 border border-orange-100 shadow-sm shrink-0">
                            <Users className="w-6 h-6"/>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest truncate">Atleti
                                Registrati</p>
                            <p className="text-2xl font-black text-zinc-950 mt-0.5 tracking-tight">{stats?.athleteNumber}</p>
                        </div>
                    </div>
                </Card>

                <Card
                    className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div
                            className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                            <Trophy className="w-6 h-6"/>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest truncate">Squadre</p>
                            <p className="text-2xl font-black text-zinc-950 mt-0.5 tracking-tight">{stats?.teamNumber}</p>
                        </div>
                    </div>
                </Card>

            </div>


        </div>
    );
}