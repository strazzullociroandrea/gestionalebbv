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
    FileText
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Field} from "@/components/user/field";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import CodiceFiscale from "codice-fiscale-js";
import {api} from "@/lib/api";

interface AthleteCreateProps {
    idUser: string;
    emailUser?: string;
    onCreated?: (idAthlete?: string) => void;
    setIdAthlete: (idAthlete?: string) => void;
}

export const AthleteCreate = ({idUser, emailUser, onCreated, setIdAthlete}: AthleteCreateProps) => {
    const [isCreated, setIsCreated] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [cfError, setCfError] = useState<string | null>(null);
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
        !cfError;

    const createAthleteMutation = api.user.addAthletesToUser.useMutation({
        onSuccess: async (data) => {
            const createdAthleteId = data?.id;
            setIsCreated(true);
            setSuccessMessage(true);
            if (createdAthleteId) setIdAthlete(createdAthleteId);
            if (onCreated) onCreated(createdAthleteId);
            await utils.user.getAllAthletes.invalidate({
                idUser
            });
            setTimeout(() => setSuccessMessage(false), 4000);
        },
        onError: (error) => {
            setGeneralError(error.message || "Errore durante la creazione.");
        },
    });

    const validateCF = (form = formData) => {
        if (!form.nin) {
            setCfError(null);
            return true;
        }

        const cleanCf = form.nin.trim().toUpperCase();
        if (cleanCf.length !== 16) {
            setCfError("Il CF deve essere di 16 caratteri.");
            return false;
        }

        try {
            const [y, m, d] = form.dateOfBirth.split("-");
            const cfCalcolato = new CodiceFiscale({
                name: form.name,
                surname: form.surname,
                gender: form.gender === "M" ? "M" : "F",
                day: parseInt(d, 10),
                month: parseInt(m, 10),
                year: parseInt(y, 10),
                birthplace: form.birthPlace,
                birthplaceProvincia: form.countryBirthPlace
            });

            const calcolato = (cfCalcolato as any).code.toUpperCase().substring(0, 15);
            const inserito = form.nin.toUpperCase().substring(0, 15);

            if (calcolato !== inserito) {
                setCfError("Il Codice Fiscale non corrisponde ai dati anagrafici.");
                return false;
            }
        } catch {
            setCfError("Impossibile validare il Codice Fiscale con i dati forniti.");
            return false;
        }

        setCfError(null);
        return true;
    };

    const handleChange = (name: string, value: string | null) => {
        const updatedValue = name === "nin" || name === "countryBirthPlace" || name === "ci" ? value?.toUpperCase() : value;
        const updatedForm = {...formData, [name]: updatedValue};
        setFormData(updatedForm);
        validateCF(updatedForm);
    };

    const handleClear = () => {
        setFormData({
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
        setCfError(null);
        setGeneralError(null);
    };

    const handleSave = () => {
        setGeneralError(null);
        if (!isFormValid) {
            setGeneralError("Tutti i campi obbligatori devono essere compilati correttamente.");
            return;
        }
        if (!validateCF(formData)) return;

        createAthleteMutation.mutate({
            idUser,
            ...formData,
            nin: formData.nin.toUpperCase(),
            countryBirthPlace: formData.countryBirthPlace.toUpperCase(),
            ci: formData.ci.toUpperCase()
        });
    };

    return (
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
                            <p className="text-xs sm:text-sm font-medium text-zinc-500 uppercase tracking-wider">Nuovo
                                Tesseramento</p>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight truncate">
                                Registrazione Atleta
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                        {successMessage && (
                            <div
                                className="flex items-center text-xs sm:text-sm font-medium text-green-700 bg-green-50 px-4 py-2.5 rounded-xl border border-green-200 w-full sm:w-auto justify-center">
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500 shrink-0"/> Salvato
                            </div>
                        )}
                        {!isCreated ? (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button
                                    onClick={handleClear}
                                    variant="outline"
                                    className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-100 py-4 sm:py-5 rounded-xl text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                                >
                                    Svuota
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={!isFormValid || createAthleteMutation.isPending}
                                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-semibold py-4 sm:py-5 px-6 rounded-xl shadow-sm disabled:opacity-60 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                                >
                                    {createAthleteMutation.isPending ?
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                                        <UserPlus className="mr-2 h-4 w-4"/>}
                                    Registra
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="text-xs sm:text-sm font-bold text-zinc-900 bg-zinc-100 px-6 py-4 rounded-xl border w-full sm:w-auto text-center">
                                Registrato correttamente
                            </div>
                        )}
                    </div>
                </div>

                {generalError && (
                    <div
                        className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs sm:text-sm font-medium flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-red-600"/>
                        {generalError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-100">
                        <h3 className="sm:col-span-2 text-base sm:text-lg font-bold text-zinc-900 mb-1 border-l-4 border-red-600 pl-3">Dati
                            Anagrafici</h3>
                        <Field icon={User} label="Nome *" id="name" value={formData.name}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}/>
                        <Field icon={Contact} label="Cognome *" id="surname" value={formData.surname}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("surname", e.target.value)}/>

                        <div className="space-y-1.5 w-full">
                            <Label htmlFor="gender"
                                   className="text-zinc-500 text-xs font-medium flex items-center gap-2 pl-1 cursor-pointer">
                                <UserCircle className="h-3.5 w-3.5 shrink-0 text-red-600"/>
                                Sesso *
                            </Label>
                            <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                                <SelectTrigger
                                    className="bg-white border-zinc-200 focus:border-red-500 focus:ring-0 font-medium h-11 rounded-xl text-sm text-zinc-900 w-full">
                                    <SelectValue placeholder="Seleziona sesso..."/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Maschio</SelectItem>
                                    <SelectItem value="F">Femmina</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Field icon={Calendar} label="Data di Nascita *" id="dateOfBirth" value={formData.dateOfBirth}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("dateOfBirth", e.target.value)} type="date"/>                        <Field icon={CreditCard} label="Codice Fiscale *" id="nin" value={formData.nin}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("nin", e.target.value)} error={cfError} maxLength={16}
                               className="sm:col-span-2"/>

                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <Field icon={FileText} label="Carta d'identità *" id="ci" value={formData.ci}
                                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("ci", e.target.value)}/>
                            <Field icon={Calendar} label="Scadenza carta d'identità *" id="expiredCI"
                                   value={formData.expiredCI}
                                   type="date"
                                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("expiredCI", e.target.value)}/>
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-100">
                        <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 border-l-4 border-red-600 pl-3">Luogo
                            di Nascita</h3>
                        <Field icon={MapPin} label="Comune *" id="birthPlace" value={formData.birthPlace}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("birthPlace", e.target.value)}/>
                        <Field icon={Globe} label="Provincia *" id="countryBirthPlace"
                               value={formData.countryBirthPlace}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("countryBirthPlace", e.target.value)} maxLength={2}/>
                    </div>

                    <div className="space-y-4 sm:space-y-6 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-100">
                        <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 border-l-4 border-red-600 pl-3">Contatti
                            e Salute</h3>
                        <Field icon={MapPin} label="Indirizzo *" id="homeAddress" value={formData.homeAddress}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("homeAddress", e.target.value)}/>
                        <div className="space-y-1.5 w-full">
                            <Label className="text-zinc-500 text-xs font-medium flex items-center gap-2 pl-1">
                                <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0"/>
                                Email Genitore / Referente
                            </Label>
                            <div
                                className="bg-white border border-zinc-200 text-zinc-900 px-4 py-3 rounded-xl min-h-[44px] flex items-center font-medium text-sm break-all w-full">
                                {emailUser?.toUpperCase() || "N/D"}
                            </div>
                        </div>
                        <Field icon={Calendar} label="Scadenza Certificato" id="expirationMedicalCertificate"
                               value={formData.expirationMedicalCertificate}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("expirationMedicalCertificate", e.target.value)}
                               type="date"/>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
