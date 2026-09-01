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
import {useRouter} from "next/navigation";

export default function AnagraphicPage() {
    const router = useRouter();
    const {data: session, isPending: isSessionLoading} = authClient.useSession();

    const user = session?.user as {
        createdAt: Date;
        email: string;
        emailVerified: boolean;
        id: string;
        image?: string | null | undefined;
        name: string;
        updatedAt: Date;
        surname?: string | null;
        phoneNumber?: string | null;
    } | undefined;

    const utils = api.useUtils();

    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
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
            setFormData(prev => ({...prev, currentPassword: "", newPassword: ""}));
            setTimeout(() => setSuccessMessage(false), 4000);
        },
        onError: (error) => {
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
            setFormData(prev => ({...prev, [name]: value}));
            return;
        }

        const updatedValue = type === "date" ? value : value.toUpperCase();
        setFormData(prev => ({...prev, [name]: updatedValue}));
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
            userId: user?.id,
            name: formData.name,
            surname: formData.surname,
            email: user?.email,
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
                className="w-full max-w-5xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Caricamento profilo...</p>
            </div>
        );
    }

    return (
        <div
            className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight">
                        Profilo Personale
                    </h1>
                    <p className="text-zinc-500 font-medium text-xs sm:text-sm lg:text-base">
                        Gestisci le informazioni del tuo account e le preferenze di sicurezza.
                    </p>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {successMessage && (
                        <div
                            className="flex items-center justify-center text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500 shrink-0"/> Salvato con successo
                        </div>
                    )}
                    {!isEditing ? (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-11 rounded-xl shadow-md hover:shadow-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
                        >
                            <Pencil className="mr-2 h-4 w-4"/> Modifica Profilo
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                disabled={updateUserMutation.isPending}
                                className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-100 h-11 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer"
                            >
                                <X className="mr-2 h-4 w-4"/> Annulla
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={updateUserMutation.isPending}
                                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl shadow-md hover:shadow-lg disabled:opacity-60 text-xs uppercase tracking-wider cursor-pointer"
                            >
                                {updateUserMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                                    <Save className="mr-2 h-4 w-4"/>}
                                Salva
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {generalError && (
                <div
                    className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-600"/>
                    <span>{generalError}</span>
                </div>
            )}

            <Card
                className="border border-zinc-200/80 bg-white p-0 shadow-xl rounded-3xl relative w-full overflow-hidden">
                <div className="h-2.5 sm:h-3 bg-gradient-to-r from-red-700 via-red-600 to-orange-500"/>

                <CardContent className="p-5 sm:p-8 lg:p-10">
                    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                        <div className="shrink-0 flex flex-col items-center">
                            <div className="relative group">
                                {user?.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || "User"}
                                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-md border-4 border-zinc-100 bg-zinc-100"
                                    />
                                ) : (
                                    <div
                                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-red-600 shadow-inner">
                                        <UserCircle className="w-16 h-16"/>
                                    </div>
                                )}
                                <div
                                    className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-white shadow-sm">
                                    <ShieldCheck className="w-4 h-4 text-white"/>
                                </div>
                            </div>
                            <span
                                className="mt-3 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center max-w-[160px] truncate">
                                {user?.name || "Utente"}
                            </span>
                        </div>

                        <div className="flex-1 w-full space-y-6">
                            <div className="bg-zinc-50/60 p-4 sm:p-6 rounded-2xl border border-zinc-100 space-y-6">
                                <h3 className="text-base font-bold text-zinc-900 border-l-4 border-red-600 pl-3">
                                    Informazioni Personali
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
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
                                    <div className="w-full">
                                        <Label
                                            className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex gap-1 items-center">
                                            <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0"/> Indirizzo Email (Non
                                            modificabile)
                                        </Label>
                                        <div
                                            className="bg-white border border-zinc-200 px-4 py-3 rounded-xl min-h-[44px] flex items-center text-sm text-zinc-700 uppercase break-all overflow-hidden font-medium">
                                            {user?.email || "N/D"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div
                                    className="bg-zinc-50/60 p-4 sm:p-6 rounded-2xl border border-zinc-100 space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2 border-l-4 border-red-600 pl-3">
                                        <Lock className="w-4 h-4 text-red-600"/> Modifica Password
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                        <div className="space-y-1.5 w-full">
                                            <Label htmlFor="currentPassword"
                                                   className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                Password Attuale
                                            </Label>
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type="password"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="bg-white border-zinc-200 focus:border-red-500 focus:ring-0 font-medium h-11 rounded-xl text-sm text-zinc-900 w-full"
                                            />
                                        </div>
                                        <div className="space-y-1.5 w-full">
                                            <Label htmlFor="newPassword"
                                                   className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                Nuova Password (opzionale)
                                            </Label>
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="bg-white border-zinc-200 focus:border-red-500 focus:ring-0 font-medium h-11 rounded-xl text-sm text-zinc-900 w-full"
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
    );
}