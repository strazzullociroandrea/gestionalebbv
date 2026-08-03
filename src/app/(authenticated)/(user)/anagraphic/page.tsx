"use client";

import {authClient} from "@/lib/auth-client";
import {User, Mail, Contact} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";

export default function AnagraphicPage() {
    const {data: session, isPending} = authClient.useSession();
    const user = session?.user as any;

    const getInitials = () => {
        if (!user) return "U";
        const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : "";
        const surnameInitial = user.surname ? user.surname.charAt(0).toUpperCase() : "";
        return `${nameInitial}${surnameInitial}` || "U";
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            La tua anagrafica
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Monitora e gestisci le informazioni personali e i dettagli del tuo account
                    </p>
                </div>
            </div>

            <Card className="rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden bg-white p-0">
                <div className="relative h-36 w-full bg-linear-to-r from-zinc-950 via-zinc-900 to-red-700">
                    <div
                        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-red-500/30 via-transparent to-transparent pointer-events-none"/>
                    <div
                        className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-red-500/40 to-transparent"/>
                </div>

                <CardContent className="px-6 pb-6 pt-0 relative">
                    <div className="-mt-12 mb-6 flex items-end justify-between">
                        <div className="relative">
                            <div
                                className="w-24 h-24 rounded-2xl bg-zinc-950 text-white ring-4 ring-white shadow-md flex items-center justify-center text-3xl font-bold tracking-wider border border-zinc-800">
                                {getInitials()}
                            </div>
                        </div>
                    </div>

                    {isPending ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                            <div className="h-20 bg-slate-100 rounded-xl"/>
                            <div className="h-20 bg-slate-100 rounded-xl"/>
                            <div className="h-20 bg-slate-100 rounded-xl"/>
                            <div className="h-20 bg-slate-100 rounded-xl"/>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-white shadow-sm text-slate-700">
                                        <User className="w-5 h-5"/>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Nome
                  </span>
                                </div>
                                <p className="text-lg font-medium text-slate-900 pl-1">
                                    {user?.name || "Non specificato"}
                                </p>
                            </div>

                            <div
                                className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-white shadow-sm text-slate-700">
                                        <Contact className="w-5 h-5"/>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Cognome
                  </span>
                                </div>
                                <p className="text-lg font-medium text-slate-900 pl-1">
                                    {user?.surname || "Non specificato"}
                                </p>
                            </div>

                            <div
                                className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:border-slate-200 md:col-span-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-white shadow-sm text-slate-700">
                                        <Mail className="w-5 h-5"/>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Indirizzo Email
                  </span>
                                </div>
                                <p className="text-lg font-medium text-slate-900 pl-1 truncate">
                                    {user?.email || "Non specificato"}
                                </p>
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}