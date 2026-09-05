"use client";

import {authClient} from "@/lib/auth-client";
import {Calendar, Loader2, Users, Trophy} from "lucide-react";
import {Card} from "@/components/ui/card";
import {api} from "@/lib/api";

interface UserType {
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    id: string;
    image?: string | null;
    name: string;
    updatedAt: Date;
}

export default function HomePage() {
    const {data: session, isPending: isSessionLoading} = authClient.useSession();

    const {data: stats, isLoading: isStatsLoading} = api.administrative.getStats.useQuery();

    const user = session?.user as UserType | undefined;

    if (isSessionLoading || isStatsLoading) {
        return (
            <div
                className="w-full max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-black">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-extrabold uppercase tracking-widest text-xs">
                    Caricamento in corso...
                </p>
            </div>
        );
    }

    return (
        <div
            className="w-full max-w-6xl mx-auto px-3 py-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 text-black min-h-screen animate-in fade-in duration-500">
            <Card
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-zinc-200 p-5 sm:p-8 text-black shadow-lg shadow-zinc-200/40">
                <div
                    className="absolute -right-10 -bottom-10 w-36 h-36 sm:w-48 sm:h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none"/>
                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-red-600">Area Amministrativa</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black uppercase truncate">
                        Bentornato, <span className="text-red-600">{user?.name}</span>
                    </h1>
                    <p className="text-zinc-600 font-medium text-xs sm:text-base">
                        Gestisci i tuoi atleti e monitora lo stato della stagione sportiva.
                    </p>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card
                    className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div
                            className="p-3.5 bg-red-50 rounded-2xl text-red-600 border border-red-100 shadow-sm shrink-0">
                            <Calendar className="w-6 h-6"/>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest truncate">
                                Stagione Attiva
                            </p>
                            <p className="text-2xl font-black text-zinc-950 mt-0.5 tracking-tight">
                                {stats?.activeSeason ?? "-"}
                            </p>
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
                            <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest truncate">
                                Atleti Registrati
                            </p>
                            <p className="text-2xl font-black text-zinc-950 mt-0.5 tracking-tight">
                                {stats?.athleteNumber ?? "-"}
                            </p>
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
                            <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest truncate">
                                Squadre
                            </p>
                            <p className="text-2xl font-black text-zinc-950 mt-0.5 tracking-tight">
                                {stats?.teamNumber ?? "-"}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}