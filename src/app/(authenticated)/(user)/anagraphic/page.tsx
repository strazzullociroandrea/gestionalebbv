"use client";

import {authClient} from "@/lib/auth-client";
import {User, Mail, Contact} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";

export default function AnagraphicPage() {
    const {data: session, isPending} = authClient.useSession();
    const user = session?.user as any;

    const getInitials = () => {
        if (!user) return "BB";
        const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : "";
        const surnameInitial = user.surname ? user.surname.charAt(0).toUpperCase() : "";
        return `${nameInitial}${surnameInitial}` || "BB";
    };

    return (
        <div
            className="w-full max-w-7xl mx-auto p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-zinc-800/20 pb-4 sm:pb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-zinc-900 uppercase">
                        La tua anagrafica
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 sm:mt-1">
                        Gestisci le informazioni personali e l'anagrafica del tuo account.
                    </p>
                </div>
            </div>

            <Card
                className="rounded-xl sm:rounded-2xl border border-zinc-200/90 shadow-lg overflow-hidden bg-white p-0">
                <div className="relative h-28 sm:h-36 md:h-40 w-full bg-zinc-950 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-900/80"/>
                    <div
                        className="absolute -top-16 -right-16 w-48 sm:w-64 h-48 sm:h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none"/>
                    <div
                        className="absolute top-0 right-10 w-24 sm:w-32 h-24 sm:h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"/>
                    <div
                        className="absolute inset-0 opacity-10 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"/>
                    <div
                        className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600"/>
                </div>

                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 relative">
                    <div className="-mt-10 sm:-mt-12 md:-mt-14 mb-4 sm:mb-6 flex items-end justify-between gap-3">
                        <div className="relative shrink-0">
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name || "User Avatar"}
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl object-cover ring-4 ring-white shadow-xl bg-zinc-950"
                                />
                            ) : (
                                <div
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 text-amber-400 ring-4 ring-white shadow-xl flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-black tracking-widest border border-zinc-800">
                                    {getInitials()}
                                </div>
                            )}
                        </div>

                    </div>

                    {isPending ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 animate-pulse">
                            <div className="h-16 sm:h-20 bg-zinc-100 rounded-xl"/>
                            <div className="h-16 sm:h-20 bg-zinc-100 rounded-xl"/>
                            <div className="h-16 sm:h-20 bg-zinc-100 rounded-xl sm:col-span-2"/>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                            <div
                                className="p-3 sm:p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80 transition-all hover:border-red-500/30 hover:shadow-xs">
                                <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
                                    <div
                                        className="p-1.5 sm:p-2 rounded-lg bg-white shadow-2xs text-red-600 border border-zinc-100 shrink-0">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5"/>
                                    </div>
                                    <span
                                        className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        Nome
                                    </span>
                                </div>
                                <p className="text-base sm:text-lg font-bold text-zinc-900 pl-0.5 sm:pl-1 truncate">
                                    {user?.name || "Non specificato"}
                                </p>
                            </div>

                            <div
                                className="p-3 sm:p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80 transition-all hover:border-red-500/30 hover:shadow-xs">
                                <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
                                    <div
                                        className="p-1.5 sm:p-2 rounded-lg bg-white shadow-2xs text-red-600 border border-zinc-100 shrink-0">
                                        <Contact className="w-4 h-4 sm:w-5 sm:h-5"/>
                                    </div>
                                    <span
                                        className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        Cognome
                                    </span>
                                </div>
                                <p className="text-base sm:text-lg font-bold text-zinc-900 pl-0.5 sm:pl-1 truncate">
                                    {user?.surname || "Non specificato"}
                                </p>
                            </div>

                            <div
                                className="p-3 sm:p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80 transition-all hover:border-red-500/30 hover:shadow-xs sm:col-span-2">
                                <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
                                    <div
                                        className="p-1.5 sm:p-2 rounded-lg bg-white shadow-2xs text-red-600 border border-zinc-100 shrink-0">
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5"/>
                                    </div>
                                    <span
                                        className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        Indirizzo Email
                                    </span>
                                </div>
                                <p className="text-base sm:text-lg font-bold text-zinc-900 pl-0.5 sm:pl-1 truncate">
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