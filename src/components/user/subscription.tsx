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
            <Card
                className="border-zinc-200 bg-white p-8 sm:p-12 text-center text-zinc-500 shadow-sm rounded-2xl w-full">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-red-600"/>
                <p className="font-semibold tracking-wide uppercase text-xs">Caricamento in corso...</p>
            </Card>
        );
    }


    return (
        <Card
            className="border border-zinc-200 bg-white text-zinc-900 overflow-hidden p-0 shadow-lg rounded-2xl relative w-full">
            <div className="h-2 w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500"/>

            <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 shadow-sm">
                        <Trophy className="w-6 h-6"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-wide uppercase text-zinc-900">
                            Iscrizione Squadra
                        </h2>
                        <p className="text-xs text-zinc-500 font-medium">
                            Seleziona una delle squadre disponibili e inserisci la password di conferma
                        </p>
                    </div>
                </div>

                {success && (
                    <div
                        className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/>
                        <span>Iscrizione completata con successo!</span>
                    </div>
                )}

                {errorMessage && (
                    <div
                        className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0"/>
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label
                            className="text-xs font-semibold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-red-600"/>
                            Squadra
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
                                className="w-full bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-red-600 focus:border-red-600 h-11 rounded-xl transition-all">
                                <SelectValue
                                    placeholder={isLoading ? "Caricamento squadre..." : "Seleziona la squadra"}>
                                    {selectedTeamData ? `${selectedTeamData.Team.name} - ${selectedTeamData.SportSeason.season}` : undefined}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-zinc-200 text-zinc-900 rounded-xl shadow-xl">
                                <SelectGroup>
                                    {availableTeam?.map((item) => (
                                        <SelectItem
                                            key={item.Team.id}
                                            value={item.Team.id}
                                            className="focus:bg-red-50 focus:text-red-600 cursor-pointer rounded-lg my-0.5 font-medium"
                                        >
                                            {`${item.Team.name} - ${item.SportSeason.season}`}
                                        </SelectItem>
                                    ))}
                                    {availableTeam?.length === 0 && (
                                        <div className="p-3 text-xs text-center text-zinc-400">
                                            Nessuna squadra disponibile per questo atleta
                                        </div>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label
                            className="text-xs font-semibold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4 text-red-600"/>
                            Password
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
                            className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-red-600 focus-visible:border-red-600 h-11 rounded-xl transition-all"
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={!selectedTeam || !password || handleSubscribe.isPending}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 rounded-xl uppercase tracking-wider text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
};