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
        onSuccess: () => {
            utils.user.getAthleteInfo.invalidate({idUser, idAthlete});
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
            <Card
                className="border-zinc-200 bg-white p-8 sm:p-12 text-center text-zinc-500 shadow-sm rounded-2xl w-full">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-red-600"/>
                <p className="font-semibold tracking-wide uppercase text-xs">Caricamento dati atleta...</p>
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
                                Atleta</p>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight truncate">
                                {formData.name || "Nome"} {formData.surname || "Cognome"}
                            </h2>
                            {formData.dateOfBirth && (
                                <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                                    Nato il {new Date(formData.dateOfBirth).toLocaleDateString('it-IT')}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                        {successMessage && (
                            <div
                                className="flex items-center text-xs sm:text-sm font-medium text-green-700 bg-green-50 px-4 py-2.5 rounded-xl border border-green-200 w-full sm:w-auto justify-center">
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500 shrink-0"/> Salvato
                            </div>
                        )}
                        {updateAthleteMutation.isError && (
                            <div
                                className="flex items-center text-xs sm:text-sm font-medium text-red-700 bg-red-50 px-4 py-2.5 rounded-xl border border-red-200 w-full sm:w-auto justify-center">
                                <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 shrink-0"/> Errore
                            </div>
                        )}

                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-4 sm:py-5 rounded-xl shadow-sm transition-colors text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                            >
                                <Pencil className="mr-2 h-4 w-4"/> Modifica Dati
                            </Button>
                        ) : (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={updateAthleteMutation.isPending}
                                    className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-100 py-4 sm:py-5 rounded-xl text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                                >
                                    <X className="mr-2 h-4 w-4"/> Annulla
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={updateAthleteMutation.isPending}
                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold py-4 sm:py-5 px-6 rounded-xl shadow-sm disabled:opacity-60 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
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
                        className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs sm:text-sm font-medium flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-red-600"/>
                        {formError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-100">
                        <h3 className="sm:col-span-2 text-base sm:text-lg font-bold text-zinc-900 mb-1 border-l-4 border-red-600 pl-3">Dati
                            Anagrafici</h3>

                        <Field icon={User} label="Nome" id="name" name="name" value={formData.name}
                               onChange={handleChange} isEditing={isEditing} required disabled={true}/>
                        <Field icon={Contact} label="Cognome" id="surname" name="surname" value={formData.surname}
                               onChange={handleChange} isEditing={isEditing} required disabled={true}/>
                        <Field icon={Calendar} label="Data di Nascita" id="dateOfBirth" name="dateOfBirth"
                               value={formData.dateOfBirth} onChange={handleChange} isEditing={isEditing} type="date"
                               required disabled={true}/>
                        <Field icon={CreditCard} label="Codice Fiscale" id="nin" name="nin" value={formData.nin}
                               onChange={handleChange} isEditing={isEditing} maxLength={16} required disabled={true}/>

                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <Field icon={FileText} label="Carta d'identità" id="ci" name="ci" value={formData.ci}
                                   onChange={handleChange} isEditing={isEditing} required/>
                            <Field icon={Calendar} label="Scadenza carta d'identità" id="expiredCI" name="expiredCI"
                                   value={formData.expiredCI} onChange={handleChange} isEditing={isEditing} type="date"
                                   required/>
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-100">
                        <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 border-l-4 border-red-600 pl-3">Luogo
                            di Nascita</h3>
                        <Field icon={MapPin} label="Comune di Nascita" id="birthPlace" name="birthPlace"
                               value={formData.birthPlace} onChange={handleChange} isEditing={isEditing} required
                               disabled={true}/>
                        <Field icon={Globe} label="Provincia (sigla)" id="countryBirthPlace" name="countryBirthPlace"
                               value={formData.countryBirthPlace} onChange={handleChange} isEditing={isEditing}
                               maxLength={2} required disabled={true}/>
                    </div>

                    <div className="space-y-4 sm:space-y-6 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-100">
                        <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 border-l-4 border-red-600 pl-3">Contatti
                            e Salute</h3>
                        <Field icon={MapPin} label="Indirizzo di Residenza" id="homeAddress" name="homeAddress"
                               value={formData.homeAddress} onChange={handleChange} isEditing={isEditing} required/>

                        <div className="space-y-1.5 w-full">
                            <Label
                                className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 pl-1">
                                <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0"/>
                                <span>Email Genitore / Referente</span>
                            </Label>
                            <div
                                className="bg-white border border-zinc-200/80 text-zinc-900 px-4 py-3 rounded-xl min-h-[44px] flex items-center text-sm break-all w-full uppercase">
                                {emailUser?.toUpperCase() || "N/D"}
                            </div>
                        </div>

                        <Field icon={Calendar} label="Scadenza Certificato Medico" id="expirationMedicalCertificate"
                               name="expirationMedicalCertificate" value={formData.expirationMedicalCertificate}
                               onChange={handleChange} isEditing={isEditing} type="date"/>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};