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
    ShieldAlert
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {api} from "@/lib/api";
import CodiceFiscale from "codice-fiscale-js";

interface AthleteInfoProps {
    idUser: string;
    idAthlete: string;
    emailUser?: string;
}

export const AthleteInfo = ({idUser, idAthlete, emailUser}: AthleteInfoProps) => {
    const utils = api.useUtils();
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [cfError, setCfError] = useState<string | null>(null);

    const {data: responseData, isLoading: isTrpcLoading, error} = api.user.getAthleteInfo.useQuery(
        {idUser, idAthlete},
        {enabled: Boolean(idUser && idAthlete)}
    );

    const updateAthleteMutation = api.user.updateAthlete.useMutation({
        onSuccess: () => {
            utils.user.getAthleteInfo.invalidate({idUser, idAthlete});
            setIsEditing(false);
            setSuccessMessage(true);
            setTimeout(() => setSuccessMessage(false), 3000);
        },
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
            });
        }
    }, [athleteData]);

    const validateCF = (cfValue: string, currentForm = formData) => {
        if (!cfValue) {
            setCfError(null);
            return true;
        }

        const cleanCf = cfValue.trim().toUpperCase();

        if (cleanCf.length !== 16) {
            setCfError("Il Codice Fiscale deve essere di 16 caratteri.");
            return false;
        }

        if (!CodiceFiscale.check(cleanCf)) {
            setCfError("Formato o carattere di controllo del Codice Fiscale non valido.");
            return false;
        }

        try {
            const cfObj = new CodiceFiscale(cleanCf);
            if (!cfObj.isValid()) {
                setCfError("Codice Fiscale non valido.");
                return false;
            }

            if (currentForm.dateOfBirth) {
                const [yearStr, monthStr, dayStr] = currentForm.dateOfBirth.split("-");
                if (
                    cfObj.year !== parseInt(yearStr, 10) ||
                    cfObj.month !== parseInt(monthStr, 10) ||
                    cfObj.day !== parseInt(dayStr, 10)
                ) {
                    setCfError("La data di nascita non corrisponde al Codice Fiscale inserito.");
                    return false;
                }
            }
        } catch {
            setCfError("Codice Fiscale non valido.");
            return false;
        }

        setCfError(null);
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        const updatedValue = name === "nin" || name === "countryBirthPlace" ? value.toUpperCase() : value;
        const newFormData = {...formData, [name]: updatedValue};

        setFormData(newFormData);

        if (name === "nin" || name === "dateOfBirth") {
            validateCF(newFormData.nin, newFormData);
        }
    };

    const handleSave = () => {
        if (formData.nin && !validateCF(formData.nin, formData)) {
            return;
        }

        updateAthleteMutation.mutate({
            idUser,
            idAthlete,
            ...formData,
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
            });
        }
        setCfError(null);
        setIsEditing(false);
    };

    if (isTrpcLoading) {
        return (
            <Card className=" border-zinc-800 p-8 sm:p-12 text-center text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-red-600"/>
                <p className="font-bold tracking-wider uppercase text-xs sm:text-sm">Caricamento scheda atleta...</p>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-zinc-950 border-red-900/40 p-4 sm:p-6 text-red-500 shadow-xl">
                <div className="flex items-center space-x-3 mb-2">
                    <ShieldAlert className="h-6 w-6 text-red-500 shrink-0"/>
                    <h3 className="font-black uppercase tracking-wider text-sm sm:text-base">Errore Caricamento Dati</h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400">{error.message}</p>
            </Card>
        );
    }

    return (
        <Card className="border border-zinc-800 overflow-hidden p-0 shadow-2xl rounded-2xl relative w-full">
            <div className="relative h-24 sm:h-32 bg-linear-to-r from-red-900 via-red-800 to-red-700 border-b border-red-600/30 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.35),transparent_60%)]"/>
            </div>

            <CardContent className="p-4 sm:p-6 pt-0 relative">
                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-6 sm:mb-8 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-zinc-950 border-2 border-red-600 flex items-center justify-center text-amber-400 font-black text-2xl sm:text-3xl shadow-2xl shadow-red-600/20 shrink-0">
                            {formData.name?.[0]?.toUpperCase() || "B"}
                            {formData.surname?.[0]?.toUpperCase() || "B"}
                        </div>
                        <div className="mb-0 sm:mb-1">
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest leading-tight">
                                {formData.name || "Atleta"} {formData.surname || ""}
                            </h2>
                            <p className="text-[11px] sm:text-xs text-zinc-400 font-semibold tracking-wider uppercase flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"/>
                                Atleta
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        {successMessage && (
                            <span className="flex items-center justify-center text-xs font-bold text-green-400 bg-green-950/60 border border-green-700/60 px-3 py-2 rounded-xl backdrop-blur-md w-full sm:w-auto">
                                <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-400 shrink-0"/> Modifica salvata con successo
                            </span>
                        )}

                        {updateAthleteMutation.isError && (
                            <span className="flex items-center justify-center text-xs font-bold text-red-400 bg-red-950/60 border border-red-700/60 px-3 py-2 rounded-xl backdrop-blur-md w-full sm:w-auto">
                                <ShieldAlert className="h-4 w-4 mr-1.5 text-red-400 shrink-0"/> {updateAthleteMutation.error.message}
                            </span>
                        )}

                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto cursor-pointer bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/25 transition-all"
                            >
                                <Pencil className="mr-2 h-4 w-4"/> Modifica Anagrafica
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={updateAthleteMutation.isPending}
                                    className="flex-1 sm:flex-none cursor-pointer border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs font-bold uppercase rounded-xl"
                                >
                                    <X className="mr-1.5 h-4 w-4"/> Annulla
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={Boolean(cfError) || updateAthleteMutation.isPending}
                                    className="flex-1 sm:flex-none cursor-pointer bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 rounded-xl shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateAthleteMutation.isPending ? (
                                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/>
                                    ) : (
                                        <Save className="mr-1.5 h-4 w-4"/>
                                    )}
                                    Salva
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                    <Card className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center space-x-2.5 text-zinc-400 mb-1.5">
                            <User className="h-4 w-4 text-red-500 shrink-0"/>
                            <Label htmlFor="name" className="text-zinc-400 uppercase text-[11px] font-bold tracking-wider cursor-pointer">Nome</Label>
                        </div>
                        {isEditing ? (
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="border-zinc-700 focus:border-red-600 font-medium h-10 rounded-lg text-sm"
                            />
                        ) : (
                            <p className="text-sm sm:text-base break-words">{formData.name || "N/D"}</p>
                        )}
                    </Card>

                    <Card className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center space-x-2.5 text-zinc-400 mb-1.5">
                            <Contact className="h-4 w-4 text-red-500 shrink-0"/>
                            <Label htmlFor="surname" className="text-zinc-400 uppercase text-[11px] font-bold tracking-wider cursor-pointer">Cognome</Label>
                        </div>
                        {isEditing ? (
                            <Input
                                id="surname"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                className="border-zinc-700 focus:border-red-600 font-medium h-10 rounded-lg text-sm"
                            />
                        ) : (
                            <p className="text-sm sm:text-base break-words">{formData.surname || "N/D"}</p>
                        )}
                    </Card>

                    <Card className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center space-x-2.5 text-zinc-400 mb-1.5">
                            <Calendar className="h-4 w-4 text-red-500 shrink-0"/>
                            <Label htmlFor="dateOfBirth" className="text-zinc-400 uppercase text-[11px] font-bold tracking-wider cursor-pointer">Data di Nascita</Label>
                        </div>
                        {isEditing ? (
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="border-zinc-700 focus:border-red-600 font-medium h-10 rounded-lg text-sm"
                            />
                        ) : (
                            <p className="text-sm sm:text-base">
                                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('it-IT') : "N/D"}
                            </p>
                        )}
                    </Card>

                    <Card className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center space-x-2.5 text-zinc-400 mb-1.5">
                            <Calendar className="h-4 w-4 text-red-500 shrink-0"/>
                            <Label htmlFor="expirationMedicalCertificate" className="text-zinc-400 uppercase text-[11px] font-bold tracking-wider cursor-pointer">Scadenza Certificato Medico</Label>
                        </div>
                        {isEditing ? (
                            <Input
                                id="expirationMedicalCertificate"
                                name="expirationMedicalCertificate"
                                type="date"
                                value={formData.expirationMedicalCertificate}
                                onChange={handleChange}
                                className="border-zinc-700 focus:border-red-600 font-medium h-10 rounded-lg text-sm"
                            />
                        ) : (
                            <p className="text-sm sm:text-base flex items-center gap-2">
                                {formData.expirationMedicalCertificate ? new Date(formData.expirationMedicalCertificate).toLocaleDateString('it-IT') : "N/D"}
                            </p>
                        )}
                    </Card>

                    <Card className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center space-x-2.5 text-zinc-400 mb-1.5">
                            <CreditCard className="h-4 w-4 text-red-500 shrink-0"/>
                            <Label htmlFor="nin" className="text-zinc-400 uppercase text-[11px] font-bold tracking-wider cursor-pointer">Codice Fiscale</Label>
                        </div>
                        {isEditing ? (
                            <div>
                                <Input
                                    id="nin"
                                    maxLength={16}
                                    minLength={16}
                                    name="nin"
                                    value={formData.nin}
                                    onChange={handleChange}
                                    className={`border-zinc-700 focus:border-red-600 uppercase h-10 rounded-lg tracking-wider text-sm ${
                                        cfError ? "border-red-500 focus:border-red-500" : ""
                                    }`}
                                />
                                {cfError && (
                                    <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                                        {cfError}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm sm:text-base uppercase tracking-wider break-all">{formData.nin || "N/D"}</p>
                        )}
                    </Card>

                    <Card className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center space-x-2.5 text-zinc-400 mb-1.5">
                            <MapPin className="h-4 w-4 text-red-500 shrink-0"/>
                            <Label htmlFor="homeAddress" className="text-zinc-400 uppercase text-[11px] font-bold tracking-wider cursor-pointer">Indirizzo di Residenza</Label>
                        </div>
                        {isEditing ? (
                            <Input
                                id="homeAddress"
                                name="homeAddress"
                                value={formData.homeAddress}
                                onChange={handleChange}
                                className="border-zinc-700 focus:border-red-600 font-medium h-10 rounded-lg text-sm"
                            />
                        ) : (
                            <p className="  text-sm sm:text-base break-words">{formData.homeAddress || "N/D"}</p>
                        )}
                    </Card>

                    <Card className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center space-x-2.5 text-zinc-400 mb-1.5">
                            <MapPin className="h-4 w-4 text-red-500 shrink-0"/>
                            <Label htmlFor="birthplace" className="text-zinc-400 uppercase text-[11px] font-bold tracking-wider cursor-pointer">Luogo di Nascita</Label>
                        </div>
                        {isEditing ? (
                            <Input
                                id="birthplace"
                                name="birthPlace"
                                value={formData.birthPlace}
                                onChange={handleChange}
                                className="border-zinc-700 focus:border-red-600 font-medium h-10 rounded-lg text-sm"
                            />
                        ) : (
                            <p className="text-sm sm:text-base break-words">{formData.birthPlace || "N/D"}</p>
                        )}
                    </Card>

                    <Card className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center space-x-2.5 text-zinc-400 mb-1.5">
                            <Globe className="h-4 w-4 text-red-500 shrink-0"/>
                            <Label htmlFor="countryBirthPlace" className="text-zinc-400 uppercase text-[11px] font-bold tracking-wider cursor-pointer">Provincia di Nascita</Label>
                        </div>
                        {isEditing ? (
                            <Input
                                id="countryBirthPlace"
                                name="countryBirthPlace"
                                maxLength={2}
                                value={formData.countryBirthPlace}
                                onChange={handleChange}
                                className="border-zinc-700 focus:border-red-600 font-medium h-10 rounded-lg text-sm"
                            />
                        ) : (
                            <p className="text-sm sm:text-base uppercase">{formData.countryBirthPlace || "N/D"}</p>
                        )}
                    </Card>

                    <Card className="p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors sm:col-span-2">
                        <div className="flex items-center space-x-2.5 text-zinc-400 mb-1.5">
                            <Mail className="h-4 w-4 text-red-500 shrink-0"/>
                            <span className="text-zinc-400 uppercase text-[11px] font-bold tracking-wider">Email Genitore / Referente</span>
                        </div>
                        <p className="text-sm sm:text-base break-all">{emailUser || "N/D"}</p>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
};