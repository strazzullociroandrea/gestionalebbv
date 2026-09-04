"use client";

import {authClient} from "@/lib/auth-client";
import {Card} from "@/components/ui/card";
import {api} from "@/lib/api";
import {Users, Calendar, ArrowRight, Loader2} from "lucide-react";
import Link from "next/link";
import {AthleteDocumentAlert} from "@/components/user/athlete-document-alert";

interface UserSession {
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    id: string;
    image?: string | null;
    name: string;
    updatedAt: Date;
}

interface Athlete {
    id: string;
    name: string | null;
    surname: string | null;
}

interface ValidAthlete {
    id: string;
    name: string;
    surname: string;
}

export default function Home() {
    const {data: session, isPending: isSessionLoading} = authClient.useSession();
    const user = session?.user as UserSession | undefined;

    const {
        data: stats,
        isLoading: isStatsLoading,
    } = api.user.getStats.useQuery({userId: user?.id ?? ""}, {enabled: !!user?.id});

    const {
        data: athletes = [],
        isLoading: isAthletesLoading,
    } = api.user.getAllAthletes.useQuery({idUser: user?.id ?? ""}, {enabled: !!user?.id});

    if (isSessionLoading || isStatsLoading || isAthletesLoading) {
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

    const validAthletes: ValidAthlete[] = athletes.filter(
        (athlete: Athlete): athlete is ValidAthlete => athlete.name !== null && athlete.surname !== null
    );

    return (
        <div
            className="w-full max-w-6xl mx-auto px-3 py-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 text-black min-h-screen animate-in fade-in duration-500">
            <Card
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-zinc-200 p-5 sm:p-8 text-black shadow-lg shadow-zinc-200/40">
                <div
                    className="absolute -right-10 -bottom-10 w-36 h-36 sm:w-48 sm:h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none"/>
                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-red-600">Area Personale</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black uppercase truncate">
                        Bentornato, <span className="text-red-600">{user?.name}</span>
                    </h1>
                    <p className="text-zinc-600 font-medium text-xs sm:text-base">
                        Gestisci i tuoi atleti e monitora lo stato della stagione sportiva.
                    </p>
                </div>
            </Card>

            {validAthletes.map((athlete: ValidAthlete) => (
                <AthleteDocumentAlert key={athlete.id} athlete={athlete}/>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Card
                    className="rounded-2xl sm:rounded-3xl border border-zinc-200 shadow-sm sm:shadow-md bg-white text-black p-4 sm:p-6 relative overflow-hidden group hover:border-red-600 transition-all duration-300">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                        <div
                            className="p-3 sm:p-4 bg-red-50 rounded-xl sm:rounded-2xl text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shrink-0">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6"/>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest">Stagione
                                Attiva</p>
                            <p className="text-xl sm:text-2xl font-black text-black mt-0.5 tracking-wide truncate">
                                {stats?.data?.activeSportSeason || "N/D"}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card
                    className="rounded-2xl sm:rounded-3xl border border-zinc-200 shadow-sm sm:shadow-md bg-white text-black p-4 sm:p-6 relative overflow-hidden group hover:border-red-600 transition-all duration-300">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                        <div
                            className="p-3 sm:p-4 bg-red-50 rounded-xl sm:rounded-2xl text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shrink-0">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6"/>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest">Atleti
                                Associati</p>
                            <p className="text-xl sm:text-2xl font-black text-black mt-0.5 tracking-wide truncate">{athletes.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <h2 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-4 sm:h-5 bg-red-600 rounded-full"/>
                        I tuoi atleti
                    </h2>
                    <span
                        className="text-[11px] sm:text-xs font-black text-zinc-600 bg-zinc-100 px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider border border-zinc-200">
                        {athletes.length} Registrati
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {athletes.map((athlete: Athlete) => (
                        <Link key={athlete.id} href={`/athletes/${athlete.id}`} className="group block">
                            <Card
                                className="rounded-xl sm:rounded-2xl border border-zinc-200 shadow-sm bg-white p-4 sm:p-5 transition-all duration-300 group-hover:border-red-600 group-hover:shadow-md group-hover:-translate-y-0.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className="size-10 sm:size-12 rounded-lg sm:rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 font-black text-xs sm:text-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
                                            {athlete.name?.[0]?.toUpperCase() || ""}{athlete.surname?.[0]?.toUpperCase() || ""}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-extrabold text-black truncate text-sm sm:text-base group-hover:text-red-600 transition-colors">
                                                {athlete.name} {athlete.surname}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                                Scheda Atleta
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="size-7 sm:size-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all shrink-0">
                                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
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