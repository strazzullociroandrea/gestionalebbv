"use client";

import {useState, useEffect} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {
    CheckCircle2,
    Contact,
    Mail,
    Loader2,
    Pencil,
    Phone,
    Save,
    ShieldAlert,
    User,
    UserCircle,
    X,
    Trash2
} from "lucide-react";
import {InfoField} from "@/components/administrative/info-field";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {api} from "@/lib/api";
import {useRouter} from "next/navigation";

export const UserInfo = ({idUser}: { idUser: string }) => {
    const utils = api.useUtils();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const {data: responseData, isLoading: isTrpcLoading, error} = api.administrative.getInfoUser.useQuery(
        {userId: idUser},
        {enabled: Boolean(idUser)}
    );

    const userData = responseData?.user;

    const updateUserMutation = api.administrative.updateInfoUser.useMutation({
        onSuccess: async () => {
            await utils.administrative.getInfoUser.invalidate({userId: idUser});
            setIsEditing(false);
            setSuccessMessage(true);
            setFormError(null);
            setTimeout(() => setSuccessMessage(false), 3000);
        },
        onError: (error) => {
            setFormError(error.message);
        }
    });

    const deleteUserMutation = api.administrative.deleteAdministrativeProfile.useMutation({
        onSuccess: async () => {
            setIsDeleteOpen(false);
            router.back();
        },
        onError: (err) => {
            setFormError(err.message || "Errore durante l'eliminazione dell'utente.");
        }
    });

    const [formData, setFormData] = useState({
        email: "",
        id: "",
        name: "",
        phoneNumber: "",
        surname: ""
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                email: userData.email || "",
                id: userData.id || "",
                name: userData.name || "",
                phoneNumber: userData.phoneNumber || "",
                surname: userData.surname || ""
            });
        }
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target;
        const updatedValue = type === "date" || name === "email" ? value : value.toUpperCase();
        setFormData(prev => ({...prev, [name]: updatedValue}));
    };

    const handleCancel = () => {
        if (userData) {
            setFormData({
                email: userData.email,
                id: userData.id,
                name: userData.name,
                phoneNumber: userData.phoneNumber || "",
                surname: userData.surname
            });
        }
        setFormError(null);
        setIsEditing(false);
    };

    const handleSave = () => {
        const requiredFields = ['name', 'surname', 'email'];
        const isEmpty = requiredFields.some(field => !formData[field as keyof typeof formData]?.trim());

        if (isEmpty) {
            setFormError("Tutti i campi contrassegnati con * sono obbligatori.");
            return;
        }

        updateUserMutation.mutate({
            userId: idUser,
            email: formData.email,
            name: formData.name,
            surname: formData.surname,
            phoneNumber: formData.phoneNumber
        });
    };

    if (isTrpcLoading) {
        return (
            <Card
                className="border-zinc-200 bg-white p-8 sm:p-12 text-center text-zinc-500 shadow-sm rounded-2xl w-full">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-red-600"/>
                <p className="font-semibold tracking-wide uppercase text-xs">Caricamento dati utente...</p>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50 p-4 sm:p-6 text-red-700 shadow-sm rounded-2xl w-full">
                <div className="flex items-center space-x-3 mb-2">
                    <ShieldAlert className="h-6 w-6 text-red-600 shrink-0"/>
                    <h3 className="font-bold uppercase tracking-wider text-sm">Errore di connessione</h3>
                </div>
                <p className="text-xs text-red-600">{error.message}</p>
            </Card>
        );
    }

    return (
        <>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent
                    className="sm:max-w-md w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                            Elimina Utente
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 font-medium">
                            Sei sicuro di voler eliminare questo utente? L'azione è irreversibile.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="w-full sm:w-auto rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider h-11 px-6 cursor-pointer"
                        >
                            Annulla
                        </Button>
                        <Button
                            type="button"
                            onClick={() => deleteUserMutation.mutate({id: idUser})}
                            disabled={deleteUserMutation.isPending}
                            className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 shadow-sm cursor-pointer flex items-center justify-center"
                        >
                            {deleteUserMutation.isPending ?
                                <Loader2 className="w-4 h-4 animate-spin"/> : "Conferma Eliminazione"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="border border-zinc-200 bg-white p-0 shadow-lg rounded-3xl relative w-full overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-red-700 via-red-600 to-red-700"/>

                <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div
                        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-zinc-100">
                        <div
                            className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-4 sm:gap-5 w-full lg:w-auto text-center sm:text-left">
                            <div className="bg-zinc-100 p-4 rounded-full border border-zinc-200 shrink-0">
                                <UserCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-600"/>
                            </div>
                            <div className="w-full overflow-hidden">
                                <p className="text-xs sm:text-sm font-medium text-zinc-500 uppercase tracking-wider">Scheda
                                    Utente</p>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight truncate">
                                    {formData.name || "Nome"} {formData.surname || "Cognome"}
                                </h2>
                                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                                    Utente
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                            {successMessage && (
                                <div
                                    className="flex items-center text-xs sm:text-sm font-medium text-green-700 bg-green-50 px-4 py-2.5 rounded-xl border border-green-200 w-full sm:w-auto justify-center">
                                    <CheckCircle2
                                        className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500 shrink-0"/> Salvato
                                </div>
                            )}

                            {!isEditing ? (
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Button
                                        onClick={() => setIsDeleteOpen(true)}
                                        variant="outline"
                                        className="w-full sm:w-auto border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-semibold px-5 py-4 sm:py-5 rounded-xl transition-colors text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4"/> Elimina
                                    </Button>
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-4 sm:py-5 rounded-xl shadow-sm transition-colors text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                                    >
                                        <Pencil className="mr-2 h-4 w-4"/> Modifica Dati
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        disabled={updateUserMutation.isPending}
                                        className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-100 py-4 sm:py-5 rounded-xl text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                                    >
                                        <X className="mr-2 h-4 w-4"/> Annulla
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={updateUserMutation.isPending}
                                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold py-4 sm:py-5 px-6 rounded-xl shadow-sm disabled:opacity-60 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
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

                    {
                        formError && (
                            <div
                                className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs sm:text-sm font-medium flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 shrink-0 text-red-600"/>
                                {formError}
                            </div>
                        )
                    }

                    <div
                        className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-100">
                        <h3 className="sm:col-span-2 text-base sm:text-lg font-bold text-zinc-900 mb-1 border-l-4 border-red-600 pl-3">Dati
                            Anagrafici</h3>

                        <InfoField icon={User} label="Nome" id="name" value={formData.name} handleChange={handleChange}
                                   isEditing={isEditing} required/>
                        <InfoField icon={Contact} label="Cognome" id="surname" value={formData.surname}
                                   handleChange={handleChange} isEditing={isEditing} required/>
                        <InfoField icon={Phone} label="Cellulare" id="phoneNumber" value={formData.phoneNumber}
                                   handleChange={handleChange} isEditing={isEditing}/>
                        <InfoField icon={Mail} label="Email" id="email" value={formData.email}
                                   handleChange={handleChange} isEditing={isEditing} required/>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};