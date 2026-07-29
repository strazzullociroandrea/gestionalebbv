"use client";

import {Button} from "@/components/ui/button";
import {Calendar, Plus, Trophy, AlertTriangle, Users} from "lucide-react";
import {useState} from "react";
import {api} from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function Home() {
    const [open, setOpen] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [subscribePassword, setSubscribePassword] = useState("");
    const [password, setPassword] = useState("");
    const [selectedSeasonId, setSelectedSeasonId] = useState("");
    const [error, setError] = useState("");
    const utils = api.useUtils();

    const {data: seasons, isLoading: seasonsLoading} = api.administrative.getSeason.useQuery();
    const {data: teams, isLoading: teamsLoading} = api.administrative.getAllTeams.useQuery();

    const activeSeasonId = seasons?.find((s) => s.status === "active")?.id || seasons?.[0]?.id || "";
    const currentFormSeasonId = selectedSeasonId || activeSeasonId;

    const createTeamHandler = api.administrative.addTeam.useMutation({
        onSuccess: async () => {
            setError("");
            setOpen(false);
            await utils.administrative.getAllTeams.invalidate();
            setTeamName("");
            setSubscribePassword("");
            setPassword("");
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        createTeamHandler.mutate({
            name: teamName,
            subscribePassword,
            password,
            idSeason: currentFormSeasonId,
        });
    };

    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (!value) {
            setError("");
        }
    };

    if (teamsLoading || seasonsLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Le squadre
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Monitora e gestisci le squadre della società.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                        <Calendar className="w-6 h-6 animate-pulse"/>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">Caricamento squadre...</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
                        Attendere prego.
                    </p>
                </div>
            </div>
        )
    }

    const selectedSeasonObj = seasons?.find((s) => s.id === currentFormSeasonId);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

            <Dialog onOpenChange={handleOpenChange} open={open}>
                <DialogContent className="sm:max-w-md w-[95%] rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Aggiungi Nuova Squadra</DialogTitle>
                        <DialogDescription>
                            Crea una nuova squadra associandola alla stagione {selectedSeasonObj?.season || ""}.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 text-sm animate-in fade-in">
                            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5"/>
                            <div>
                                <span className="font-semibold block mb-0.5">Errore</span>
                                {error}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <label htmlFor="seasonSelect" className="text-sm font-medium text-slate-700">
                                Seleziona Stagione
                            </label>
                            <select
                                id="seasonSelect"
                                value={currentFormSeasonId}
                                onChange={(e) => setSelectedSeasonId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                                {seasons?.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        Stagione {s.season} {s.status === "active" ? "(Attiva)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="teamName" className="text-sm font-medium text-slate-700">
                                Nome Squadra
                            </label>
                            <input
                                id="teamName"
                                type="text"
                                placeholder="es. Under 17 Elite"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="subscribePassword" className="text-sm font-medium text-slate-700">
                                Password Iscrizione
                            </label>
                            <input
                                id="subscribePassword"
                                type="password"
                                placeholder="••••••••"
                                value={subscribePassword}
                                onChange={(e) => setSubscribePassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                required
                            />
                        </div>

                        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto cursor-pointer"
                                onClick={() => handleOpenChange(false)}
                            >
                                Annulla
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto cursor-pointer"
                                disabled={createTeamHandler.isPending}
                            >
                                {createTeamHandler.isPending ? "Creazione in corso..." : "Conferma e Crea"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            Le squadre
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Monitora e gestisci le squadre della società
                    </p>
                </div>
                <Button
                    className="cursor-pointer w-full sm:w-auto gap-2 shadow-sm transition-all hover:shadow"
                    onClick={() => setOpen(true)}
                >
                    <Plus className="w-4 h-4"/>
                    Aggiungi Squadra
                </Button>
            </div>

            {!teams || teams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                        <Users className="w-6 h-6"/>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">Nessuna squadra trovata</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
                        Inizia aggiungendo una nuova squadra sportiva.
                    </p>
                    <Button variant="outline" size="sm" className="gap-2 cursor-pointer" onClick={() => setOpen(true)}>
                        <Plus className="w-4 h-4"/>
                        Crea la prima squadra
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((item, index) => {
                        const team = item.team;
                        const season = item.season;

                        return (
                            <div key={team.id || index} className="rounded-xl border bg-white p-4 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                            <Trophy className="w-5 h-5"/>
                                        </div>
                                        <span className="font-semibold text-slate-900 text-lg">
                                            {team.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t text-sm flex items-center justify-between">
                                    <span className="text-slate-500 text-xs">Stagione associata</span>
                                    <span className="font-medium text-slate-800">
                                        {season?.season || "N/D"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}