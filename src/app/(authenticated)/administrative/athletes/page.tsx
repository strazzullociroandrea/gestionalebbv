"use client";

import {useState} from "react";
import {authClient} from "@/lib/auth-client";
import {api} from "@/lib/api";
import {ArrowRight, Loader2, Search, UserX} from "lucide-react";
import Link from "next/link";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";

export default function AthletesPage() {
    const {data: session, isPending: isSessionLoading} = authClient.useSession();
    const user = session?.user as any;

    const [searchTerm, setSearchTerm] = useState("");

    const {
        data: athletes = [],
        isLoading: isAthletesLoading
    } = api.administrative.getAllAthletes.useQuery({idUser: user?.id ?? ""}, {enabled: !!user?.id});

    const filteredAthletes = athletes.filter((athlete) =>
        athlete.surname?.toLowerCase().includes(searchTerm.toLowerCase()) || athlete.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isSessionLoading || isAthletesLoading) {
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
                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">Atleti</h1>
                <p className="text-zinc-500 font-medium text-sm sm:text-base">
                    Anagrafica, certificati medici, stato tesseramento.
                </p>
            </div>

            <div className="space-y-6">
                <div
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="relative w-full sm:max-w-xs">
                        <span
                            className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Search className="w-4 h-4"/>
                        </span>
                        <Input
                            placeholder="Cerca per cognome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 pl-10 text-sm font-medium focus:border-red-500 focus:ring-0 text-zinc-900"
                        />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 px-1">
                        <h2 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">Elenco Atleti</h2>
                        <span
                            className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-3 py-1.5 rounded-xl">
                            {filteredAthletes.length} di {athletes.length}
                        </span>
                    </div>
                </div>

                {filteredAthletes.length === 0 ? (
                    <div
                        className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center flex flex-col items-center justify-center">
                        <div
                            className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 shadow-2xs">
                            <UserX className="w-5 h-5 text-red-600"/>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900">Nessun atleta trovato</h3>
                        <p className="text-sm text-zinc-500 max-w-sm mt-1">
                            Nessun atleta corrisponde al cognome "{searchTerm}".
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAthletes.map((athlete) => (
                            <Link key={athlete.id} href={`/administrative/athletes/${athlete.id}`}
                                  className="group block">
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
                                                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">{athlete.status}</p>
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
                )}
            </div>
        </div>
    );
}