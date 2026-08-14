"use client";

import {useState, useEffect} from "react";
import {
    User,
    Contact,
    Mail,
    Phone,
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
    Activity
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {api} from "@/lib/api";
import {InfoField} from "@/components/administrative/info-field";

interface AthleteInfoProps {
    idUser?: string;
    idAthlete: string;
    emailUser?: string;
}

export const AthleteInfo = ({idUser = "", idAthlete, emailUser: initialEmailUser}: AthleteInfoProps) => {
    const utils = api.useUtils();
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const {data: responseData, isLoading: isTrpcLoading, error} = api.administrative.getAthleteInfo.useQuery(
        {idAthlete},
        {enabled: Boolean(idAthlete)}
    );

    const updateAthleteMutation = api.administrative.updateAthlete.useMutation({
        onSuccess: async () => {
            await utils.administrative.getAthleteInfo.invalidate({idAthlete});
            setIsEditing(false);
            setSuccessMessage(true);
            setFormError(null);
            setTimeout(() => setSuccessMessage(false), 3000);
        },
        onError: (error) => {
            setFormError(error.message);
        }
    });

    const athleteData = (responseData as any)?.athlete || responseData;

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        dateOfBirth: "",
        expirationMedicalCertificate: "",
        homeAddress: "",
        nin: "",
        birthPlace: "",
        countryBirthPlace: "",
        status: "active",
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
                status: athleteData.status || "active",
            });
        }
    }, [athleteData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target;
        const updatedValue = type === "date" ? value : value.toUpperCase();
        setFormData(prev => ({...prev, [name]: updatedValue}));
    };

    const handleSelectChange = (name: string, value: string | null) => {
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSave = () => {
        const requiredFields = ['name', 'surname', 'dateOfBirth', 'homeAddress', 'nin', 'birthPlace', 'countryBirthPlace'];
        const isEmpty = requiredFields.some(field => !formData[field as keyof typeof formData]?.trim());

        if (isEmpty) {
            setFormError("Tutti i campi contrassegnati con * sono obbligatori.");

            return;
        }

        updateAthleteMutation.mutate({
            idUser: idUser,
            idAthlete,
            name: formData.name,
            surname: formData.surname,
            dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : "",
            expirationMedicalCertificate: formData.expirationMedicalCertificate ? formData.expirationMedicalCertificate : "",
            homeAddress: formData.homeAddress,
            nin: formData.nin,
            birthPlace: formData.birthPlace,
            countryBirthPlace: formData.countryBirthPlace,
            status: formData.status === "active" ? "active" : "inactive",
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
                status: athleteData.status || "active",
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

                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-4 sm:py-5 rounded-xl shadow-sm transition-colors text-xs sm:text-sm uppercase tracking-wider"
                            >
                                <Pencil className="mr-2 h-4 w-4"/> Modifica Dati
                            </Button>
                        ) : (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={updateAthleteMutation.isPending}
                                    className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-100 py-4 sm:py-5 rounded-xl text-xs sm:text-sm uppercase tracking-wider"
                                >
                                    <X className="mr-2 h-4 w-4"/> Annulla
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={updateAthleteMutation.isPending}
                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold py-4 sm:py-5 px-6 rounded-xl shadow-sm disabled:opacity-60 text-xs sm:text-sm uppercase tracking-wider"
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

                        <InfoField icon={User} label="Nome" id="name" value={formData.name} handleChange={handleChange}
                                   isEditing={isEditing} required/>
                        <InfoField icon={Contact} label="Cognome" id="surname" value={formData.surname}
                                   handleChange={handleChange} isEditing={isEditing} required/>
                        <InfoField icon={Calendar} label="Data di Nascita" id="dateOfBirth" value={formData.dateOfBirth}
                                   handleChange={handleChange} isEditing={isEditing} type="date" required/>
                        <InfoField icon={CreditCard} label="Codice Fiscale" id="nin" value={formData.nin}
                                   handleChange={handleChange} isEditing={isEditing} maxLength={16} required/>
                    </div>

                    <div className="space-y-4 sm:space-y-6 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-100">
                        <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 border-l-4 border-red-600 pl-3">Luogo
                            di Nascita</h3>
                        <InfoField icon={MapPin} label="Comune di Nascita" id="birthPlace" value={formData.birthPlace}
                                   handleChange={handleChange} isEditing={isEditing} required/>
                        <InfoField icon={Globe} label="Provincia (sigla)" id="countryBirthPlace"
                                   value={formData.countryBirthPlace} handleChange={handleChange} isEditing={isEditing}
                                   maxLength={2} required/>
                    </div>

                    <div className="space-y-4 sm:space-y-6 bg-zinc-50/50 p-4 sm:p-6 rounded-2xl border border-zinc-100">
                        <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 border-l-4 border-red-600 pl-3">Contatti
                            e Stato</h3>
                        <InfoField icon={MapPin} label="Indirizzo di Residenza" id="homeAddress"
                                   value={formData.homeAddress} handleChange={handleChange} isEditing={isEditing}
                                   required/>

                        <div className="space-y-1.5 w-full">
                            <Label htmlFor="status"
                                   className="text-zinc-500 text-xs font-medium flex items-center gap-1.5 pl-1 cursor-pointer">
                                <Activity
                                    className={`h-3.5 w-3.5 shrink-0 ${isEditing ? 'text-red-600' : 'text-zinc-400'}`}/>
                                <span>Stato Atleta</span>
                                <span className="text-red-600 font-bold">*</span>
                            </Label>
                            {isEditing ? (
                                <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                                    <SelectTrigger
                                        className="bg-white border-zinc-200 focus:border-red-500 focus:ring-0 font-medium h-11 rounded-xl text-sm text-zinc-900 w-full">
                                        <SelectValue placeholder="Seleziona stato..."/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Attivo</SelectItem>
                                        <SelectItem value="inactive">Non attivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div
                                    className="bg-white border border-zinc-200/80 text-zinc-900 px-4 py-3 rounded-xl min-h-[44px] flex items-center font-medium text-sm uppercase w-full">
                                    {formData.status === "active" ? "Attivo" : "Non attivo"}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor={"emailuser"}
                                   className="text-zinc-500 text-xs font-medium flex items-center gap-1.5 pl-1 cursor-pointer">
                                <Mail className={`h-3.5 w-3.5 shrink-0 text-red-600'`}/>
                                <span>Email Genitore / Referente</span>
                                <span className="text-red-600 font-bold">*</span>
                            </Label>
                            <div
                                className="bg-white border border-zinc-200/80 text-zinc-900 px-4 py-3 rounded-xl min-h-[44px] flex items-center font-medium text-sm break-all uppercase w-full">
                                {responseData?.user?.email || "N/D"}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor={"phoneuser"}
                                   className="text-zinc-500 text-xs font-medium flex items-center gap-1.5 pl-1 cursor-pointer">
                                <Phone className={`h-3.5 w-3.5 shrink-0 text-red-600'`}/>
                                <span>Cellulare Genitore</span>
                                <span className="text-red-600 font-bold">*</span>
                            </Label>
                            <div
                                className="bg-white border border-zinc-200/80 text-zinc-900 px-4 py-3 rounded-xl min-h-[44px] flex items-center font-medium text-sm break-all uppercase w-full">
                                {responseData?.user?.phoneNumber || "N/D"}
                            </div>
                        </div>

                        <InfoField icon={Calendar} label="Scadenza Certificato Medico" id="expirationMedicalCertificate"
                                   value={formData.expirationMedicalCertificate} handleChange={handleChange}
                                   isEditing={isEditing} type="date"/>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


