"use client";

import {useState, useEffect} from "react";
import {
    User,
    Contact,
    Mail,
    Calendar,
    MapPin,
    CreditCard,
    Globe,
    Pencil,
    Save,
    X,
    Loader2,
    CheckCircle2,
    ShieldAlert,
    UserCircle,
    FileText
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Field} from "@/components/user/field";
import {api} from "@/lib/api";

interface AthleteInfoProps {
    idUser: string;
    idAthlete: string;
    emailUser?: string;
}

export const AthleteInfo = ({idUser, idAthlete, emailUser}: AthleteInfoProps) => {
    const utils = api.useUtils();
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const {data: responseData, isLoading: isTrpcLoading, error} = api.user.getAthleteInfo.useQuery(
        {idUser, idAthlete},
        {enabled: Boolean(idUser && idAthlete)}
    );

    const updateAthleteMutation = api.user.updateAthlete.useMutation({
        onSuccess: async () => {
            await utils.user.getAthleteInfo.invalidate({idUser, idAthlete});
            setIsEditing(false);
            setSuccessMessage(true);
            setFormError(null);
            setTimeout(() => setSuccessMessage(false), 3000);
        },
    });

    const athleteData = responseData;

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        dateOfBirth: "",
        expirationMedicalCertificate: "",
        homeAddress: "",
        nin: "",
        birthPlace: "",
        countryBirthPlace: "",
        ci: "",
        expiredCI: ""
    });

    useEffect(() => {
        if (athleteData) {
            setFormData({
                name: athleteData.name || "",
                surname: athleteData.surname || "",
                dateOfBirth: athleteData.dateOfBirth ? new Date(athleteData.dateOfBirth).toISOString().split('T')[0] : "",
                expirationMedicalCertificate: athleteData.expirationMedicalCertificate ? new Date(athleteData.expirationMedicalCertificate).toISOString().split('T')[0] : "",
                homeAddress: athleteData.homeAddress || "",
                nin: athleteData.nin || "",
                birthPlace: athleteData.birthPlace || "",
                countryBirthPlace: athleteData.countryBirthPlace || "",
                ci: athleteData.ci || "",
                expiredCI: athleteData.expiredCI ? new Date(athleteData.expiredCI).toISOString().split('T')[0] : ""
            });
        }
    }, [athleteData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target;
        const updatedValue = type === "date" || name === "countryBirthPlace" || name === "ci" ? value.toUpperCase() : value;
        setFormData(prev => ({...prev, [name]: updatedValue}));
    };

    const handleSave = () => {
        if (!formData.homeAddress?.trim()) {
            setFormError("L'indirizzo di residenza è obbligatorio.");
            return;
        }

        updateAthleteMutation.mutate({
            idUser,
            idAthlete,
            homeAddress: formData.homeAddress,
            expirationMedicalCertificate: formData.expirationMedicalCertificate || "",
            ci: formData.ci || "",
            expiredCI: formData.expiredCI || ""
        });
    };

    const handleCancel = () => {
        if (athleteData) {
            setFormData({
                name: athleteData.name || "",
                surname: athleteData.surname || "",
                dateOfBirth: athleteData.dateOfBirth ? new Date(athleteData.dateOfBirth).toISOString().split('T')[0] : "",
                expirationMedicalCertificate: athleteData.expirationMedicalCertificate ? new Date(athleteData.expirationMedicalCertificate).toISOString().split('T')[0] : "",
                homeAddress: athleteData.homeAddress || "",
                nin: athleteData.nin || "",
                birthPlace: athleteData.birthPlace || "",
                countryBirthPlace: athleteData.countryBirthPlace || "",
                ci: athleteData.ci || "",
                expiredCI: athleteData.expiredCI ? new Date(athleteData.expiredCI).toISOString().split('T')[0] : ""
            });
        }
        setFormError(null);
        setIsEditing(false);
    };

    if (isTrpcLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-8">
                <Card
                    className="border border-zinc-200 bg-white p-12 text-center text-zinc-500 shadow-sm rounded-2xl sm:rounded-3xl w-full">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-red-600"/>
                    <p className="font-extrabold tracking-widest uppercase text-xs">Caricamento dati atleta...</p>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-8">
                <Card
                    className="border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm rounded-2xl sm:rounded-3xl w-full">
                    <div className="flex items-start space-x-3">
                        <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5"/>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold uppercase tracking-wider text-sm">Errore di connessione</h3>
                            <p className="text-xs text-red-600 font-medium break-all mt-1">{error.message}</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-black">
            <Card
                className="border border-zinc-200 bg-white shadow-lg shadow-zinc-200/40 rounded-2xl sm:rounded-3xl w-full overflow-hidden relative">
                <div className="h-1.5 bg-red-600 w-full"/>

                <CardContent className="p-5 sm:p-8 lg:p-10">
                    <div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-zinc-100">
                        <div className="flex items-start sm:items-center gap-4 text-left w-full min-w-0">
                            <div
                                className="bg-red-50 p-3 sm:p-4 rounded-2xl border border-red-100 shrink-0 shadow-inner">
                                <UserCircle className="w-10 h-10 sm:w-16 sm:h-16 text-red-600"/>
                            </div>
                            <div className="w-full min-w-0">
                                <span
                                    className="text-[11px] sm:text-xs font-black text-red-600 uppercase tracking-widest block">Scheda Atleta</span>
                                <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight break-all">
                                    {formData.name.charAt(0).toUpperCase() || "Nome"}. {formData.surname || "Cognome"}
                                </h2>
                                {formData.dateOfBirth && (
                                    <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1 truncate">
                                        Nato il {new Date(formData.dateOfBirth).toLocaleDateString('it-IT')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div
                            className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-start md:justify-end">
                            {successMessage && (
                                <div
                                    className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200 w-full sm:w-auto justify-center">
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500 shrink-0"/> Salvato con
                                    successo
                                </div>
                            )}
                            {updateAthleteMutation.isError && (
                                <div
                                    className="flex items-center text-xs font-medium text-red-700 bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-200 w-full sm:w-auto justify-center">
                                    <ShieldAlert className="h-4 w-4 mr-2 text-red-600 shrink-0"/> Errore nel salvataggio
                                </div>
                            )}

                            {!isEditing ? (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold h-11 sm:h-12 px-6 sm:px-8 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider cursor-pointer"
                                >
                                    <Pencil className="mr-2 h-4 w-4"/> Modifica Dati
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        disabled={updateAthleteMutation.isPending}
                                        className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-100 h-11 sm:h-12 px-5 sm:px-6 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer"
                                    >
                                        <X className="mr-2 h-4 w-4"/> Annulla
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={updateAthleteMutation.isPending}
                                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 sm:h-12 px-6 sm:px-8 rounded-xl shadow-md disabled:opacity-60 text-xs uppercase tracking-wider cursor-pointer transition-all"
                                    >
                                        {updateAthleteMutation.isPending ? (
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

                    {formError && (
                        <div
                            className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs sm:text-sm font-medium flex items-start gap-2.5">
                            <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 mt-0.5"/>
                            <span className="break-all flex-1">{formError}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="bg-zinc-50/60 p-4 sm:p-6 rounded-2xl border border-zinc-100 space-y-6">
                            <h3 className="text-base font-bold text-zinc-900 border-l-4 border-red-600 pl-3">
                                Dati Anagrafici
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="w-full min-w-0">
                                    <Field icon={User} label="Nome" id="name" name="name" value={formData.name}
                                           onChange={handleChange} isEditing={isEditing} required disabled={true}/>
                                </div>
                                <div className="w-full min-w-0">
                                    <Field icon={Contact} label="Cognome" id="surname" name="surname"
                                           value={formData.surname}
                                           onChange={handleChange} isEditing={isEditing} required disabled={true}/>
                                </div>
                                <div className="w-full min-w-0">
                                    <Field icon={Calendar} label="Data di Nascita" id="dateOfBirth" name="dateOfBirth"
                                           value={formData.dateOfBirth} onChange={handleChange} isEditing={isEditing}
                                           type="date"
                                           required disabled={true}/>
                                </div>
                                <div className="w-full min-w-0">
                                    <Field icon={CreditCard} label="Codice Fiscale" id="nin" name="nin"
                                           value={formData.nin}
                                           onChange={handleChange} isEditing={isEditing} maxLength={16} required
                                           disabled={true}/>
                                </div>
                                <div className="w-full min-w-0">
                                    <Field icon={FileText} label="Numero carta d'identità" id="ci" name="ci"
                                           value={formData.ci}
                                           onChange={handleChange} isEditing={isEditing} required/>
                                </div>
                                <div className="w-full min-w-0">
                                    <Field icon={Calendar} label="Scadenza carta d'identità" id="expiredCI"
                                           name="expiredCI"
                                           value={formData.expiredCI} onChange={handleChange} isEditing={isEditing}
                                           type="date"
                                           required/>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div
                                className="bg-zinc-50/60 p-4 sm:p-6 rounded-2xl border border-zinc-100 space-y-6 flex flex-col justify-between">
                                <div className="space-y-5">
                                    <h3 className="text-base font-bold text-zinc-900 border-l-4 border-red-600 pl-3">
                                        Luogo di Nascita
                                    </h3>
                                    <div className="w-full min-w-0">
                                        <Field icon={MapPin} label="Comune di Nascita" id="birthPlace" name="birthPlace"
                                               value={formData.birthPlace} onChange={handleChange} isEditing={isEditing}
                                               required
                                               disabled={true}/>
                                    </div>
                                    <div className="w-full min-w-0">
                                        <Field icon={Globe} label="Provincia (sigla)" id="countryBirthPlace"
                                               name="countryBirthPlace"
                                               value={formData.countryBirthPlace} onChange={handleChange}
                                               isEditing={isEditing}
                                               maxLength={2} required disabled={true}/>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-zinc-50/60 p-4 sm:p-6 rounded-2xl border border-zinc-100 space-y-6 flex flex-col justify-between">
                                <div className="space-y-5">
                                    <h3 className="text-base font-bold text-zinc-900 border-l-4 border-red-600 pl-3">
                                        Contatti e Salute
                                    </h3>
                                    <div className="w-full min-w-0">
                                        <Field icon={MapPin} label="Indirizzo di Residenza" id="homeAddress"
                                               name="homeAddress"
                                               value={formData.homeAddress} onChange={handleChange}
                                               isEditing={isEditing} required/>
                                    </div>

                                    <div className="space-y-1.5 w-full min-w-0">
                                        <Label
                                            className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                                            <Mail className="h-3.5 w-3.5 text-red-600 shrink-0"/>
                                            <span>Email Genitore / Referente</span>
                                        </Label>
                                        <div
                                            className="bg-white border border-zinc-200 text-zinc-700 px-4 py-3 rounded-xl min-h-[44px] flex items-center font-medium text-sm break-all w-full uppercase">
                                            {emailUser?.toUpperCase() || "N/D"}
                                        </div>
                                    </div>

                                    <div className="w-full min-w-0">
                                        <Field icon={Calendar} label="Scadenza Certificato Medico"
                                               id="expirationMedicalCertificate"
                                               name="expirationMedicalCertificate"
                                               value={formData.expirationMedicalCertificate}
                                               onChange={handleChange} isEditing={isEditing} type="date"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div
                                className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={updateAthleteMutation.isPending}
                                    className="w-full sm:w-auto border-zinc-200 text-zinc-700 hover:bg-zinc-100 h-12 px-6 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer"
                                >
                                    <X className="mr-2 h-4 w-4"/> Annulla
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={updateAthleteMutation.isPending}
                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-xl shadow-md disabled:opacity-60 text-xs uppercase tracking-wider cursor-pointer transition-all"
                                >
                                    {updateAthleteMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    ) : (
                                        <Save className="mr-2 h-4 w-4"/>
                                    )}
                                    Salva Modifiche
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};