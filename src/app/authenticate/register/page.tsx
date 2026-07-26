"use client";

import {
    ArrowRight,
    KeyRound,
    Lock,
    Mail,
    Plus,
    ShieldCheck,
    Trash2,
    User as UserIcon,
    Volleyball,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import {useState} from "react";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {AthleteFormState} from "@/lib/schemas/athlete-data";
import CodiceFiscale from "codice-fiscale-js";
import {authClient} from "@/lib/auth-client";
import {api} from "@/lib/api";
import {useRouter} from "next/navigation";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [usersurname, setUsersurname] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");

    const [athletes, setAthletes] = useState<AthleteFormState[] | []>([]);
    const [cfErrors, setCfErrors] = useState<{ [index: number]: string }>({});

    const addAthletesToUser = api.public.addAthletesToUser.useMutation({
        onSuccess: (data) => {
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const validateCodiceFiscale = (athlete: AthleteFormState): string | null => {
        const {name, surname, gender, dateOfBirth, birthPlace, birthProvince, nin} = athlete;

        if (
            !name.trim() ||
            !surname.trim() ||
            !gender.trim() ||
            !dateOfBirth.trim() ||
            !birthPlace.trim() ||
            !birthProvince.trim() ||
            nin.trim().length !== 16
        ) {
            return null;
        }

        try {
            const [year, month, day] = dateOfBirth.split("-");
            if (!year || !month || !day) return null;

            const cf = new CodiceFiscale({
                name: name.trim(),
                surname: surname.trim(),
                gender: gender.trim().charAt(0) as "M" | "F",
                day: parseInt(day, 10),
                month: parseInt(month, 10),
                year: parseInt(year, 10),
                birthplace: birthPlace.trim(),
                birthplaceProvincia: birthProvince.trim().toUpperCase()
            });

            if (cf.toString().toUpperCase() !== nin.trim().toUpperCase()) {
                return "Il codice fiscale inserito non corrisponde ai dati anagrafici.";
            }
            return null;
        } catch (err) {
            return "Errore nel calcolo o nei dati inseriti (es. comune non valido).";
        }
    };

    const handleAthleteChange = (index: number, field: keyof AthleteFormState, value: any) => {
        setAthletes((prevAthletes) => {
            const updated = [...prevAthletes];
            updated[index] = {
                ...updated[index],
                [field]: field === "gender" ? (value as "M" | "F") : value
            };

            const errorMsg = validateCodiceFiscale(updated[index]);

            setCfErrors((prevErrors) => {
                const newCfErrors = {...prevErrors};
                if (errorMsg) {
                    newCfErrors[index] = errorMsg;
                } else {
                    delete newCfErrors[index];
                }
                return newCfErrors;
            });

            return updated;
        });
    };

    const handleAddAthlete = () => {
        setAthletes([
            ...athletes,
            {
                name: "",
                surname: "",
                gender: "M",
                dateOfBirth: "",
                birthPlace: "",
                birthProvince: "",
                homeAddress: "",
                nin: "",
                expirationMedicalCertificate: "",
                teamPassword: "",
            }
        ]);
    };

    const handleRemoveAthlete = (index: number) => {
        const updated = athletes.filter((_, i) => i !== index);
        const newCfErrors = {...cfErrors};
        delete newCfErrors[index];
        setCfErrors(newCfErrors);
        setAthletes(updated);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (Object.keys(cfErrors).length > 0) {
            setError("Correggi il codice fiscale degli atleti inseriti.");
            return;
        }

        setLoading(true);

        try {
            const {data, error: authError} = await (authClient.signUp.email as (data: {
                email: string;
                password: string;
                name: string;
                surname: string;
                emailVerified: number;
            }) => Promise<any>)({
                email,
                password,
                name: username,
                surname: usersurname,
                emailVerified: 1
            });

            if (authError) {
                setError(authError.message || "Errore durante la registrazione dell'utente.");
                setLoading(false);
            } else {
                const userId: string = data.user.id;

                if (athletes.length > 0) {
                    await addAthletesToUser.mutateAsync({
                        userId,
                        athletes: athletes.map((athlete) => ({
                            name: athlete.name,
                            surname: athlete.surname,
                            dateOfBirth: athlete.dateOfBirth,
                            homeAddress: athlete.homeAddress,
                            nin: athlete.nin,
                            expirationMedicalCertificate: athlete.expirationMedicalCertificate,
                            birthPlace: athlete.birthPlace,
                            countryBirthPlace: athlete.birthProvince.trim().toUpperCase(),
                        })),
                    });
                }

                router.push("/");
            }
        } catch (err) {
            setError("Errore imprevisto durante la registrazione.");
            setLoading(false);
        }
    };

    const getCfStatus = (athlete: AthleteFormState, index: number) => {
        if (athlete.nin.trim().length === 0) return null;
        if (cfErrors[index]) return false;
        if (athlete.nin.trim().length === 16) return true;
        return null;
    };

    return (
        <div
            className="min-h-screen flex flex-col justify-center items-center p-4 py-12 relative overflow-hidden bg-background text-foreground">
            <div className="mb-8 text-center z-10">
                <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/30 mb-3 text-white">
                    <Volleyball className="w-8 h-8"/>
                </div>
                <h1 className="text-2xl font-black uppercase tracking-wider">
                    Black Bulls <span className="text-red-500">Volley</span>
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    Portale registrazione atleti
                </p>
            </div>

            <Card
                className="w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 z-10 bg-card text-card-foreground border-border">
                <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-center">
                        Crea il tuo account
                    </h2>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                        Inserisci i tuoi dati personali e registra gli atleti da associare al portale.
                    </p>
                </div>

                <Dialog open={error !== ""} onOpenChange={() => setError("")}>
                    <DialogContent
                        className="rounded-3xl border-border bg-card text-card-foreground p-6 shadow-2xl sm:max-w-md">
                        <DialogHeader className="space-y-3">
                            <div
                                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 shadow-inner">
                                <AlertCircle className="h-6 w-6 shrink-0"/>
                            </div>
                            <DialogTitle
                                className="text-center text-base font-black uppercase tracking-wider text-foreground">
                                Attenzione
                            </DialogTitle>
                        </DialogHeader>

                        <DialogDescription className="text-center text-xs text-muted-foreground mt-1 mb-2">
                            <span className="block font-medium">{error}</span>
                        </DialogDescription>

                        <DialogFooter className="sm:justify-center pt-2">
                            <DialogClose>
                                <Button
                                    variant="default"
                                    className="w-full sm:w-auto inline-flex items-center justify-center bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    Chiudi
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                            <UserIcon className="w-4 h-4"/> 1. Dati Anagrafici Utente / Genitore
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">
                                    Nome*
                                </label>
                                <div className="relative">
                                    <span
                                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                        <UserIcon className="w-4 h-4"/>
                                    </span>
                                    <Input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Mario"
                                        className="w-full h-11 bg-background/50 border-input rounded-xl px-3.5 pl-10 text-sm focus-visible:ring-1 focus-visible:ring-red-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">
                                    Cognome*
                                </label>
                                <div className="relative">
                                    <span
                                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                        <UserIcon className="w-4 h-4"/>
                                    </span>
                                    <Input
                                        type="text"
                                        required
                                        value={usersurname}
                                        onChange={(e) => setUsersurname(e.target.value)}
                                        placeholder="Rossi"
                                        className="w-full h-11 bg-background/50 border-input rounded-xl px-3.5 pl-10 text-sm focus-visible:ring-1 focus-visible:ring-red-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">
                                    Indirizzo email*
                                </label>
                                <div className="relative">
                                    <span
                                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                        <Mail className="w-4 h-4"/>
                                    </span>
                                    <Input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="lamiaemail@gmail.com"
                                        className="w-full h-11 bg-background/50 border-input rounded-xl px-3.5 pl-10 text-sm focus-visible:ring-1 focus-visible:ring-red-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">
                                    Password*
                                </label>
                                <div className="relative">
                                    <span
                                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                        <Lock className="w-4 h-4"/>
                                    </span>
                                    <Input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-11 bg-background/50 border-input rounded-xl px-3.5 pl-10 text-sm focus-visible:ring-1 focus-visible:ring-red-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/80">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                <Volleyball className="w-4 h-4"/> 2. Profilo atleti associati
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddAthlete}
                                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4"/> Aggiungi Atleta
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {athletes.map((athlete, index) => {
                            const status = getCfStatus(athlete, index);
                            const hasError = !!cfErrors[index];

                            return (
                                <div
                                    key={index}
                                    className="p-4 md:p-5 rounded-2xl bg-background/40 border border-border space-y-4 relative"
                                >
                                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                        <span
                                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Atleta #{index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAthlete(index)}
                                            className="text-red-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                                            title="Rimuovi atleta"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label
                                                className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                                Nome Atleta*
                                            </label>
                                            <Input
                                                type="text"
                                                required
                                                value={athlete.name}
                                                onChange={(e) => handleAthleteChange(index, "name", e.target.value)}
                                                placeholder="Nome"
                                                className="w-full h-10 bg-background/50 border-input rounded-xl text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                                Cognome Atleta*
                                            </label>
                                            <Input
                                                type="text"
                                                required
                                                value={athlete.surname}
                                                onChange={(e) => handleAthleteChange(index, "surname", e.target.value)}
                                                placeholder="Cognome"
                                                className="w-full h-10 bg-background/50 border-input rounded-xl text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="col-span-2">
                                            <label
                                                className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                                Data di Nascita*
                                            </label>
                                            <Input
                                                type="date"
                                                required
                                                value={athlete.dateOfBirth}
                                                onChange={(e) => handleAthleteChange(index, "dateOfBirth", e.target.value)}
                                                className="w-full h-10 bg-background/50 border-input rounded-xl text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label
                                                className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                                Sesso*
                                            </label>
                                            <select
                                                value={athlete.gender}
                                                onChange={(e) => handleAthleteChange(index, "gender", e.target.value)}
                                                className="w-full h-10 bg-background/50 border border-input rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                            >
                                                <option value="M">Maschio</option>
                                                <option value="F">Femmina</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label
                                                className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                                Luogo di Nascita*
                                            </label>
                                            <Input
                                                type="text"
                                                required
                                                value={athlete.birthPlace}
                                                onChange={(e) => handleAthleteChange(index, "birthPlace", e.target.value)}
                                                placeholder="Città di nascita"
                                                className="w-full h-10 bg-background/50 border-input rounded-xl text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                                Provincia Nascita*
                                            </label>
                                            <Input
                                                type="text"
                                                required
                                                maxLength={2}
                                                value={athlete.birthProvince}
                                                onChange={(e) => handleAthleteChange(index, "birthProvince", e.target.value.toUpperCase())}
                                                placeholder="MI"
                                                className="w-full h-10 bg-background/50 border-input rounded-xl text-sm uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                            Indirizzo di Residenza*
                                        </label>
                                        <Input
                                            type="text"
                                            required
                                            value={athlete.homeAddress}
                                            onChange={(e) => handleAthleteChange(index, "homeAddress", e.target.value)}
                                            placeholder="Via Roma 1, Città"
                                            className="w-full h-10 bg-background/50 border-input rounded-xl text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label
                                                className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                                Codice Fiscale*
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    required
                                                    maxLength={16}
                                                    minLength={16}
                                                    value={athlete.nin}
                                                    onChange={(e) => handleAthleteChange(index, "nin", e.target.value.toUpperCase())}
                                                    placeholder="RSSMRA..."
                                                    className={`w-full h-10 bg-background/50 rounded-xl text-sm uppercase font-mono pr-9 transition-colors ${
                                                        status === true
                                                            ? "border-emerald-500 focus-visible:ring-emerald-500"
                                                            : hasError
                                                                ? "border-red-500 focus-visible:ring-red-500"
                                                                : "border-input"
                                                    }`}
                                                />
                                                <div
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    {status === true &&
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500"/>}
                                                    {hasError && <AlertCircle className="w-4 h-4 text-red-500"/>}
                                                </div>
                                            </div>
                                            {hasError && (
                                                <p className="text-[10px] text-red-500 mt-1 font-medium">{cfErrors[index]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                                Scadenza Certificato Medico
                                            </label>
                                            <Input
                                                type="date"
                                                value={athlete.expirationMedicalCertificate}
                                                onChange={(e) => handleAthleteChange(index, "expirationMedicalCertificate", e.target.value)}
                                                className="w-full h-10 bg-background/50 border-input rounded-xl text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">
                                            Password Squadra*
                                        </label>
                                        <div className="relative">
                                            <span
                                                className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                                                <KeyRound className="w-4 h-4"/>
                                            </span>
                                            <Input
                                                type="password"
                                                required
                                                value={athlete.teamPassword}
                                                onChange={(e) => handleAthleteChange(index, "teamPassword", e.target.value)}
                                                placeholder="Password fornita dalla squadra"
                                                className="w-full h-10 bg-background/50 border-input rounded-xl pl-10 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                        <span>{loading ? "Registrazione in corso..." : "Completa Registrazione"}</span>
                        {!loading && <ArrowRight className="w-4 h-4"/>}
                    </button>

                    <div className="mt-4 text-center">
                        <Link href="/authenticate"
                              className="text-xs text-muted-foreground hover:text-red-400 transition-colors inline-block">
                            Hai già un account? <span className="underline font-semibold">Accedi al portale</span>
                        </Link>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-border/80 text-center">
                    <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-500"/>
                        <span>Per qualsiasi problema contatta la segreteria.</span>
                    </p>
                </div>
            </Card>
        </div>
    );
}