"use client";

import { useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User, ClipboardList, Users } from "lucide-react";
import { AthleteInfo } from "@/components/user/athlete-info";
import { SubscriptionTeam } from "@/components/user/subscription";
import { SubscribedTeam } from "@/components/user/subscribed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AthletePage() {
    const params = useParams();

    const idAthlete = (
        params?.id ||
        params?.idAthlete ||
        params?.athletes ||
        (Object.values(params || {})[0] as string) ||
        ""
    ) as string;

    const { data: session } = authClient.useSession();

    const userId = session?.user?.id as string;
    const userEmail = session?.user?.email;

    const tabs = [
        { id: "anagrafica", label: "Anagrafica", icon: User },
        { id: "iscrizione", label: "Iscrizione", icon: ClipboardList },
        { id: "squadre", label: "Squadre", icon: Users },
    ] as const;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10 pb-32 sm:pb-40 space-y-6 sm:space-y-8 text-zinc-900 min-h-screen animate-in fade-in duration-500 relative bg-zinc-50/50">
            <Tabs defaultValue="anagrafica" className="w-full space-y-6 sm:space-y-8">

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

                <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                    <div className="pointer-events-auto flex items-center p-1.5 bg-white/80 backdrop-blur-xl border border-zinc-200/80 rounded-full shadow-xl shadow-zinc-200/50 ring-1 ring-zinc-900/5 transition-all">
                        <TabsList className="flex items-center gap-1.5 bg-transparent h-auto p-0 border-0">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="cursor-pointer flex items-center gap-2 py-2.5 px-4 sm:px-5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-red-600/20 text-zinc-500 hover:text-zinc-900 bg-transparent border-0 hover:bg-zinc-100"
                                    >
                                        <Icon className="h-4 w-4 shrink-0 transition-transform duration-300" />
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