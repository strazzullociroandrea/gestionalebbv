"use client";

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {api} from "@/lib/api";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Users, KeyRound, Trophy, Send, Loader2, CheckCircle2, AlertTriangle} from "lucide-react";

export const SubscriptionTeam = ({
                                     idUser,
                                     idAthlete,
                                 }: {
    idUser: string;
    idAthlete: string;
}) => {
    const [selectedTeam, setSelectedTeam] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {data: isActive, isLoading: isActiveLoading} = api.user.isAthleteActive.useQuery(
        {idAthlete},
        {enabled: !!idAthlete}
    );

    const utils = api.useUtils();

    const handleSubscribe = api.user.userTeamSubscribe.useMutation({
        onSuccess: async () => {
            setSuccess(true);
            setErrorMessage(null);
            setSelectedTeam("");
            setPassword("");
            await utils.user.getAvailableTeams.invalidate({idAthlete});
        },
        onError: (error) => {
            setSuccess(false);
            setErrorMessage(error.message || "Si è verificato un errore durante l'iscrizione.");
        },
    });

    const {data: availableTeam, isLoading} = api.user.getAvailableTeams.useQuery(
        {idAthlete},
        {enabled: !!idAthlete}
    );

    const selectedTeamData = availableTeam?.find((item) => item.Team.id === selectedTeam);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccess(false);

        if (!selectedTeam || !password) {
            setErrorMessage("Seleziona una squadra e inserisci la password.");
            return;
        }

        handleSubscribe.mutate({
            idAthlete,
            idUser,
            idTeam: selectedTeam,
            subscibePassword: password,
        });
    };

    if (isActiveLoading || isLoading || handleSubscribe.isPending) {
        return (
            <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-8">
                <Card
                    className="border border-zinc-200 bg-white p-12 text-center text-zinc-500 shadow-sm rounded-2xl sm:rounded-3xl w-full">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-red-600"/>
                    <p className="font-extrabold tracking-widest uppercase text-xs">Caricamento in corso...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-black">
            <Card
                className="border border-zinc-200 bg-white shadow-lg shadow-zinc-200/40 rounded-2xl sm:rounded-3xl w-full overflow-hidden relative">
                <div className="h-1.5 bg-red-600 w-full"/>

                <CardContent className="p-5 sm:p-8 lg:p-10 space-y-6">
                    <div className="flex items-start sm:items-center gap-4 pb-6 border-b border-zinc-100">
                        <div className="bg-red-50 p-3 sm:p-4 rounded-2xl border border-red-100 shrink-0 shadow-inner">
                            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-red-600"/>
                        </div>
                        <div>
                            <span
                                className="text-[11px] sm:text-xs font-black text-red-600 uppercase tracking-widest block">
                                Area Squadre
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight mt-0.5">
                                Iscrizione Squadra
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
                                Seleziona una delle squadre disponibili e inserisci la password di conferma.
                            </p>
                        </div>
                    </div>

                    {success && (
                        <div
                            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/>
                            <span>Iscrizione completata con successo!</span>
                        </div>
                    )}

                    {errorMessage && (
                        <div
                            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0"/>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-zinc-50/80 p-4 sm:p-6 rounded-2xl border border-zinc-200/80 space-y-5">
                            <div className="space-y-2">
                                <Label
                                    className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                                    <Users className="w-4 h-4 text-red-600 shrink-0"/>
                                    Squadra Disponibile
                                </Label>
                                <Select
                                    disabled={isLoading || availableTeam?.length === 0 || !isActive || isActiveLoading}
                                    value={!isActive ? "Atleta non attivo" : availableTeam?.length === 0 ? "Nessuna squadra trovata" : selectedTeam}
                                    onValueChange={(val) => {
                                        setSelectedTeam(val ?? "");
                                        if (errorMessage) setErrorMessage(null);
                                    }}
                                >
                                    <SelectTrigger
                                        className="w-full bg-white border-zinc-200 text-zinc-900 focus:ring-red-600 focus:border-red-600 h-11 sm:h-12 rounded-xl transition-all font-semibold text-xs sm:text-sm">
                                        <SelectValue
                                            placeholder={isLoading ? "Caricamento squadre..." : "Seleziona la squadra"}>
                                            {selectedTeamData ? `${selectedTeamData.Team.name} - ${selectedTeamData.SportSeason.season}` : undefined}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent
                                        className="bg-white border-zinc-200 text-zinc-900 rounded-2xl shadow-xl">
                                        <SelectGroup className="p-1">
                                            {availableTeam?.map((item) => (
                                                <SelectItem
                                                    key={item.Team.id}
                                                    value={item.Team.id}
                                                    className="focus:bg-red-50 focus:text-red-700 cursor-pointer rounded-xl my-1 py-2.5 font-bold text-xs sm:text-sm"
                                                >
                                                    {`${item.Team.name} - ${item.SportSeason.season}`}
                                                </SelectItem>
                                            ))}
                                            {availableTeam?.length === 0 && (
                                                <div
                                                    className="p-4 text-xs text-center text-zinc-400 font-bold uppercase tracking-wider">
                                                    Nessuna squadra disponibile per questo atleta
                                                </div>
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                                    <KeyRound className="w-4 h-4 text-red-600 shrink-0"/>
                                    Password di Conferma
                                </Label>
                                <Input
                                    disabled={isLoading || availableTeam?.length === 0 || !isActive || isActiveLoading}
                                    type="password"
                                    placeholder={
                                        availableTeam?.length === 0
                                            ? "Nessuna squadra disponibile"
                                            : "Inserisci la password"
                                    }
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errorMessage) setErrorMessage(null);
                                    }}
                                    className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-red-600 focus-visible:border-red-600 h-11 sm:h-12 rounded-xl transition-all font-medium text-xs sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button
                                type="submit"
                                disabled={!selectedTeam || !password || handleSubscribe.isPending}
                                className="w-full sm:w-auto bg-black hover:bg-zinc-900 text-white font-extrabold h-11 sm:h-12 px-8 rounded-xl uppercase tracking-wider text-xs shadow-md shadow-zinc-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {handleSubscribe.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                        Invio in corso...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4"/>
                                        Invia Iscrizione
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};