"use client";

import {useState} from "react";
import {useParams} from "next/navigation";
import {authClient} from "@/lib/auth-client";
import {User, ClipboardList, Users, Loader2} from "lucide-react";
import {AthleteInfo} from "@/components/user/athlete-info";
import {SubscriptionTeam} from "@/components/user/subscription";
import {SubscribedTeam} from "@/components/user/subscribed";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export default function AthletePage() {
    const params = useParams();

    const idAthlete = (
        params?.id ||
        params?.idAthlete ||
        params?.athletes ||
        (Object.values(params || {})[0] as string) ||
        ""
    ) as string;

    const {data: session, isPending: isSessionLoading} = authClient.useSession();

    const userId = session?.user?.id as string;
    const userEmail = session?.user?.email;

    const tabs = [
        {id: "anagrafica", label: "Anagrafica", icon: User},
        {id: "iscrizione", label: "Iscrizione", icon: ClipboardList},
        {id: "squadre", label: "Squadre", icon: Users},
    ] as const;

    if (isSessionLoading) {
        return (
            <div
                className="w-full max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-black">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin"/>
                <p className="text-zinc-500 font-extrabold uppercase tracking-widest text-xs">
                    Caricamento in corso...
                </p>
            </div>
        );
    }


    return (
        <div
            className="w-full max-w-6xl mx-auto px-3 py-4 sm:p-6 lg:p-10 pb-32 sm:pb-40 space-y-6 sm:space-y-8 text-black min-h-screen animate-in fade-in duration-500 relative">
            <Tabs defaultValue="anagrafica" className="w-full space-y-6 sm:space-y-8">
                <TabsList variant="line"
                          className="hidden sm:flex w-full justify-start items-center gap-6 border-b border-zinc-200">
                    {
                        tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="cursor-pointer flex items-center gap-2 data-[state=active]:text-red-600 data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-red-600"
                                >
                                    <Icon className="h-4 w-4"/>
                                    {tab.label}
                                </TabsTrigger>
                            );
                        })
                    }
                </TabsList>
                <TabsContent value="anagrafica" className="w-full mt-0 focus-visible:outline-none">
                    <AthleteInfo
                        idUser={userId}
                        idAthlete={idAthlete}
                        emailUser={userEmail}
                    />
                </TabsContent>

                <TabsContent value="iscrizione" className="w-full mt-0 focus-visible:outline-none">
                    <SubscriptionTeam
                        idUser={userId}
                        idAthlete={idAthlete}
                    />
                </TabsContent>

                <TabsContent value="squadre" className="w-full mt-0 focus-visible:outline-none">
                    <SubscribedTeam
                        idAthlete={idAthlete}
                        idUser={userId}
                    />
                </TabsContent>

                <div
                    className="sm:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center items-center pointer-events-none px-4">
                    <div
                        className="pointer-events-auto flex items-center p-2 bg-white/95 backdrop-blur-2xl border border-zinc-200/90 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.18)] ring-1 ring-zinc-900/5">
                        <TabsList className="flex items-center gap-1.5 bg-transparent h-auto p-0 border-0">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-2.5 px-4 sm:px-6 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-600/30 text-zinc-500 hover:text-black bg-transparent border-0 hover:bg-zinc-100"
                                    >
                                        <Icon
                                            className="h-4 w-4 shrink-0 transition-transform duration-300 data-[state=active]:scale-110"/>
                                        <span className="leading-none">{tab.label}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}