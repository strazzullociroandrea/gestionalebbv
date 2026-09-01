"use client";

import React, {useState} from "react";
import {
    User,
    Contact,
    Mail,
    Calendar,
    MapPin,
    CreditCard,
    Globe,
    CheckCircle2,
    ShieldAlert,
    UserPlus,
    Loader2,
    UserCircle,
    FileText,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Field} from "@/components/user/field";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import CodiceFiscale from "codice-fiscale-js";
import {api} from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

interface AthleteCreateProps {
    idUser: string;
    emailUser?: string;
    onCreated?: (idAthlete?: string) => void;
    setIdAthlete: (idAthlete?: string) => void;
}

export const AthleteCreate = ({idUser, emailUser, onCreated, setIdAthlete}: AthleteCreateProps) => {
    const [open, setOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const utils = api.useUtils();

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        gender: "",
        dateOfBirth: "",
        expirationMedicalCertificate: "",
        homeAddress: "",
        nin: "",
        birthPlace: "",
        countryBirthPlace: "",
        ci: "",
        expiredCI: ""
    });

    const arePersonalDetailsComplete = Boolean(
        formData.name.trim() &&
        formData.surname.trim() &&
        formData.gender &&
        formData.dateOfBirth.trim() &&
        formData.birthPlace.trim() &&
        formData.countryBirthPlace.trim()
    );

    const getCfValidationState = () => {
        const cleanCf = formData.nin.trim().toUpperCase();
        if (!cleanCf) return {status: "empty", message: ""};
        if (cleanCf.length < 16) return {status: "incomplete", message: `Inseriti ${cleanCf.length}/16 caratteri`};
        if (cleanCf.length > 16) return {status: "error", message: "Il codice fiscale non può superare i 16 caratteri"};

        try {
            if (typeof CodiceFiscale.check === "function" && !CodiceFiscale.check(cleanCf)) {
                return {status: "error", message: "Struttura o carattere di controllo non validi"};
            }
        } catch {
            return {status: "error", message: "Errore nella verifica formale"};
        }

        if (arePersonalDetailsComplete) {
            try {
                const [y, m, d] = formData.dateOfBirth.split("-");
                const cfInstance = new CodiceFiscale({
                    name: formData.name.trim(),
                    surname: formData.surname.trim(),
                    gender: formData.gender === "M" ? "M" : "F",
                    day: parseInt(d, 10),
                    month: parseInt(m, 10),
                    year: parseInt(y, 10),
                    birthplace: formData.birthPlace.trim(),
                    birthplaceProvincia: formData.countryBirthPlace.trim().toUpperCase()
                });

                const calcolato = (cfInstance as any).code
                    ? (cfInstance as any).code.toUpperCase()
                    : cfInstance.toString().toUpperCase();

                if (calcolato.substring(0, 15) !== cleanCf.substring(0, 15)) {
                    return {status: "error", message: "Non corrisponde ai dati anagrafici (Nome, Cognome, Data/Luogo)"};
                }
            } catch {
            }
        } else {
            return {status: "warning", message: "Completa i dati anagrafici per la verifica incrociata"};
        }

        return {status: "valid", message: "Codice Fiscale valido e verificato"};
    };

    const cfState = getCfValidationState();

    const isFormValid =
        Boolean(formData.name.trim()) &&
        Boolean(formData.surname.trim()) &&
        Boolean(formData.gender) &&
        Boolean(formData.dateOfBirth.trim()) &&
        Boolean(formData.homeAddress.trim()) &&
        Boolean(formData.nin.trim()) &&
        Boolean(formData.birthPlace.trim()) &&
        Boolean(formData.countryBirthPlace.trim()) &&
        Boolean(formData.ci.trim()) &&
        Boolean(formData.expiredCI.trim()) &&
        cfState.status === "valid";

    const createAthleteMutation = api.user.addAthletesToUser.useMutation({
        onSuccess: async (data) => {
            const createdAthleteId = data?.id;
            setOpen(true);
            setSuccessMessage(true);
            if (createdAthleteId) setIdAthlete(createdAthleteId);
            if (onCreated) onCreated(createdAthleteId);
            await utils.user.getAllAthletes.invalidate({idUser});
            setTimeout(() => setSuccessMessage(false), 4000);
        },
        onError: (error) => {
            setGeneralError(error.message || "Errore durante la creazione.");
        },
    });

    const handleChange = (name: string, value: string | null) => {
        const updatedValue = name === "nin" || name === "countryBirthPlace" || name === "ci" ? value?.toUpperCase() : value;
        setFormData(prev => ({...prev, [name]: updatedValue}));
    };

    const handleSave = () => {
        setGeneralError(null);
        if (!isFormValid) {
            setGeneralError("Verifica che tutti i campi obbligatori siano corretti e che il Codice Fiscale sia valido.");
            return;
        }

        createAthleteMutation.mutate({
            idUser,
            ...formData,
            nin: formData.nin.toUpperCase(),
            countryBirthPlace: formData.countryBirthPlace.toUpperCase(),
            ci: formData.ci.toUpperCase()
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
            <Card className="border border-zinc-200/80 bg-white shadow-2xl rounded-3xl w-full overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-red-700 via-red-600 to-orange-500"/>

                <CardContent className="p-5 sm:p-8 lg:p-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-zinc-100">
                        <div className="flex items-center gap-4 text-left">
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shrink-0 shadow-inner">
                                <UserCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-600"/>
                            </div>
                            <div className="w-full min-w-0">
                                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Registrazione</span>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight">
                                    Nuovo atleta
                                </h2>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-3">
                            {successMessage && (
                                <div className="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500 shrink-0"/> Salvato con successo
                                </div>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={!isFormValid || createAthleteMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-8 rounded-xl shadow-md disabled:opacity-60 text-xs uppercase tracking-wider cursor-pointer transition-all"
                            >
                                {createAthleteMutation.isPending ?
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                                    <UserPlus className="mr-2 h-4 w-4"/>}
                                Registra Atleta
                            </Button>
                        </div>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl max-w-[90vw] sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
                            <DialogHeader className="space-y-4 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                                    <CheckCircle2 className="h-7 w-7 shrink-0"/>
                                </div>
                                <div className="space-y-1.5">
                                    <DialogTitle className="text-lg font-black uppercase tracking-tight text-zinc-950">
                                        Atleta registrato con successo!
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-medium text-zinc-500 leading-relaxed">
                                        L'operazione è andata a buon fine. Per completare la pratica, segui le indicazioni sottostanti.
                                    </DialogDescription>
                                </div>
                            </DialogHeader>

                            <div className="my-2 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-center space-y-2">
                                <p className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-700">
                                    Azione richiesta
                                </p>
                                <p className="text-xs text-zinc-600 font-medium leading-relaxed break-words">
                                    Si prega di inviare a <span className="font-bold text-zinc-900 underline">cblackbullsvolley@gmail.com</span> la copia fronte/retro del documento d'identità dell'atleta.
                                </p>
                            </div>

                            <DialogFooter className="sm:justify-center pt-2">
                                <Button
                                    onClick={() => setOpen(false)}
                                    className="w-full sm:w-auto h-11 bg-red-600 hover:bg-red-700 text-white font-bold px-8 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    Ho capito, chiudi
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {generalError && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs sm:text-sm font-medium flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 shrink-0 text-red-600"/>
                            <span className="break-words">{generalError}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="bg-zinc-50/60 p-5 sm:p-6 rounded-2xl border border-zinc-100 space-y-6">
                            <h3 className="text-base font-bold text-zinc-900 border-l-4 border-red-600 pl-3">
                                Dati Anagrafici
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                                <div className="w-full min-w-0">
                                    <Field icon={User} label="Nome *" id="name" value={formData.name}
                                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}/>
                                </div>
                                <div className="w-full min-w-0">
                                    <Field icon={Contact} label="Cognome *" id="surname" value={formData.surname}
                                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("surname", e.target.value)}/>
                                </div>

                                <div className="space-y-1.5 w-full min-w-0">
                                    <Label htmlFor="gender" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 pl-0.5 cursor-pointer">
                                        <UserCircle className="h-3.5 w-3.5 shrink-0 text-zinc-400"/>
                                        Sesso *
                                    </Label>
                                    <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                                        <SelectTrigger className="bg-white border-zinc-200 focus:border-red-500 focus:ring-0 font-medium h-11 rounded-xl text-sm text-zinc-900 w-full truncate">
                                            <SelectValue placeholder="Seleziona sesso..."/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Maschio</SelectItem>
                                            <SelectItem value="F">Femmina</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-full min-w-0">
                                    <Field icon={Calendar} label="Data di Nascita *" id="dateOfBirth" value={formData.dateOfBirth}
                                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("dateOfBirth", e.target.value)}
                                           type="date"/>
                                </div>

                                <div className="w-full min-w-0">
                                    <Field icon={FileText} label="Carta d'identità *" id="ci" value={formData.ci}
                                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("ci", e.target.value)}/>
                                </div>

                                <div className="w-full min-w-0">
                                    <Field icon={Calendar} label="Scadenza carta d'identità *" id="expiredCI"
                                           value={formData.expiredCI}
                                           type="date"
                                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("expiredCI", e.target.value)}/>
                                </div>

                                <div className="sm:col-span-2 lg:col-span-3 space-y-1.5 w-full min-w-0">
                                    <Field icon={CreditCard} label="Codice Fiscale *" id="nin"
                                           value={formData.nin}
                                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("nin", e.target.value)}
                                           maxLength={16}
                                           placeholder="Inserisci 16 caratteri"
                                    />
                                    {formData.nin && (
                                        <div className={`flex items-center gap-2 text-xs font-semibold px-2 transition-all ${
                                            cfState.status === "valid" ? "text-emerald-600" :
                                                cfState.status === "warning" ? "text-amber-600" : "text-red-600"
                                        }`}>
                                            {cfState.status === "valid" && <CheckCircle className="w-3.5 h-3.5 shrink-0"/>}
                                            {cfState.status === "warning" && <AlertCircle className="w-3.5 h-3.5 shrink-0"/>}
                                            {cfState.status === "error" && <ShieldAlert className="w-3.5 h-3.5 shrink-0"/>}
                                            {cfState.status === "incomplete" && <AlertCircle className="w-3.5 h-3.5 shrink-0"/>}
                                            <span className="break-words">{cfState.message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-zinc-50/60 p-5 sm:p-6 rounded-2xl border border-zinc-100 space-y-6 flex flex-col justify-between">
                                <div className="space-y-5">
                                    <h3 className="text-base font-bold text-zinc-900 border-l-4 border-red-600 pl-3">
                                        Luogo di Nascita
                                    </h3>
                                    <div className="w-full min-w-0">
                                        <Field icon={MapPin} label="Comune di Nascita *" id="birthPlace" value={formData.birthPlace}
                                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("birthPlace", e.target.value)}/>
                                    </div>
                                    <div className="w-full min-w-0">
                                        <Field icon={Globe} label="Provincia (Sigla es. MI) *" id="countryBirthPlace"
                                               value={formData.countryBirthPlace}
                                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("countryBirthPlace", e.target.value)}
                                               maxLength={2}/>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-50/60 p-5 sm:p-6 rounded-2xl border border-zinc-100 space-y-6 flex flex-col justify-between">
                                <div className="space-y-5">
                                    <h3 className="text-base font-bold text-zinc-900 border-l-4 border-red-600 pl-3">
                                        Contatti e Salute
                                    </h3>
                                    <div className="w-full min-w-0">
                                        <Field icon={MapPin} label="Indirizzo di residenza (Via e Comune) *" id="homeAddress"
                                               value={formData.homeAddress}
                                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("homeAddress", e.target.value)}/>
                                    </div>

                                    <div className="space-y-1.5 w-full min-w-0">
                                        <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                                            <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0"/>
                                            Email Genitore / Referente
                                        </Label>
                                        <div className="bg-white border border-zinc-200 text-zinc-700 px-4 py-3 rounded-xl min-h-[44px] flex items-center font-medium text-sm break-all w-full uppercase">
                                            {emailUser || "N/D"}
                                        </div>
                                    </div>

                                    <div className="w-full min-w-0">
                                        <Field icon={Calendar} label="Scadenza Certificato Medico" id="expirationMedicalCertificate"
                                               value={formData.expirationMedicalCertificate}
                                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("expirationMedicalCertificate", e.target.value)}
                                               type="date"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {successMessage && (
                            <div className="flex lg:hidden items-center text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 justify-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500 shrink-0"/> Salvato con successo
                            </div>
                        )}

                        <div className="flex lg:hidden pt-2">
                            <Button
                                onClick={handleSave}
                                disabled={!isFormValid || createAthleteMutation.isPending}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-13 rounded-2xl shadow-lg disabled:opacity-60 text-xs uppercase tracking-wider cursor-pointer transition-all"
                            >
                                {createAthleteMutation.isPending ?
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                                    <UserPlus className="mr-2 h-4 w-4"/>}
                                Registra Atleta
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};