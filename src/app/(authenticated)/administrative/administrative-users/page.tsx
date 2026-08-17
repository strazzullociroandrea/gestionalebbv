"use client";
import {Button} from "@/components/ui/button";
import {AlertTriangle, Loader2, Plus, Mail, Phone, UserCheck, User, Pencil, Trash2, Save, X} from "lucide-react";
import {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Card} from "@/components/ui/card";
import {api} from "@/lib/api";
import {InfoField} from "@/components/administrative/info-field";

export default function AdministrativeUsersPage() {
    const utils = api.useUtils();
    const [open, setOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const [username, setUsername] = useState("");
    const [userSurname, setUserSurname] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPhone, setUserPhone] = useState("");

    const {data: users, isLoading} = api.administrative.getAdministrativeUser.useQuery();

    const handleDelete = api.administrative.deleteAdministrativeProfile.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAdministrativeUser.invalidate();
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (!value) {
            setError("");
            setEditingUserId(null);
            setUsername("");
            setUserSurname("");
            setUserEmail("");
            setUserPhone("");
        }
    };

    const handleOpenCreate = () => {
        setEditingUserId(null);
        setUsername("");
        setUserSurname("");
        setUserEmail("");
        setUserPhone("");
        setError("");
        setOpen(true);
    };

    const handleOpenEdit = (user: any) => {
        setEditingUserId(user.id);
        setUsername(user.name || "");
        setUserSurname(user.surname || "");
        setUserEmail(user.email || "");
        setUserPhone(user.phoneNumber || "");
        setError("");
        setOpen(true);
    };

    const createUserHandler = api.administrative.createAdministrativeUser.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAdministrativeUser.invalidate();
            setOpen(false);
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const updateUserHandler = api.administrative.updateUserProfile.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAdministrativeUser.invalidate();
            setOpen(false);
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (editingUserId) {
            updateUserHandler.mutate({
                id: editingUserId,
                name: username.toUpperCase(),
                surname: userSurname.toUpperCase(),
                email: userEmail,
                phoneNumber: userPhone.toUpperCase()
            });
        } else {
            createUserHandler.mutate({
                username: username.toUpperCase(),
                surname: userSurname.toUpperCase(),
                email: userEmail,
                phone: userPhone.toUpperCase()
            });
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento utenti...</p>
            </div>
        );
    }

    const usersList = Array.isArray(users) ? users : [];
    const isPending = createUserHandler.isPending || updateUserHandler.isPending;

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            <Dialog onOpenChange={handleOpenChange} open={open}>
                <DialogContent
                    className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                            {editingUserId ? "Modifica Utente Segreteria" : "Aggiungi Nuovo Utente Segreteria"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 font-medium">
                            {editingUserId ? "Aggiorna le informazioni dell'utente." : "Crea un nuovo utente per la segreteria."}
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div
                            className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs font-semibold">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0"/>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <InfoField
                                icon={User}
                                label="Nome"
                                id="username"
                                value={username}
                                handleChange={(e) => setUsername(e.target.value)}
                                isEditing={true}
                                required={true}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <InfoField
                                icon={User}
                                label="Cognome"
                                id="usersurname"
                                value={userSurname}
                                handleChange={(e) => setUserSurname(e.target.value)}
                                isEditing={true}
                                required={true}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <InfoField
                                icon={Mail}
                                label="Email"
                                id="useremail"
                                value={userEmail}
                                handleChange={(e) => setUserEmail(e.target.value)}
                                isEditing={true}
                                required={true}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <InfoField
                                icon={Phone}
                                label="Cellulare"
                                id="userphone"
                                value={userPhone}
                                handleChange={(e) => setUserPhone(e.target.value)}
                                isEditing={true}
                                required={false}
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
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                ) : editingUserId ? (
                                    <>Salva Modifiche</>
                                ) : (
                                    <>Conferma e Crea</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">Utenti
                        segreteria</h1>
                    <p className="text-zinc-500 font-medium text-sm sm:text-base">
                        Monitora e gestisci gli utenti della segreteria.
                    </p>
                </div>

                <Button
                    className="cursor-pointer w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-5 rounded-xl shadow-sm transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                    onClick={handleOpenCreate}
                >
                    <Plus className="w-4 h-4"/>
                    Aggiungi utente
                </Button>
            </div>

            {usersList.length === 0 ? (
                <div
                    className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center flex flex-col items-center justify-center">
                    <div
                        className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                        <UserCheck className="w-5 h-5 text-red-600"/>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">Nessun utente trovato</h3>
                    <p className="text-sm text-zinc-500 max-w-sm mt-1">
                        Non ci sono utenti della segreteria registrati nel sistema.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {usersList.map((user: any) => (
                        <Card key={user.id}
                              className="rounded-2xl border border-zinc-200 shadow-sm bg-white p-5 transition-all duration-300 hover:border-red-600/50 hover:shadow-md flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                        <div
                                            className="size-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shrink-0 font-black text-sm">
                                            {user.name?.[0]?.toUpperCase() || "U"}{user.surname?.[0]?.toUpperCase() || ""}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-zinc-950 truncate text-base">
                                                {user.name} {user.surname}
                                            </h3>
                                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 mt-0.5 truncate">
                                                Segreteria
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => handleOpenEdit(user)}
                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer"
                                            title="Modifica utente"
                                        >
                                            <Pencil className="w-4 h-4"/>
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDelete.mutate({id: user.id})
                                            }}
                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                            title="Elimina utente"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs text-zinc-600">
                                    {user.email && (
                                        <div className="flex items-center gap-2 truncate">
                                            <Mail className="w-3.5 h-3.5 text-red-600 shrink-0"/>
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                    )}
                                    {user.phoneNumber && (
                                        <div className="flex items-center gap-2 truncate">
                                            <Phone className="w-3.5 h-3.5 text-red-600 shrink-0"/>
                                            <span className="truncate">{user.phoneNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}