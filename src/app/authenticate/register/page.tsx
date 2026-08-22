"use client";
import {useState} from "react";
import {AlertCircle, ArrowRight, CheckCircle2, Lock, Loader2, Mail, User as UserIcon, Volleyball} from "lucide-react";
import {Card} from "@/components/ui/card";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {authClient} from "@/lib/auth-client";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {api} from "@/lib/api";
import {Label} from "@/components/ui/label";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [usersurname, setUsersurname] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState("");

    const handleWelcomeUser = api.public.welcomeUser.useMutation({
        onSuccess: () => {
        },
        onError: () => {
        }
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const {error: authError} = await (authClient.signUp.email as (data: {
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
                return;
            }
            handleWelcomeUser.mutate({name: username, surname: usersurname, email: email});
            setSuccess(true);
        } catch (err) {
            setError("Errore imprevisto durante la registrazione.");
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={success} onOpenChange={() => setSuccess(false)}>
                <DialogContent
                    className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
                    <DialogHeader className="space-y-4 text-center">
                        <div
                            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                            <CheckCircle2 className="h-7 w-7 shrink-0"/>
                        </div>
                        <div className="space-y-1.5">
                            <DialogTitle className="text-lg font-black uppercase tracking-tight text-zinc-950">
                                Registrazione completata!
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-zinc-500 leading-relaxed">
                                Il tuo account è stato attivato con successo. Accedi subito per iniziare a gestire la
                                piattaforma.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="sm:justify-center pt-4">
                        <Button
                            onClick={() => router.push("/")}
                            className="w-full sm:w-auto h-11 bg-red-600 hover:bg-red-700 text-white font-bold px-8 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                        >
                            Vai all'area riservata
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={error !== ""} onOpenChange={() => setError("")}>
                <DialogContent
                    className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
                    <DialogHeader className="space-y-4 text-center">
                        <div
                            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
                            <AlertCircle className="h-7 w-7 shrink-0"/>
                        </div>
                        <div className="space-y-1.5">
                            <DialogTitle className="text-lg font-black uppercase tracking-tight text-zinc-950">
                                Attenzione
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-zinc-500 leading-relaxed">
                                {error}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="sm:justify-center pt-4">
                        <DialogClose>
                            <Button
                                className="w-full sm:w-auto h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                            >
                                Chiudi
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div
                className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-hidden bg-zinc-50/50 text-zinc-900">
                <div className="mb-8 text-center z-10 space-y-2">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 shadow-lg shadow-orange-500/20 text-white mb-1">
                        <Volleyball className="w-8 h-8 animate-pulse"/>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                        Black Bulls <span className="text-red-600">Volley</span>
                    </h1>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                        Portale registrazione atleti
                    </p>
                </div>

                <Card
                    className="w-full max-w-xl rounded-3xl shadow-xl border border-zinc-200/80 bg-white p-6 sm:p-8 z-10 transition-all">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold uppercase tracking-wider text-center">
                            Crea il tuo account
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label
                                        className="block text-[11px] font-extrabold tracking-wider uppercase text-zinc-500">
                                        Nome <span className="text-red-600">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span
                                            className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                            <UserIcon className="w-4 h-4"/>
                                        </span>
                                        <Input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Mario"
                                            className="w-full h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 pl-10 text-sm focus-visible:ring-2 focus-visible:ring-red-600/20 focus-visible:border-red-600 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        className="block text-[11px] font-extrabold tracking-wider uppercase text-zinc-500">
                                        Cognome <span className="text-red-600">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span
                                            className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                            <UserIcon className="w-4 h-4"/>
                                        </span>
                                        <Input
                                            type="text"
                                            required
                                            value={usersurname}
                                            onChange={(e) => setUsersurname(e.target.value)}
                                            placeholder="Rossi"
                                            className="w-full h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 pl-10 text-sm focus-visible:ring-2 focus-visible:ring-red-600/20 focus-visible:border-red-600 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label
                                        className="block text-[11px] font-extrabold tracking-wider uppercase text-zinc-500">
                                        Indirizzo email <span className="text-red-600">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span
                                            className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                            <Mail className="w-4 h-4"/>
                                        </span>
                                        <Input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="lamiaemail@gmail.com"
                                            className="w-full h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 pl-10 text-sm focus-visible:ring-2 focus-visible:ring-red-600/20 focus-visible:border-red-600 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label
                                        className="block text-[11px] font-extrabold tracking-wider uppercase text-zinc-500">
                                        Password <span className="text-red-600">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span
                                            className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                            <Lock className="w-4 h-4"/>
                                        </span>
                                        <Input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-11 bg-zinc-50/50 border-zinc-200 rounded-xl px-3.5 pl-10 text-sm focus-visible:ring-2 focus-visible:ring-red-600/20 focus-visible:border-red-600 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin"/>
                            ) : (
                                <>
                                    <span>Completa Registrazione</span>
                                    <ArrowRight className="w-4 h-4"/>
                                </>
                            )}
                        </Button>

                        <div className="pt-2 text-center">
                            <Link href="/authenticate"
                                  className="text-xs text-muted-foreground hover:text-red-400 transition-colors inline-block">
                                Hai già un account? <span className="underline font-semibold">Accedi</span>
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </>
    );
}