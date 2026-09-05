"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    useSidebar
} from "@/components/ui/sidebar";
import {
    User,
    LogOut,
    ShieldCheck,
    Users,
    ChevronRight,
    Plus,
    Trophy,
    Home,
} from "lucide-react";
import Link from "next/link";
import {authClient} from "@/lib/auth-client";
import {useRouter, usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {useState} from "react";
import {api} from "@/lib/api";

interface UserSession {
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    id: string;
    image?: string | null;
    name: string;
    updatedAt: Date;
    surname?: string | null;
}

interface Athlete {
    id: string;
    name: string | null;
    surname: string | null;
}

export const SidebarUser = ({role}: { role: string }) => {
    const {data: session, isPending} = authClient.useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(pathname.startsWith("/athletes"));

    const {isMobile, setOpenMobile} = useSidebar();

    const {data: athletes = []} = api.user.getAllAthletes.useQuery(
        {idUser: session?.user?.id ?? ""},
        {enabled: !!session?.user?.id}
    );

    if (!session || isPending) return null;

    const user = session.user as UserSession;

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/authenticate");
    };

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const isAthletesActive = pathname.startsWith("/athletes");

    return (
        <Sidebar className="bg-white border-r border-zinc-200 shadow-sm text-black" collapsible="icon">
            <SidebarHeader className="border-b border-zinc-100 p-4 bg-white">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-md border border-zinc-200">
                        <Trophy className="size-5 text-red-600"/>
                    </div>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <h1 className="text-sm font-black uppercase tracking-wider text-black truncate">
                            Bulls<span className="text-red-600">Desk</span>
                        </h1>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">Area
                            Utente</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="p-3 bg-white">
                <SidebarGroup className="p-0 mb-4">
                    <SidebarGroupLabel
                        className="px-2 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-data-[collapsible=icon]:hidden">
                        Home
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/" ? "bg-red-50 text-red-700 shadow-2xs border border-red-100" : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                            )}>
                                <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 w-full">
                                    <Home className="size-4 text-red-600 shrink-0"/>
                                    <span className="truncate group-data-[collapsible=icon]:hidden">Home</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup className="p-0">
                    <SidebarGroupLabel
                        className="px-2 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-data-[collapsible=icon]:hidden">
                        Anagrafiche
                    </SidebarGroupLabel>
                    <SidebarMenu className="space-y-1">
                        <SidebarMenuItem>
                            <Collapsible open={open} onOpenChange={setOpen}>
                                <CollapsibleTrigger>
                                    <SidebarMenuButton
                                        size="lg"
                                        className={cn(
                                            "w-full rounded-xl px-3 transition-all font-bold flex items-center justify-between cursor-pointer",
                                            isAthletesActive
                                                ? "bg-red-50 text-red-700 shadow-2xs border border-red-100"
                                                : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Users className="size-4 text-red-600 shrink-0"/>
                                            <span className="truncate group-data-[collapsible=icon]:hidden">Gestione Atleti</span>
                                        </div>
                                        <ChevronRight
                                            className={cn("size-4 transition-transform text-zinc-400 shrink-0 group-data-[collapsible=icon]:hidden", open && "rotate-90")}/>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                                    <SidebarMenuSub className="ml-4 border-l border-zinc-200 pl-3 space-y-1 mt-1">
                                        {athletes.map((athlete: Athlete) => {
                                            const isAthleteActive = pathname === `/athletes/${athlete.id}`;
                                            return (
                                                <SidebarMenuSubItem key={athlete.id}>
                                                    <Link href={`/athletes/${athlete.id}`} onClick={handleLinkClick}
                                                          className={cn(
                                                              "block w-full px-3 py-2 text-xs font-semibold rounded-lg transition-colors truncate",
                                                              isAthleteActive ? "bg-red-50 text-red-700 font-bold" : "text-zinc-600 hover:text-black hover:bg-zinc-50"
                                                          )}>
                                                        {athlete.name} {athlete.surname}
                                                    </Link>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                        <SidebarMenuSubItem>
                                            <Link href="/athletes/add" onClick={handleLinkClick} className={cn(
                                                "flex items-center gap-2 px-3 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-colors truncate",
                                                pathname === "/athletes/add" ? "bg-red-50 text-red-700" : "text-red-600 hover:bg-red-50"
                                            )}>
                                                <Plus className="size-3 shrink-0"/> <span className="truncate">Aggiungi Atleta</span>
                                            </Link>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/anagraphic" ? "bg-red-50 text-red-700 shadow-2xs border border-red-100" : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                            )}>
                                <Link href="/anagraphic" onClick={handleLinkClick}
                                      className="flex items-center gap-3 w-full">
                                    <User className="size-4 text-red-600 shrink-0"/>
                                    <span
                                        className="truncate group-data-[collapsible=icon]:hidden">Profilo Personale</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3 border-t border-zinc-100 bg-white">
                <div
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 overflow-hidden group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
                    <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-2xs">
                        <ShieldCheck className="size-4 text-red-600"/>
                    </div>
                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-xs font-black text-black">
                            {user.name.toUpperCase()} {user.surname ? user.surname.toUpperCase() : ""}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-red-600 truncate">{role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer p-2 text-zinc-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors shrink-0 group-data-[collapsible=icon]:hidden"
                        title="Logout"
                    >
                        <LogOut className="size-4"/>
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};