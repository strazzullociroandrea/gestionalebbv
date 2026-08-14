"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {api} from "@/lib/api";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card} from "@/components/ui/card";
import {ArrowLeft, Trophy, KeyRound, Check, RefreshCw, UserX, ArrowRight, Loader2} from "lucide-react";
import Link from "next/link";

export default function TeamDetailPage() {
    const params = useParams();
    const router = useRouter();

    const idTeam = (
        params?.id ||
        params?.idTeam ||
        params?.teams ||
        (Object.values(params || {})[0] as string) ||
        ""
    ) as string;

    const [copied, setCopied] = useState(false);
    const utils = api.useUtils();

    const {
        data: infoTeam,
        isLoading: isInfoTeamLoading
    } = api.administrative.getInfoTeam.useQuery({
        idTeam
    }, {
        enabled: !!idTeam
    });

    const updatePasswordMutation = api.administrative.updateTeamPassword.useMutation({
        onSuccess: async () => {
            await utils.administrative.getInfoTeam.invalidate({idTeam});
        },
        onError: (error) => {
            console.error("Errore durante l'aggiornamento della password:", error);
        }
    });

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let pass = "";
        for (let i = 0; i < 6; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };

    const handleRegeneratePassword = () => {
        const newPass = generatePassword();
        updatePasswordMutation.mutate({
            idTeam,
            subscribePassword: newPass
        });
    };

    const handleCopyPassword = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isInfoTeamLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento informazioni...</p>
            </div>
        );
    }

    const teamData = infoTeam?.teamInfo?.[0]?.team;
    const seasonName = infoTeam?.teamInfo?.[0]?.season;
    const athletes = infoTeam?.athletes || [];

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="cursor-pointer font-bold uppercase tracking-wider text-xs text-zinc-500 hover:text-zinc-950 px-4 h-10 rounded-2xl border border-zinc-200 bg-white shadow-xs"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4"/> Indietro
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">Gestione Squadra</h1>
                    <p className="text-zinc-500 font-medium text-sm sm:text-base">
                        Monitora e gestisci le informazioni e gli atleti della squadra.
                    </p>
                </div>
            </div>

            <Card className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600"/>

                <div className="space-y-6">
                    <div className="flex items-center gap-3.5">
                        <div className="size-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                            <Trophy className="w-6 h-6"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">Informazioni Generali</h2>
                            <p className="text-xs text-zinc-500 font-medium">Dettagli e credenziali di accesso</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Nome Squadra</label>
                            <Input
                                value={teamData?.name || ""}
                                readOnly
                                className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Stagione</label>
                            <Input
                                value={seasonName || "N/D"}
                                readOnly
                                className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Password Iscrizione</label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={teamData?.subscribePassword || ""}
                                    readOnly
                                    className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-mono font-bold text-zinc-900"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleCopyPassword(teamData?.subscribePassword || "")}
                                    className="h-11 w-11 shrink-0 rounded-xl border-zinc-200 hover:bg-zinc-100 cursor-pointer"
                                    title="Copia password"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-600"/> : <KeyRound className="w-4 h-4 text-zinc-600"/>}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRegeneratePassword}
                                    disabled={updatePasswordMutation.isPending}
                                    className="h-11 w-11 shrink-0 rounded-xl border-zinc-200 hover:bg-zinc-100 cursor-pointer"
                                    title="Rigenera password"
                                >
                                    {updatePasswordMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-zinc-600"/>
                                    ) : (
                                        <RefreshCw className="w-4 h-4 text-zinc-600"/>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <h2 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">Elenco Atleti</h2>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-3 py-1.5 rounded-xl">
                        {athletes.length} atleti
                    </span>
                </div>

                {athletes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 shadow-2xs">
                            <UserX className="w-5 h-5 text-red-600"/>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900">Nessun atleta trovato</h3>
                        <p className="text-sm text-zinc-500 max-w-sm mt-1">
                            Invia alla squadra la password di iscrizione per permettere agli atleti di registrarsi.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {athletes.map((athlete) => (
                            <Link key={athlete.Athlete.id} href={`/administrative/athletes/${athlete.Athlete.id}`} className="group block">
                                <Card className="rounded-2xl border border-zinc-200 shadow-sm bg-white p-5 transition-all duration-300 group-hover:border-red-600/50 group-hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="size-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 font-black text-sm">
                                                {athlete.Athlete.name?.[0]?.toUpperCase() || ""}{athlete.Athlete.surname?.[0]?.toUpperCase() || ""}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-zinc-950 truncate text-base group-hover:text-red-600 transition-colors">
                                                    {athlete.Athlete.name} {athlete.Athlete.surname}
                                                </p>
                                                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
                                                    {athlete.Athlete.status === "active" ? "Attivo" : "Non attivo"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="size-8 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all shrink-0">
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