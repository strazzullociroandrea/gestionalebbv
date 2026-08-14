"use client";

import {Button} from "@/components/ui/button";
import {Plus, Calendar, AlertTriangle, Loader2, Trash2, Search, CalendarOff} from "lucide-react";
import {useState} from "react";
import {api} from "@/lib/api";
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

export default function Season() {
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [seasonName, setSeasonName] = useState("");
    const [renewalFee, setRenewalFee] = useState("");
    const [newFee, setNewFee] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const utils = api.useUtils();

    const {data: seasons = [], isLoading} = api.administrative.getSeason.useQuery();

    const filteredSeasons = seasons.filter((season: any) =>
        season.season?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const createSeasonHandler = api.administrative.addSeason.useMutation({
        onSuccess: async () => {
            setError("");
            setOpen(false);
            await utils.administrative.getSeason.invalidate();
            setSeasonName("");
            setNewFee("");
            setRenewalFee("");
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const deleteSeasonHandler = api.administrative.deleteSeason.useMutation({
        onSuccess: async () => {
            setDeleteId(null);
            await utils.administrative.getSeason.invalidate();
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        createSeasonHandler.mutate({
            seasonName,
            newFee: parseFloat(newFee),
            renewalFee: parseFloat(renewalFee)
        });
    };

    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (!value) {
            setError("");
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento in corso...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">

            <Dialog onOpenChange={handleOpenChange} open={open}>
                <DialogContent className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                            Aggiungi Nuova Stagione
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 font-medium">
                            Inserisci il nome e i relativi costi di iscrizione per la nuova stagione sportiva.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-xs font-medium">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"/>
                        <span>Una volta creata una nuova stagione, la precedente verrà chiusa e non sarà più possibile attivarla.</span>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs font-semibold">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0"/>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="season" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                                Nome Stagione
                            </Label>
                            <Input
                                id="season"
                                type="text"
                                placeholder="es. 2026 / 2027"
                                value={seasonName}
                                onChange={(e) => setSeasonName(e.target.value)}
                                className="h-11 bg-white border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 focus:border-red-500 focus:ring-0"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="newFee" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                                Costo Nuova Iscrizione (€)
                            </Label>
                            <Input
                                id="newFee"
                                type="number"
                                step="0.01"
                                placeholder="100.00"
                                value={newFee}
                                onChange={(e) => setNewFee(e.target.value)}
                                className="h-11 bg-white border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 focus:border-red-500 focus:ring-0"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="renewalFee" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                                Costo Rinnovo Iscrizione (€)
                            </Label>
                            <Input
                                id="renewalFee"
                                type="number"
                                step="0.01"
                                placeholder="100.00"
                                value={renewalFee}
                                onChange={(e) => setRenewalFee(e.target.value)}
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
                                disabled={createSeasonHandler.isPending}
                            >
                                {createSeasonHandler.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma e Crea"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(deleteId)} onOpenChange={(val) => !val && setDeleteId(null)}>
                <DialogContent className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                            Elimina Stagione
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 font-medium">
                            Sei sicuro di voler eliminare questa stagione chiusa? L'azione è irreversibile.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer"
                            onClick={() => setDeleteId(null)}
                        >
                            Annulla
                        </Button>
                        <Button
                            type="button"
                            className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer"
                            disabled={deleteSeasonHandler.isPending}
                            onClick={() => deleteId && deleteSeasonHandler.mutate({idSeason: deleteId})}
                        >
                            {deleteSeasonHandler.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma Eliminazione"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">Stagioni sportive</h1>
                    <p className="text-zinc-500 font-medium text-sm sm:text-base">
                        Organizza, monitora e gestisci le stagioni della società.
                    </p>
                </div>

                <Button
                    className="cursor-pointer w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-5 rounded-xl shadow-sm transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                    onClick={() => setOpen(true)}
                >
                    <Plus className="w-4 h-4"/>
                    Aggiungi Stagione
                </Button>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="relative w-full sm:max-w-xs">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Search className="w-4 h-4"/>
                        </span>
                        <Input
                            placeholder="Cerca stagione..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 pl-10 text-sm font-medium focus:border-red-500 focus:ring-0 text-zinc-900"
                        />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 px-1">
                        <h2 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">Elenco Stagioni</h2>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-3 py-1.5 rounded-xl">
                            {filteredSeasons.length} di {seasons.length}
                        </span>
                    </div>
                </div>

                {filteredSeasons.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 shadow-2xs">
                            <CalendarOff className="w-5 h-5 text-red-600"/>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900">Nessuna stagione trovata</h3>
                        <p className="text-sm text-zinc-500 max-w-sm mt-1">
                            Nessuna stagione corrisponde alla ricerca "{searchTerm}".
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSeasons.map((season: any, index: number) => {
                            const isActive = season.status === "active";
                            return (
                                <Card
                                    key={season.id || index}
                                    className="rounded-2xl border border-zinc-200 shadow-sm bg-white p-5 transition-all duration-300 hover:border-red-600/50 hover:shadow-md flex flex-col justify-between space-y-6"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="size-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0">
                                                <Calendar className="w-5 h-5"/>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-extrabold text-zinc-950 text-base truncate">
                                                    {season.season}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                isActive
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                    : "bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                                            }`}>
                                                {isActive ? "Attiva" : "Chiusa"}
                                            </span>
                                            {!isActive && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteId(season.id)}
                                                    className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                                                    title="Elimina stagione"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100">
                                        <div className="bg-zinc-50/60 p-3 rounded-xl border border-zinc-100">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Costo Iscrizione</span>
                                            <span className="font-extrabold text-zinc-900 text-sm">€ {Number(season.newFee).toFixed(2)}</span>
                                        </div>
                                        <div className="bg-zinc-50/60 p-3 rounded-xl border border-zinc-100">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Costo Rinnovo</span>
                                            <span className="font-extrabold text-zinc-900 text-sm">€ {Number(season.renewalFee).toFixed(2)}</span>
                                        </div>
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