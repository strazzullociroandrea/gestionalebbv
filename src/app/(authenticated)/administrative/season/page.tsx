"use client";
import {Button} from "@/components/ui/button"
import {Plus, Calendar, AlertTriangle} from "lucide-react"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function Season() {
    const [open, setOpen] = useState(false);
    const [seasonName, setSeasonName] = useState("");
    const [renewalFee, setRenewalFee] = useState("");
    const [newFee, setNewFee] = useState("");
    const [error, setError] = useState("");
    const utils = api.useUtils();

    const {data: seasons, isLoading} = api.administrative.getSeason.useQuery();

    const createSeasonHandler = api.administrative.addSeason.useMutation({
        onSuccess: async (data) => {
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
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Stagioni Sportive
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Organizza, monitora e gestisci le stagioni della società.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                        <Calendar className="w-6 h-6 animate-pulse"/>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">Caricamento stagioni...</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
                        Attendere prego.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

            <Dialog onOpenChange={handleOpenChange} open={open}>
                <DialogContent className="sm:max-w-md w-[95%] rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Aggiungi Nuova Stagione</DialogTitle>
                        <DialogDescription>
                            Inserisci il nome e i relativi costi di iscrizione per la nuova stagione sportiva.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"/>
                        <div>
                            <span className="font-semibold block mb-0.5">Attenzione</span>
                            Una volta creata una nuova stagione, la precedente verrà chiusa e non sarà più possibile
                            attivarla.
                        </div>
                    </div>

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
                            <label htmlFor="season" className="text-sm font-medium text-slate-700">
                                Nome Stagione
                            </label>
                            <input
                                id="season"
                                type="text"
                                placeholder="es. 2026 / 2027"
                                value={seasonName}
                                onChange={(e) => setSeasonName(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="newFee" className="text-sm font-medium text-slate-700">
                                Costo nuova iscrizione
                            </label>
                            <input
                                id="newFee"
                                type="number"
                                step="0.01"
                                placeholder="100.00"
                                value={newFee}
                                onChange={(e) => setNewFee(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="renewalFee" className="text-sm font-medium text-slate-700">
                                Costo rinnovo iscrizione
                            </label>
                            <input
                                id="renewalFee"
                                type="number"
                                step="0.01"
                                placeholder="100.00"
                                value={renewalFee}
                                onChange={(e) => setRenewalFee(e.target.value)}
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
                                disabled={createSeasonHandler.isPending}
                            >
                                {createSeasonHandler.isPending ? "Creazione in corso..." : "Conferma e Crea"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            Stagioni Sportive
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Organizza, monitora e gestisci le stagioni della società.
                    </p>
                </div>

                <Button
                    className="cursor-pointer w-full sm:w-auto gap-2 shadow-sm transition-all hover:shadow"
                    onClick={() => setOpen(true)}
                >
                    <Plus className="w-4 h-4"/>
                    Aggiungi Stagione
                </Button>
            </div>

            {!seasons || seasons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                        <Calendar className="w-6 h-6"/>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">Nessuna stagione trovata</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
                        Inizia aggiungendo una nuova stagione sportiva.
                    </p>
                    <Button variant="outline" size="sm" className="gap-2 cursor-pointer" onClick={() => setOpen(true)}>
                        <Plus className="w-4 h-4"/>
                        Crea la prima stagione
                    </Button>
                </div>
            ) : (
                <>
                    {/* Vista Mobile: Card layout */}
                    <div className="grid grid-cols-1 gap-4 sm:hidden">
                        {seasons.map((season, index) => {
                            const isActive = season.status === "active";
                            return (
                                <div key={season.id || index} className="rounded-xl border bg-white p-4 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-900 text-lg">
                                            {season.season}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            isActive
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                        }`}>
                                            {isActive ? "Attiva" : "Chiusa"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                                        <div>
                                            <span className="text-slate-500 block text-xs">Costo Iscrizione</span>
                                            <span className="font-medium text-slate-800">€ {Number(season.newFee).toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block text-xs">Costo Rinnovo</span>
                                            <span className="font-medium text-slate-800">€ {Number(season.renewalFee).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Vista Desktop: Tabella tradizionale */}
                    <div className="hidden sm:block rounded-xl border bg-white shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-semibold text-slate-700">Stagione</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Stato</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-right">Costo Iscrizione</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-right">Costo Rinnovo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {seasons.map((season, index) => {
                                    const isActive = season.status === "active";
                                    return (
                                        <TableRow key={season.id || index} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-medium text-slate-900">
                                                {season.season}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    isActive
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                                }`}>
                                                    {isActive ? "Attiva" : "Chiusa"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-700">
                                                € {Number(season.newFee).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-700">
                                                € {Number(season.renewalFee).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}

        </div>
    );
}