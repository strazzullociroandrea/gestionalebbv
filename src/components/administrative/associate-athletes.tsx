"use client";

import {useState} from "react";
import {api} from "@/lib/api";
import {Loader2, ShieldAlert, Trash2, Trophy, UserPlus, Check, Search, UserX} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";

export const AssociateAthletes = ({idUser}: { idUser: string }) => {
    const utils = api.useUtils();
    const [openAthleteId, setOpenAthleteId] = useState<string | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchAthleteTerm, setSearchAthleteTerm] = useState("");
    const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

    const {data: athletesList, isLoading} = api.administrative.getAssociateAthlete.useQuery({idUser});

    const {
        data: availableAthletes,
        isLoading: isAvailableLoading
    } = api.administrative.getAvailableAthletsPerUsers.useQuery({idUser});

    const addAthleteMutation = api.administrative.associateAthleteToUser.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAssociateAthlete.invalidate({idUser});
            await utils.administrative.getAvailableAthletsPerUsers.invalidate({idUser});
            setIsAddOpen(false);
        },
        onError: (error) => {
            console.error("Errore durante l'associazione dell'atleta:", error);
        },
    });

    const filteredFreeAthletes = availableAthletes?.filter((item) =>
        item.Athlete.name.toLowerCase().includes(searchAthleteTerm.toLowerCase()) ||
        item.Athlete.surname.toLowerCase().includes(searchAthleteTerm.toLowerCase())
    );

    const handleAddAthlete = () => {
        if (!selectedAthleteId) return;
        addAthleteMutation.mutate({idUser, idAthlete: selectedAthleteId});
        setSelectedAthleteId(null);
        setSearchAthleteTerm("");
    };

    const handleremoveAssociateAthlete = api.administrative.removeAssociateAthlete.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAssociateAthlete.invalidate({idUser});
            await utils.administrative.getAvailableAthletsPerUsers.invalidate({idUser});
            setOpenAthleteId(null);
        },
        onError: (error) => {
            console.error("Errore durante la rimozione dell'atleta:", error);
        },
    });

    const handleRemove = (athleteId: string) => {
        handleremoveAssociateAthlete.mutate({idUser, idAthlete: athleteId});
    };

    const handleOpenChange = (value: boolean) => {
        setIsAddOpen(value);
        if (!value) {
            setSelectedAthleteId(null);
            setSearchAthleteTerm("");
        }
    };

    return (
        <Card className="border border-zinc-200 bg-white text-zinc-900 overflow-hidden p-0 shadow-sm rounded-3xl relative w-full">
            <div className="h-2 w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500"/>

            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                    <div className="flex items-center gap-3.5">
                        <div className="size-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-red-600 shrink-0 shadow-2xs">
                            <Trophy className="w-5 h-5"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                                Atleti associati
                            </h2>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">
                                Gestione degli atleti associati all'utente
                            </p>
                        </div>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger >
                            <Button
                                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-5 rounded-xl text-xs uppercase tracking-wider shrink-0 shadow-sm transition-all"
                            >
                                <UserPlus className="w-4 h-4 mr-1.5"/>
                                Associa Atleta
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                                    Seleziona Atleta
                                </DialogTitle>
                                <DialogDescription className="text-xs text-zinc-500 font-medium">
                                    Cerca e seleziona l'atleta da associare a questo utente.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 mt-2">
                                <div className="relative w-full">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                        <Search className="w-4 h-4"/>
                                    </span>
                                    <Input
                                        placeholder="Cerca per nome o cognome..."
                                        value={searchAthleteTerm}
                                        onChange={(e) => setSearchAthleteTerm(e.target.value)}
                                        className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl pl-10 text-sm font-medium focus:border-red-500 focus:ring-0 text-zinc-900"
                                    />
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                    {isAvailableLoading ? (
                                        <div className="py-8 flex justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-red-600"/>
                                        </div>
                                    ) : !filteredFreeAthletes || filteredFreeAthletes.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <p className="text-xs font-semibold text-zinc-400">Nessun atleta disponibile</p>
                                        </div>
                                    ) : (
                                        filteredFreeAthletes.map((item) => {
                                            const athlete = item.Athlete;
                                            const isSelected = selectedAthleteId === athlete.id;
                                            return (
                                                <div
                                                    key={athlete.id}
                                                    onClick={() => setSelectedAthleteId(athlete.id)}
                                                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "border-red-600 bg-red-50/50 text-red-950 shadow-2xs"
                                                            : "border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-900"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div className="size-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 font-black text-xs shrink-0">
                                                            {athlete.name?.[0]?.toUpperCase() || ""}{athlete.surname?.[0]?.toUpperCase() || ""}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-zinc-950 truncate">
                                                                {athlete.surname} {athlete.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="size-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                                                            <Check className="w-3.5 h-3.5"/>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
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
                                    type="button"
                                    disabled={!selectedAthleteId || addAthleteMutation.isPending}
                                    onClick={handleAddAthlete}
                                    className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer flex items-center justify-center"
                                >
                                    {addAthleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma Associazione"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600"/>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Caricamento atleti...</p>
                    </div>
                ) : !athletesList || athletesList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 shadow-2xs">
                            <UserX className="w-5 h-5 text-red-600"/>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900">Nessun atleta associato</h3>
                        <p className="text-sm text-zinc-500 max-w-sm mt-1">
                            Questo utente non ha ancora atleti associati. Clicca su "Associa Atleta" per aggiungerne uno.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-zinc-50">
                                    <TableRow className="border-b border-zinc-200 hover:bg-transparent">
                                        <TableHead className="text-zinc-600 text-xs uppercase tracking-wider font-semibold py-3.5">
                                            Atleta
                                        </TableHead>
                                        <TableHead className="text-zinc-600 text-xs uppercase tracking-wider font-semibold py-3.5">
                                            Stato
                                        </TableHead>
                                        <TableHead className="text-zinc-600 text-xs uppercase tracking-wider font-semibold py-3.5 text-right pr-6">
                                            Azione
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {athletesList.map((item) => {
                                        const athlete = item.athlete;
                                        const isActive = athlete.status === "active";
                                        return (
                                            <TableRow key={athlete.id} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                                                <TableCell className="font-semibold text-zinc-900 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 font-black text-xs shrink-0">
                                                            {athlete.name?.[0]?.toUpperCase() || ""}{athlete.surname?.[0]?.toUpperCase() || ""}
                                                        </div>
                                                        <span>{athlete.name} {athlete.surname}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-zinc-700 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        isActive
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                            : "bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                                                    }`}>
                                                        {isActive ? "Attivo" : "Non attivo"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right py-4 pr-6">
                                                    <AlertDialog
                                                        open={openAthleteId === athlete.id}
                                                        onOpenChange={(isOpen) =>
                                                            setOpenAthleteId(isOpen ? athlete.id : null)
                                                        }
                                                    >
                                                        <AlertDialogTrigger >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-all font-medium rounded-xl h-9 px-3.5 text-xs"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 mr-1.5"/>
                                                                Rimuovi
                                                            </Button>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent className="bg-white border border-zinc-200 text-zinc-900 sm:max-w-[425px] rounded-3xl p-6 shadow-xl">
                                                            <AlertDialogHeader className="space-y-1">
                                                                <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-bold text-lg">
                                                                    <ShieldAlert className="w-5 h-5 shrink-0"/>
                                                                    Conferma Rimozione
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-zinc-500 text-xs font-medium">
                                                                    Sei sicuro di voler rimuovere l'atleta{" "}
                                                                    <span className="font-bold text-zinc-900">
                                                                        {athlete.name} {athlete.surname}
                                                                    </span>
                                                                    ? L'utente non risulterà più associato a questo profilo.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="mt-4 gap-3 flex-col-reverse sm:flex-row">
                                                                <AlertDialogCancel className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer">
                                                                    Annulla
                                                                </AlertDialogCancel>
                                                                <Button
                                                                    onClick={() => handleRemove(athlete.id)}
                                                                    disabled={handleremoveAssociateAthlete.isPending}
                                                                    className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer flex items-center justify-center"
                                                                >
                                                                    {handleremoveAssociateAthlete.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma"}
                                                                </Button>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:hidden">
                            {athletesList.map((item) => {
                                const athlete = item.athlete;
                                const isActive = athlete.status === "active";
                                return (
                                    <div key={athlete.id} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/40 space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-red-600 font-black text-xs shrink-0 shadow-2xs">
                                                    {athlete.name?.[0]?.toUpperCase() || ""}{athlete.surname?.[0]?.toUpperCase() || ""}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-zinc-950 text-sm truncate">
                                                        {athlete.name} {athlete.surname}
                                                    </p>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                                                        isActive
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                            : "bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                                                    }`}>
                                                        {isActive ? "Attivo" : "Non attivo"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-zinc-200/60 flex justify-end">
                                            <AlertDialog
                                                open={openAthleteId === athlete.id}
                                                onOpenChange={(isOpen) =>
                                                    setOpenAthleteId(isOpen ? athlete.id : null)
                                                }
                                            >
                                                <AlertDialogTrigger >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full cursor-pointer text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-all font-medium text-xs h-9 rounded-xl"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 mr-1.5"/>
                                                        Rimuovi
                                                    </Button>
                                                </AlertDialogTrigger>

                                                <AlertDialogContent className="bg-white border border-zinc-200 text-zinc-900 w-[90vw] max-w-[425px] rounded-3xl p-6 shadow-xl">
                                                    <AlertDialogHeader className="space-y-1">
                                                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-bold text-lg">
                                                            <ShieldAlert className="w-5 h-5 shrink-0"/>
                                                            Conferma Rimozione
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-zinc-500 text-xs font-medium">
                                                            Sei sicuro di voler rimuovere l'atleta{" "}
                                                            <span className="font-bold text-zinc-900">
                                                                {athlete.name} {athlete.surname}
                                                            </span>
                                                            ? L'utente non risulterà più associato a questo profilo.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-4 gap-3 flex-col-reverse sm:flex-row">
                                                        <AlertDialogCancel className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer">
                                                            Annulla
                                                        </AlertDialogCancel>
                                                        <Button
                                                            onClick={() => handleRemove(athlete.id)}
                                                            disabled={handleremoveAssociateAthlete.isPending}
                                                            className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer flex items-center justify-center"
                                                        >
                                                            {handleremoveAssociateAthlete.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma"}
                                                        </Button>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};