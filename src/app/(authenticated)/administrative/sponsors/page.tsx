"use client";
import {api} from "@/lib/api";
import {Loader2, Building2, Search, Plus, Mail, Phone, RefreshCw, Pencil, Trash2, AlertTriangle} from "lucide-react";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

export default function SponsorPage() {
    const utils = api.useUtils();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSeason, setSelectedSeason] = useState("all");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteSponsorId, setDeleteSponsorId] = useState<string | null>(null);

    const [editingSponsor, setEditingSponsor] = useState<{ id: string; name: string; email: string; phone: string; description: string } | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editDesc, setEditDesc] = useState("");

    const [newSponsorName, setNewSponsorName] = useState("");
    const [newSponsorEmail, setNewSponsorEmail] = useState("");
    const [newSponsorPhone, setNewSponsorPhone] = useState("");
    const [newSponsorDesc, setNewSponsorDesc] = useState("");

    const {data: sponsors, isLoading} = api.administrative.getAllSponsor.useQuery();
    const {data: activeSeason} = api.administrative.getSeason.useQuery();

    const handleAddMutation = api.administrative.addSponsor.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAllSponsor.invalidate();
            setIsAddOpen(false);
            setNewSponsorName("");
            setNewSponsorEmail("");
            setNewSponsorPhone("");
            setNewSponsorDesc("");
        }
    });

    const handleRenewMutation = api.administrative.renewSponsorSeason?.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAllSponsor.invalidate();
        }
    });

    const handleUpdateMutation = api.administrative.updateSponsor?.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAllSponsor.invalidate();
            setIsEditOpen(false);
            setEditingSponsor(null);
        }
    });

    const handleDeleteMutation = api.administrative.deleteSponsor?.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAllSponsor.invalidate();
            setDeleteSponsorId(null);
        }
    });

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento in corso...</p>
            </div>
        );
    }

    const currentActiveSeasonName = !activeSeason ? "" : activeSeason[0].season;
    const seasonsArray = Array.isArray(sponsors) ? sponsors : (sponsors?.data || []);
    const seasonsList = seasonsArray.map((item) => item.season);

    const filteredData = seasonsArray.map((group) => {
        if (selectedSeason !== "all" && group.season !== selectedSeason) {
            return null;
        }

        const filteredSponsors = group.sponsor.filter((s: { name: string; description: string }) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredSponsors.length === 0) return null;

        return {
            ...group,
            sponsor: filteredSponsors
        };
    }).filter(Boolean);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSponsorName) return;

        handleAddMutation.mutate({
            name: newSponsorName,
            email: newSponsorEmail,
            phone: newSponsorPhone,
            description: newSponsorDesc
        });
    };

    const handleRenew = (sponsorId: string) => {
        if (handleRenewMutation) {
            handleRenewMutation.mutate({idSponsor: sponsorId});
        }
    };

    const handleOpenEdit = (sponsor: { id: string; name: string; email: string; phone: string; description: string }) => {
        setEditingSponsor(sponsor);
        setEditName(sponsor.name || "");
        setEditEmail(sponsor.email || "");
        setEditPhone(sponsor.phone || "");
        setEditDesc(sponsor.description || "");
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSponsor || !editName) return;

        if (handleUpdateMutation) {
            handleUpdateMutation.mutate({
                id: editingSponsor.id,
                name: editName,
                email: editEmail,
                phone: editPhone,
                description: editDesc
            });
        }
    };

    const handleDelete = () => {
        if (!deleteSponsorId) return;
        if (handleDeleteMutation) {
            handleDeleteMutation.mutate({id: deleteSponsorId});
        } else {
            setDeleteSponsorId(null);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">

            <Dialog open={Boolean(deleteSponsorId)} onOpenChange={(val) => !val && setDeleteSponsorId(null)}>
                <DialogContent className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                            Elimina Sponsor
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 font-medium">
                            Sei sicuro di voler eliminare questo sponsor? L'azione è irreversibile.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteSponsorId(null)}
                            className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer"
                        >
                            Annulla
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={handleDeleteMutation?.isPending}
                            className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer flex items-center justify-center"
                        >
                            {handleDeleteMutation?.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma Eliminazione"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">Sponsor</h1>
                    <p className="text-zinc-500 font-medium text-sm sm:text-base">
                        Gestisci e filtra gli sponsor associati alle stagioni sportive.
                    </p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger>
                        <Button
                            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-5 rounded-xl text-xs uppercase tracking-wider shrink-0 shadow-sm transition-all">
                            <Plus className="w-4 h-4 mr-1.5"/> Aggiungi Sponsor
                        </Button>
                    </DialogTrigger>

                    <DialogContent
                        className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                                Nuovo Sponsor
                            </DialogTitle>
                            <DialogDescription className="text-xs text-zinc-500 font-medium">
                                Inserisci le informazioni del nuovo sponsor. Verrà associato automaticamente alla
                                stagione corrente.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAdd} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Nome
                                    Sponsor *</label>
                                <Input
                                    value={newSponsorName}
                                    onChange={(e) => setNewSponsorName(e.target.value)}
                                    placeholder="es. Azienda Sponsor Srl"
                                    className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Email</label>
                                <Input
                                    type="email"
                                    value={newSponsorEmail}
                                    onChange={(e) => setNewSponsorEmail(e.target.value)}
                                    placeholder="info@sponsor.com"
                                    className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Telefono</label>
                                <Input
                                    value={newSponsorPhone}
                                    onChange={(e) => setNewSponsorPhone(e.target.value)}
                                    placeholder="+39 02 1234567"
                                    className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Descrizione</label>
                                <Input
                                    value={newSponsorDesc}
                                    onChange={(e) => setNewSponsorDesc(e.target.value)}
                                    placeholder="Breve descrizione..."
                                    className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                                />
                            </div>

                            <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddOpen(false)}
                                    className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer"
                                >
                                    Annulla
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={handleAddMutation.isPending}
                                    className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer flex items-center justify-center"
                                >
                                    {handleAddMutation.isPending ?
                                        <Loader2 className="w-4 h-4 animate-spin"/> : "Salva Sponsor"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent
                        className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                                Modifica Sponsor
                            </DialogTitle>
                            <DialogDescription className="text-xs text-zinc-500 font-medium">
                                Modifica le informazioni dello sponsor.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdate} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Nome
                                    Sponsor *</label>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="es. Azienda Sponsor Srl"
                                    className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Email</label>
                                <Input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    placeholder="info@sponsor.com"
                                    className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Telefono</label>
                                <Input
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    placeholder="+39 02 1234567"
                                    className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Descrizione</label>
                                <Input
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    placeholder="Breve descrizione..."
                                    className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 text-sm font-semibold text-zinc-900"
                                />
                            </div>

                            <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditOpen(false)}
                                    className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer"
                                >
                                    Annulla
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={handleUpdateMutation?.isPending}
                                    className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer flex items-center justify-center"
                                >
                                    {handleUpdateMutation?.isPending ?
                                        <Loader2 className="w-4 h-4 animate-spin"/> : "Salva Modifiche"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <span
                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Search className="w-4 h-4"/>
                    </span>
                    <Input
                        placeholder="Cerca sponsor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 pl-10 text-sm font-medium focus:border-red-500 focus:ring-0 text-zinc-900"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <Button
                        variant={selectedSeason === "all" ? "default" : "outline"}
                        onClick={() => setSelectedSeason("all")}
                        className={`h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
                            selectedSeason === "all" ? "bg-red-600 hover:bg-red-700 text-white" : "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                        }`}
                    >
                        Tutte
                    </Button>
                    {seasonsList.map((season: string) => (
                        <Button
                            key={season}
                            variant={selectedSeason === season ? "default" : "outline"}
                            onClick={() => setSelectedSeason(season)}
                            className={`h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0 ${
                                selectedSeason === season ? "bg-red-600 hover:bg-red-700 text-white" : "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                            }`}
                        >
                            {season}
                        </Button>
                    ))}
                </div>
            </div>

            {!filteredData || filteredData.length === 0 ? (
                <div
                    className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center flex flex-col items-center justify-center">
                    <div
                        className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 shadow-2xs">
                        <Building2 className="w-5 h-5 text-red-600"/>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">Nessuno sponsor trovato</h3>
                    <p className="text-sm text-zinc-500 max-w-sm mt-1">
                        Nessuno sponsor corrisponde ai filtri di ricerca selezionati.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {filteredData.map((group) => {
                        const isCurrentSeason = activeSeason && (group.season === currentActiveSeasonName);
                        return (
                            <div key={group.season} className="space-y-4">
                                <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-extrabold text-zinc-950 uppercase tracking-wider">
                                            Stagione {group.season}
                                        </h2>
                                        <span
                                            className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-3 py-1 rounded-xl">
                                            {group.sponsor.length} sponsor
                                        </span>
                                    </div>
                                    {isCurrentSeason && (
                                        <span
                                            className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                            Stagione Corrente
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {group.sponsor.map((sponsor: { id: string; name: string; email: string; phone: string; description: string }) => {
                                        const notInCurrentSeason = activeSeason && (group.season !== currentActiveSeasonName);
                                        return (
                                            <Card key={sponsor.id}
                                                  className="rounded-2xl border border-zinc-200 shadow-sm bg-white p-5 transition-all duration-300 hover:border-red-600/50 hover:shadow-md flex flex-col justify-between space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3.5 min-w-0">
                                                            <div
                                                                className="size-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 font-black text-sm">
                                                                {sponsor.name?.[0]?.toUpperCase() || "S"}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="font-bold text-zinc-950 truncate text-base">
                                                                    {sponsor.name}
                                                                </h3>
                                                                <p className="text-xs text-zinc-400 truncate mt-0.5">
                                                                    {sponsor.description || "Nessuna descrizione"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleOpenEdit(sponsor)}
                                                                className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer shrink-0"
                                                                title="Modifica sponsor"
                                                            >
                                                                <Pencil className="w-4 h-4"/>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDeleteSponsorId(sponsor.id)}
                                                                className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer shrink-0"
                                                                title="Elimina sponsor"
                                                            >
                                                                <Trash2 className="w-4 h-4"/>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs text-zinc-600">
                                                        {sponsor.email && (
                                                            <div className="flex items-center gap-2 truncate">
                                                                <Mail className="w-3.5 h-3.5 text-red-600 shrink-0"/>
                                                                <span className="truncate">{sponsor.email}</span>
                                                            </div>
                                                        )}
                                                        {sponsor.phone && (
                                                            <div className="flex items-center gap-2 truncate">
                                                                <Phone className="w-3.5 h-3.5 text-red-600 shrink-0"/>
                                                                <span className="truncate">{sponsor.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {notInCurrentSeason && (
                                                        <div className="pt-2">
                                                            <Button
                                                                onClick={() => handleRenew(sponsor.id)}
                                                                disabled={handleRenewMutation?.isPending}
                                                                className="w-full h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                                                            >
                                                                <RefreshCw className="w-3.5 h-3.5"/>
                                                                Rinnova per quest'anno
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}