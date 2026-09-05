"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {api} from "@/lib/api";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card} from "@/components/ui/card";
import {
    ArrowLeft,
    Trophy,
    KeyRound,
    Check,
    RefreshCw,
    UserX,
    ArrowRight,
    Loader2,
    Plus,
    Trash2,
    ShieldAlert,
    Pencil,
    Users,
    CreditCard
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import Link from "next/link";

type OrganizerType = "FIPAV" | "CSI" | "PGS" | "VolleyCup";

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
    const [openChampionshipDialog, setOpenChampionshipDialog] = useState(false);
    const [openDeleteTeamDialog, setOpenDeleteTeamDialog] = useState(false);
    const [dialogError, setDialogError] = useState("");

    const [championshipName, setChampionshipName] = useState("");
    const [organizer, setOrganizer] = useState<OrganizerType | null>(null);
    const [isPaid, setIsPaid] = useState(false);
    const [championshipId, setChampionshipId] = useState<string | null>(null);

    const utils = api.useUtils();

    const {
        data: infoTeam,
        isLoading: isInfoTeamLoading
    } = api.administrative.getInfoTeam.useQuery({
        idTeam
    }, {
        enabled: !!idTeam
    });

    const editChampionshipMutation = api.administrative.editChampionship.useMutation({
        onSuccess: async () => {
            await utils.administrative.getInfoTeam.invalidate({idTeam});
            setOpenChampionshipDialog(false);
            setChampionshipName("");
            setOrganizer(null);
            setIsPaid(false);
            setDialogError("");
            setChampionshipId(null);
        },
        onError: (err) => {
            setDialogError(err.message || "Errore durante la modifica del campionato.");
        }
    });

    const updatePasswordMutation = api.administrative.updateTeamPassword.useMutation({
        onSuccess: async () => {
            await utils.administrative.getInfoTeam.invalidate({idTeam});
        },
        onError: (error) => {
            console.error("Errore durante l'aggiornamento della password:", error);
        }
    });

    const addChampionshipMutation = api.administrative.addTeamChampionship.useMutation({
        onSuccess: async () => {
            await utils.administrative.getInfoTeam.invalidate({idTeam});
            setOpenChampionshipDialog(false);
            setChampionshipName("");
            setOrganizer(null);
            setIsPaid(false);
            setDialogError("");
            setChampionshipId(null);
        },
        onError: (err) => {
            setDialogError(err.message || "Errore durante l'aggiunta del campionato.");
        }
    });

    const removeChampionshipMutation = api.administrative.removeTeamChampionship.useMutation({
        onSuccess: async () => {
            await utils.administrative.getInfoTeam.invalidate({idTeam});
        },
        onError: (err) => {
            console.error("Errore durante la rimozione:", err);
        }
    });

    const deleteTeamMutation = api.administrative.deleteTeam?.useMutation({
        onSuccess: () => {
            router.back();
        },
        onError: (err) => {
            console.error("Errore durante l'eliminazione della squadra:", err);
        }
    });

    const handleOpenEditChampionship = (championship: {
        id: string;
        name: string;
        sportsCommittee: string;
        paid: boolean
    }) => {
        setChampionshipId(championship.id);
        setChampionshipName(championship.name);
        setOrganizer(championship.sportsCommittee as OrganizerType);
        setIsPaid(championship.paid);
        setDialogError("");
        setOpenChampionshipDialog(true);
    };

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

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!championshipName.trim()) {
            setDialogError("Il nome del campionato è obbligatorio.");
            return;
        }
        if (!organizer) {
            setDialogError("Seleziona un gestore.");
            return;
        }

        if (championshipId) {
            editChampionshipMutation.mutate({
                id: championshipId,
                name: championshipName.toUpperCase(),
                organizer,
                isPaid
            });
        } else {
            addChampionshipMutation.mutate({
                idTeam,
                name: championshipName.toUpperCase(),
                organizer,
                isPaid
            });
        }
    };

    if (isInfoTeamLoading || updatePasswordMutation.isPending) {
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

    const teamData = infoTeam?.teamInfo?.[0]?.team;
    const seasonName = infoTeam?.teamInfo?.[0]?.season;
    const championships = infoTeam?.championships || [];
    const athletes = infoTeam?.athletes || [];

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
            <Dialog open={openChampionshipDialog} onOpenChange={setOpenChampionshipDialog}>
                <DialogContent
                    className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                            {championshipId ? "Modifica Campionato" : "Iscrivi a un Campionato"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 font-medium">
                            {championshipId ? "Aggiorna i dettagli del campionato." : "Inserisci i dettagli del campionato a cui iscrivere la squadra."}
                        </DialogDescription>
                    </DialogHeader>

                    {dialogError && (
                        <div
                            className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs font-semibold">
                            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0"/>
                            <span>{dialogError}</span>
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit} className="space-y-4 mt-2">
                        <div className="space-y-1.5 w-full">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                                Nome Campionato *
                            </Label>
                            <Input
                                value={championshipName}
                                onChange={(e) => setChampionshipName(e.target.value)}
                                placeholder="Es. OPEN MASCHILE"
                                className="bg-white border-zinc-200 focus:border-red-500 focus:ring-0 font-medium h-11 rounded-xl text-sm text-zinc-900 w-full uppercase"
                            />
                        </div>

                        <div className="space-y-1.5 w-full">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                                Gestore *
                            </Label>
                            <Select value={organizer || ""}
                                    onValueChange={(val) => setOrganizer(val ? (val as OrganizerType) : null)}>
                                <SelectTrigger
                                    className="bg-white border-zinc-200 focus:border-red-500 focus:ring-0 font-medium h-11 rounded-xl text-sm text-zinc-900 w-full">
                                    <SelectValue placeholder="Seleziona gestore..."/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FIPAV">FIPAV</SelectItem>
                                    <SelectItem value="CSI">CSI</SelectItem>
                                    <SelectItem value="PGS">PGS</SelectItem>
                                    <SelectItem value="VolleyCup">VolleyCup</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                            <input
                                type="checkbox"
                                id="isPaid"
                                checked={isPaid}
                                onChange={(e) => setIsPaid(e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-600 cursor-pointer"
                            />
                            <Label htmlFor="isPaid"
                                   className="text-xs font-bold text-zinc-700 uppercase tracking-wider cursor-pointer">
                                Quota pagata
                            </Label>
                        </div>

                        <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer"
                                onClick={() => setOpenChampionshipDialog(false)}
                            >
                                Annulla
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer"
                                disabled={addChampionshipMutation.isPending || editChampionshipMutation.isPending}
                            >
                                {(addChampionshipMutation.isPending || editChampionshipMutation.isPending) ?
                                    <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={openDeleteTeamDialog} onOpenChange={setOpenDeleteTeamDialog}>
                <DialogContent
                    className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                            Elimina Squadra
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 font-medium">
                            Sei sicuro di voler eliminare questa squadra? Verranno rimossi anche tutti i campionati e i
                            collegamenti associati. L'azione è irreversibile.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer"
                            onClick={() => setOpenDeleteTeamDialog(false)}
                        >
                            Annulla
                        </Button>
                        <Button
                            type="button"
                            className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer"
                            disabled={deleteTeamMutation?.isPending}
                            onClick={() => deleteTeamMutation?.mutate({idTeam})}
                        >
                            {deleteTeamMutation?.isPending ?
                                <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma Eliminazione"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="cursor-pointer font-bold uppercase tracking-wider text-xs text-zinc-500 hover:text-zinc-950 px-4 h-10 rounded-2xl border border-zinc-200 bg-white shadow-xs"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4"/> Indietro
                </Button>
            </div>

            <Card className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600"/>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div
                                className="size-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                                <Trophy className="w-6 h-6"/>
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">Informazioni
                                    Generali</h2>
                                <p className="text-xs text-zinc-500 font-medium">Dettagli e credenziali di accesso</p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setOpenDeleteTeamDialog(true)}
                            className="cursor-pointer border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs uppercase tracking-wider h-10 px-4 rounded-xl flex items-center gap-2"
                            title="Elimina Squadra"
                        >
                            <Trash2 className="w-4 h-4"/>
                            <span className="hidden sm:inline">Elimina</span>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Nome
                                Squadra</label>
                            <Input
                                value={teamData?.name || ""}
                                readOnly
                                className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Stagione</label>
                            <Input
                                value={seasonName || "N/D"}
                                readOnly
                                className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Password
                                Iscrizione</label>
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
                                    {copied ? <Check className="w-4 h-4 text-emerald-600"/> :
                                        <KeyRound className="w-4 h-4 text-zinc-600"/>}
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

            <div className="space-y-4 pt-2">
                <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div
                            className="size-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <Trophy className="w-5 h-5"/>
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-zinc-950 uppercase tracking-wider">Campionati
                                Iscritti</h2>
                            <p className="text-xs text-zinc-500 font-medium">Tornei e competizioni a cui partecipa la
                                squadra</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            setDialogError("");
                            setChampionshipName("");
                            setOrganizer(null);
                            setIsPaid(false);
                            setChampionshipId(null);
                            setOpenChampionshipDialog(true);
                        }}
                        className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-all text-xs uppercase tracking-wider flex items-center gap-2 h-10 w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4"/> Aggiungi Campionato
                    </Button>
                </div>

                {championships.length === 0 ? (
                    <div
                        className="rounded-3xl border border-dashed border-zinc-200 bg-white p-10 text-center flex flex-col items-center justify-center">
                        <div
                            className="size-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3">
                            <Trophy className="w-6 h-6 text-zinc-300"/>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-900">Nessun campionato iscritto</h3>
                        <p className="text-xs text-zinc-500 max-w-xs mt-1">
                            Aggiungi un campionato per iniziare a monitorare le quote e le iscrizioni della squadra.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {championships.map((champ) => (
                            <Card key={champ.Championship.id}
                                  className="rounded-3xl border border-zinc-200 shadow-sm bg-white p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <span
                                                className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                                {champ.Championship.sportsCommittee}
                                            </span>
                                            <h3 className="font-extrabold text-zinc-950 text-base leading-snug">
                                                {champ.Championship.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleOpenEditChampionship(champ.Championship)}
                                                className="h-8 w-8 rounded-xl border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                title="Modifica campionato"
                                            >
                                                <Pencil className="w-3.5 h-3.5"/>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeChampionshipMutation.mutate({id: champ.Championship.id})}
                                                className="h-8 w-8 rounded-xl border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                title="Rimuovi campionato"
                                            >
                                                <Trash2 className="w-3.5 h-3.5"/>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <CreditCard className="w-3.5 h-3.5"/>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Quota</span>
                                    </div>
                                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${
                                        champ.Championship.paid
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                    }`}>
                                        {champ.Championship.paid ? "Pagato" : "Da pagare"}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-2">
                <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div
                            className="size-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                            <Users className="w-5 h-5"/>
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-zinc-950 uppercase tracking-wider">Rosa
                                Atleti</h2>
                            <p className="text-xs text-zinc-500 font-medium">Giocatori registrati e collegati a questa
                                squadra</p>
                        </div>
                    </div>
                    <span
                        className="text-xs font-bold text-zinc-600 uppercase tracking-wider bg-zinc-100 px-3.5 py-1.5 rounded-xl border border-zinc-200 w-full sm:w-auto text-center">
                        Totale: {athletes.length}
                    </span>
                </div>

                {athletes.length === 0 ? (
                    <div
                        className="rounded-3xl border border-dashed border-zinc-200 bg-white p-12 text-center flex flex-col items-center justify-center">
                        <div
                            className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3 shadow-2xs">
                            <UserX className="w-5 h-5 text-red-600"/>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900">Nessun atleta trovato</h3>
                        <p className="text-sm text-zinc-500 max-w-sm mt-1">
                            Condividi la password di iscrizione con la squadra per permettere agli atleti di
                            registrarsi.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {athletes.map((athlete) => (
                            <Link key={athlete.Athlete.id} href={`/administrative/athletes/${athlete.Athlete.id}`}
                                  className="group block">
                                <Card
                                    className="rounded-3xl border border-zinc-200 shadow-sm bg-white p-5 transition-all duration-300 group-hover:border-red-600/50 group-hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div
                                                className="size-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 font-black text-sm">
                                                {athlete.Athlete.name?.[0]?.toUpperCase() || ""}{athlete.Athlete.surname?.[0]?.toUpperCase() || ""}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-zinc-950 truncate text-base group-hover:text-red-600 transition-colors">
                                                    {athlete.Athlete.name} {athlete.Athlete.surname}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span
                                                        className={`inline-block size-2 rounded-full ${athlete.Athlete.status === "active" ? "bg-emerald-500" : "bg-zinc-300"}`}/>
                                                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                                                        {athlete.Athlete.status === "active" ? "Attivo" : "Non attivo"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="size-9 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all shrink-0">
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