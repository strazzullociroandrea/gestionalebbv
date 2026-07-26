"use client";

import {useState} from "react";
import {
    ShieldCheck,
    Mail,
    Lock,
    ArrowRight,
    Volleyball
} from "lucide-react";
import {
    Card,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import Link from "next/link";
import {authClient} from "@/lib/auth-client";

export default function LoginCard() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const {data, error} = await authClient.signIn.email({
                email,
                password,
            });

        } catch (err: any) {
            setError("Credenziali non valide o errore di autenticazione.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-background text-foreground">

            <div className="mb-8 text-center z-10">
                <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 shadow-lg shadow-red-600/30 mb-3 text-white">
                    <Volleyball className="w-8 h-8"/>
                </div>
                <h1 className="text-2xl font-black uppercase tracking-wider">
                    Black Bulls <span className="text-red-500">Volley</span>
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    Area Riservata atleti e staff
                </p>
            </div>

            <Card
                className="w-full max-w-md rounded-3xl shadow-2xl p-8 z-10 bg-card text-card-foreground border-border">

                <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-center">
                        Accedi al Portale
                    </h2>
                </div>

                {error && (
                    <div
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">
                            Indirizzo Email / Username
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
                            Password
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <span>{loading ? "Elaborazione..." : "Accedi"}</span>
                        {!loading && <ArrowRight className="w-4 h-4"/>}
                    </button>

                    <div className="mt-4 text-center">
                        <Link href="/authenticate/register"
                              className="text-xs text-muted-foreground hover:text-red-400 transition-colors inline-block">
                            Sei un nuovo atleta? <span className="underline font-semibold">Registrati</span>
                        </Link>
                    </div>
                </form>

                <div className="mt-5 pt-6 border-t border-border/80 text-center">
                    <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-500"/>
                        <span>Per qualsiasi problema contatta la segreteria.</span>
                    </p>
                </div>

            </Card>
        </div>
    );
}