"use client";

import {useState} from "react";
import {api} from "@/lib/api";
import {Plus, Trophy, AlertTriangle, Users, ChevronRight, Loader2, Calendar, KeyRound, Check, Search, UserX} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function TeamsPage() {
    const [open, setOpen] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [subscribePassword, setSubscribePassword] = useState("");
    const [password, setPassword] = useState("");
    const [selectedSeasonId, setSelectedSeasonId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const utils = api.useUtils();

    const {data: seasons, isLoading: seasonsLoading} = api.administrative.getSeason.useQuery();
    const {data: teams = [], isLoading: teamsLoading} = api.administrative.getAllTeams.useQuery();

    const activeSeasonId = seasons?.find((s) => s.status === "active")?.id || seasons?.[0]?.id || "";
    const currentFormSeasonId = selectedSeasonId || activeSeasonId;

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let pass = "";
        for (let i = 0; i < 6; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };

    const handleGenerateForForm = () => {
        setSubscribePassword(generatePassword());
    };

    const handleCopyPassword = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredTeams = teams.filter((item) =>
        item.team.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="w-full max-w-6xl mx-auto p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento in corso...</p>
            </div>
        );
    }

    const selectedSeasonObj = seasons?.find((s) => s.id === currentFormSeasonId);

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">

            <Dialog onOpenChange={handleOpenChange} open={open}>
                <DialogContent className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                            Aggiungi Nuova Squadra
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 font-medium">
                            Crea una nuova squadra associandola alla stagione <span className="text-zinc-900 font-bold">{selectedSeasonObj?.season || ""}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs font-semibold">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0"/>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="seasonSelect" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                                Seleziona Stagione
                            </Label>
                            <select
                                id="seasonSelect"
                                value={currentFormSeasonId}
                                onChange={(e) => setSelectedSeasonId(e.target.value)}
                                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-red-500"
                            >
                                {seasons?.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        Stagione {s.season} {s.status === "active" ? "(Attiva)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="teamName" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                                Nome Squadra
                            </Label>
                            <Input
                                id="teamName"
                                type="text"
                                placeholder="es. Under 17 Elite"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="h-11 bg-white border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 focus:border-red-500 focus:ring-0"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between pl-1">
                                <Label htmlFor="subscribePassword" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    Password Iscrizione
                                </Label>
                                <button
                                    type="button"
                                    onClick={handleGenerateForForm}
                                    className="text-[10px] font-extrabold text-red-600 hover:text-red-700 uppercase tracking-wider cursor-pointer"
                                >
                                    Genera automatica
                                </button>
                            </div>
                            <Input
                                id="subscribePassword"
                                type="text"
                                placeholder="••••••••"
                                value={subscribePassword}
                                onChange={(e) => setSubscribePassword(e.target.value)}
                                className="h-11 bg-white border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 focus:border-red-500 focus:ring-0 font-mono"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                                Password Gestione Squadra
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 bg-white border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 focus:border-red-500 focus:ring-0"
                                required
                            />
                        </div>

                        <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer"
                                onClick={() => handleOpenChange(false)}
                            >
                                Annulla
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer"
                                disabled={createTeamHandler.isPending}
                            >
                                {createTeamHandler.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma e Crea"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">Squadre</h1>
                    <p className="text-zinc-500 font-medium text-sm sm:text-base">
                        Monitora e gestisci le squadre della società.
                    </p>
                </div>

                <Button
                    className="cursor-pointer w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-5 rounded-xl shadow-sm transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                    onClick={() => setOpen(true)}
                >
                    <Plus className="w-4 h-4"/>
                    Aggiungi Squadra
                </Button>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="relative w-full sm:max-w-xs">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Search className="w-4 h-4"/>
                        </span>
                        <Input
                            placeholder="Cerca squadra..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 pl-10 text-sm font-medium focus:border-red-500 focus:ring-0 text-zinc-900"
                        />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 px-1">
                        <h2 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">Elenco Squadre</h2>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-3 py-1.5 rounded-xl">
                            {filteredTeams.length} di {teams.length}
                        </span>
                    </div>
                </div>

                {filteredTeams.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 shadow-2xs">
                            <UserX className="w-5 h-5 text-red-600"/>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900">Nessuna squadra trovata</h3>
                        <p className="text-sm text-zinc-500 max-w-sm mt-1">
                            Nessuna squadra corrisponde alla ricerca "{searchTerm}".
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTeams.map((item, index) => {
                            const team = item.team;
                            const season = item.season;

                            return (
                                <Card
                                    key={team.id || index}
                                    className="rounded-2xl border border-zinc-200 shadow-sm bg-white p-5 transition-all duration-300 hover:border-red-600/50 hover:shadow-md flex flex-col justify-between space-y-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="size-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0">
                                                <Trophy className="w-5 h-5"/>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-extrabold text-zinc-950 text-base truncate">
                                                    {team.name}
                                                </h3>
                                                <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mt-0.5 block">
                                                    Stagione {season?.season || "N/D"}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/administrative/${team.id}`}
                                            className="size-8 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shrink-0"
                                            title="Gestisci squadra"
                                        >
                                            <ChevronRight className="w-4 h-4"/>
                                        </Link>
                                    </div>

                                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <KeyRound className="w-3.5 h-3.5 text-red-600 shrink-0"/>
                                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Pass:</span>
                                            <span className="text-xs font-mono font-bold text-zinc-800 truncate">
                                                {team.subscribePassword || "N/D"}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleCopyPassword(team.subscribePassword || "", team.id)}
                                            className="h-7 w-7 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg shrink-0 cursor-pointer"
                                            title="Copia password"
                                        >
                                            {copiedId === team.id ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <KeyRound className="w-3.5 h-3.5"/>}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}