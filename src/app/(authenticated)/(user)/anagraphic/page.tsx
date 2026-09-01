"use client";

import {useState, useEffect} from "react";
import {authClient} from "@/lib/auth-client";
import {
    User,
    Mail,
    Contact,
    ShieldCheck,
    Pencil,
    Save,
    X,
    Loader2,
    CheckCircle2,
    ShieldAlert,
    Phone,
    Lock,
    UserCircle
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {api} from "@/lib/api";
import {Field} from "@/components/user/field";

interface UserSession {
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    id: string;
    image?: string | null;
    name: string;
    updatedAt: Date;
    surname?: string | null;
    phoneNumber?: string | null;
}

interface MutationError {
    message?: string;
}

export default function AnagraphicPage() {
    const {data: session, isPending: isSessionLoading} = authClient.useSession();
    const user = session?.user as UserSession | undefined;

    const utils = api.useUtils();

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<boolean>(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        phoneNumber: "",
        currentPassword: "",
        newPassword: "",
    });

    const updateUserMutation = api.user.updateUserProfile.useMutation({
        onSuccess: async () => {
            await authClient.getSession();
            await utils.invalidate();
            setIsEditing(false);
            setSuccessMessage(true);
            setGeneralError(null);
            setFormData((prev) => ({...prev, currentPassword: "", newPassword: ""}));
            setTimeout(() => setSuccessMessage(false), 4000);
        },
        onError: (error: MutationError) => {
            setGeneralError(error.message || "Errore durante il salvataggio dei dati.");
        },
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                surname: user.surname || "",
                phoneNumber: user.phoneNumber || "",
                currentPassword: "",
                newPassword: "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target;

        if (name === "currentPassword" || name === "newPassword" || name === "email") {
            setFormData((prev) => ({...prev, [name]: value}));
            return;
        }

        const updatedValue = type === "date" ? value : value.toUpperCase();
        setFormData((prev) => ({...prev, [name]: updatedValue}));
    };

    const handleSave = async () => {
        setGeneralError(null);

        if (!user?.id) {
            setGeneralError("Utente non autenticato.");
            return;
        }

        if (!formData.name.trim() || !formData.surname.trim()) {
            setGeneralError("Nome e cognome sono obbligatori.");
            return;
        }

        if (formData.newPassword && !formData.currentPassword) {
            setGeneralError("Inserisci la password attuale per poterla modificare.");
            return;
        }

        if (formData.newPassword) {
            const {error: passwordError} = await authClient.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                revokeOtherSessions: true,
            });

            if (passwordError) {
                setGeneralError(passwordError.message || "Errore durante il cambio password.");
                return;
            }
        }

        updateUserMutation.mutate({
            userId: user.id,
            name: formData.name,
            surname: formData.surname,
            email: user.email,
            phoneNumber: formData.phoneNumber,
        });
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || "",
                surname: user.surname || "",
                phoneNumber: user.phoneNumber || "",
                currentPassword: "",
                newPassword: "",
            });
        }
        setGeneralError(null);
        setIsEditing(false);
    };

    if (isSessionLoading) {
        return (
            <div
                className="w-full max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-black">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-extrabold uppercase tracking-widest text-xs">
                    Caricamento in corso...
                </p>
            </div>
        );
    }

    return (
        <div
            className="w-full max-w-6xl mx-auto px-3 py-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8  text-black min-h-screen animate-in fade-in duration-500">
            <Card
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-zinc-200 p-5 sm:p-8 text-black shadow-lg shadow-zinc-200/40">
                <div
                    className="absolute -right-10 -bottom-10 w-36 h-36 sm:w-48 sm:h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none"/>
                <div
                    className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-red-600">
                                Gestione Account
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-black uppercase truncate">
                            Profilo Personale
                        </h1>
                        <p className="text-zinc-600 font-medium text-xs sm:text-sm">
                            Gestisci le informazioni del tuo account e la password.
                        </p>
                    </div>

                    <div
                        className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                        {successMessage && (
                            <div
                                className="flex items-center justify-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600 shrink-0"/>
                                Salvato con successo
                            </div>
                        )}

                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 h-10 sm:h-11 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider cursor-pointer"
                            >
                                <Pencil className="mr-2 h-4 w-4"/> Modifica Profilo
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={updateUserMutation.isPending}
                                    className="flex-1 sm:flex-none border-zinc-200 bg-white text-black hover:bg-zinc-100 h-10 sm:h-11 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer"
                                >
                                    <X className="mr-1.5 h-4 w-4"/> Annulla
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={updateUserMutation.isPending}
                                    className="flex-1 sm:flex-none bg-black hover:bg-zinc-900 text-white font-extrabold h-10 sm:h-11 px-5 rounded-xl shadow-md disabled:opacity-60 text-xs uppercase tracking-wider cursor-pointer"
                                >
                                    {updateUserMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    ) : (
                                        <Save className="mr-2 h-4 w-4"/>
                                    )}
                                    Salva
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {generalError && (
                <div
                    className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs sm:text-sm font-bold flex items-center gap-2.5">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-600"/>
                    <span>{generalError}</span>
                </div>
            )}

            <Card
                className="border border-zinc-200 bg-white p-0 shadow-sm rounded-2xl sm:rounded-3xl relative w-full overflow-hidden">
                <div className="h-1.5 bg-red-600 w-full"/>

                <CardContent className="p-4 sm:p-7 lg:p-8">
                    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-center lg:items-start">
                        <div className="shrink-0 flex flex-col items-center">
                            <div className="relative">
                                {user?.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || "User"}
                                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-sm border-2 border-zinc-200 bg-zinc-100"
                                    />
                                ) : (
                                    <div
                                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shadow-inner">
                                        <UserCircle className="w-14 h-14"/>
                                    </div>
                                )}
                                <div
                                    className="absolute -bottom-2 -right-2 bg-red-600 p-1.5 rounded-full border-2 border-white shadow-sm">
                                    <ShieldCheck className="w-3.5 h-3.5 text-white"/>
                                </div>
                            </div>
                            <span
                                className="mt-3 text-[11px] sm:text-xs font-black text-black uppercase tracking-widest text-center max-w-[160px] truncate">
                                {user?.name || "Utente"}
                            </span>
                        </div>

                        <div className="flex-1 w-full space-y-5 sm:space-y-6">
                            <div
                                className="bg-zinc-50/80 p-4 sm:p-6 rounded-2xl border border-zinc-200/80 space-y-4 sm:space-y-5">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                                    <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-tight flex items-center gap-2">
                                        <span className="w-1.5 h-4 bg-red-600 rounded-full"/>
                                        Informazioni Personali
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    <Field
                                        label="Nome"
                                        value={formData.name}
                                        icon={User}
                                        isEditing={isEditing}
                                        id="name"
                                        name="name"
                                        onChange={handleChange}
                                        required
                                    />
                                    <Field
                                        label="Cognome"
                                        value={formData.surname}
                                        icon={Contact}
                                        isEditing={isEditing}
                                        id="surname"
                                        name="surname"
                                        onChange={handleChange}
                                        required
                                    />
                                    <Field
                                        label="Numero di Telefono"
                                        value={formData.phoneNumber}
                                        icon={Phone}
                                        isEditing={isEditing}
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        onChange={handleChange}
                                        placeholder="Non specificato"
                                    />
                                    <div className="w-full space-y-1.5">
                                        <Label
                                            className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 pl-1 cursor-pointer"
                                        >
                                            <Mail className="h-3.5 w-3.5 text-red-600 shrink-0"/> Indirizzo Email (Non
                                            modificabile)
                                        </Label>
                                        <div
                                            className="font-medium bg-white border border-zinc-200 px-3.5 py-2.5 rounded-xl min-h-10.5 flex items-center text-xs sm:text-sm text-zinc-600 uppercase break-all">
                                            {user?.email || "N/D"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div
                                    className="bg-zinc-50/80 p-4 sm:p-6 rounded-2xl border border-zinc-200/80 space-y-4 sm:space-y-5 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                                        <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-tight flex items-center gap-2">
                                            <span className="w-1.5 h-4 bg-red-600 rounded-full"/>
                                            Sicurezza Account
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                        <div className="space-y-1.5 w-full">
                                            <Label
                                                htmlFor="currentPassword"
                                                className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"
                                            >
                                                <Lock className="h-3.5 w-3.5 text-red-600 shrink-0"/> Password Attuale
                                            </Label>
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type="password"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="bg-white border-zinc-200 focus-visible:ring-0 font-medium h-10 sm:h-11 rounded-xl text-xs sm:text-sm text-black w-full"
                                            />
                                        </div>
                                        <div className="space-y-1.5 w-full">
                                            <Label
                                                htmlFor="newPassword"
                                                className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"
                                            >
                                                <Lock className="h-3.5 w-3.5 text-red-600 shrink-0"/> Nuova Password
                                                (opzionale)
                                            </Label>
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="bg-white border-zinc-200 focus-visible:ring-0 font-medium h-10 sm:h-11 rounded-xl text-xs sm:text-sm text-black w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
        ;
}