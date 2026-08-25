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
} from "@/components/ui/sidebar";
import {
    User,
    LogOut,
    ShieldCheck,
    Calendar,
    Users,
    UserCheck,
    CreditCard,
    Award,
    LayoutDashboard,
    Trophy, UserPlus, UsersRound
} from "lucide-react";
import Link from "next/link";
import {authClient} from "@/lib/auth-client";
import {useRouter, usePathname} from "next/navigation";
import {cn} from "@/lib/utils";

export const SidebarAdministrative = ({role}: { role: string }) => {
    const {data: session, isPending} = authClient.useSession();
    const router = useRouter();
    const pathname = usePathname();

    if (!session || isPending) return null;

    const user = session?.user as any;

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/authenticate");
    };

    return (
        <Sidebar className="bg-white border-r border-zinc-200 shadow-sm" collapsible="icon">
            <SidebarHeader className="border-b border-zinc-100 p-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-md">
                        <Trophy className="size-5 text-red-600"/>
                    </div>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <h1 className="text-sm font-black uppercase tracking-wider text-zinc-950 truncate">
                            BBV <span className="text-red-600">Gestionale</span>
                        </h1>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">Area
                            {" " + role}</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="p-3">
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel
                        className="px-2 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-data-[collapsible=icon]:hidden">
                        Menu
                    </SidebarGroupLabel>
                    <SidebarMenu className="space-y-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/administrative"
                                    ? "bg-zinc-100 text-zinc-950 shadow-2xs"
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                            )}>
                                <Link href="/administrative" className="flex items-center gap-3 w-full">
                                    <LayoutDashboard className="size-4 text-red-600 shrink-0"/>
                                    <span className="truncate group-data-[collapsible=icon]:hidden">Home</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/administrative/team" || pathname.startsWith("/administrative/team")
                                    ? "bg-zinc-100 text-zinc-950 shadow-2xs"
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                            )}>
                                <Link href="/administrative/team" className="flex items-center gap-3 w-full">
                                    <UsersRound className="size-4 text-red-600 shrink-0"/>
                                    <span className="truncate group-data-[collapsible=icon]:hidden">Squadre</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/administrative/athletes" ? "bg-zinc-100 text-zinc-950 shadow-2xs" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                            )}>
                                <Link href="/administrative/athletes" className="flex items-center gap-3 w-full">
                                    <UserCheck className="size-4 text-red-600 shrink-0"/>
                                    <span className="truncate group-data-[collapsible=icon]:hidden">Atleti</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/administrative/payments" ? "bg-zinc-100 text-zinc-950 shadow-2xs" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                            )}>
                                <Link href="/administrative/payments" className="flex items-center gap-3 w-full">
                                    <CreditCard className="size-4 text-red-600 shrink-0"/>
                                    <span className="truncate group-data-[collapsible=icon]:hidden">Pagamenti</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/administrative/season" ? "bg-zinc-100 text-zinc-950 shadow-2xs" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                            )}>
                                <Link href="/administrative/season" className="flex items-center gap-3 w-full">
                                    <Calendar className="size-4 text-red-600 shrink-0"/>
                                    <span className="truncate group-data-[collapsible=icon]:hidden">Stagioni</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/administrative/sponsors" ? "bg-zinc-100 text-zinc-950 shadow-2xs" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                            )}>
                                <Link href="/administrative/sponsors" className="flex items-center gap-3 w-full">
                                    <Award className="size-4 text-red-600 shrink-0"/>
                                    <span className="truncate group-data-[collapsible=icon]:hidden">Sponsor</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/administrative/users" ? "bg-zinc-100 text-zinc-950 shadow-2xs" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                            )}>
                                <Link href="/administrative/users" className="flex items-center gap-3 w-full">
                                    <Users className="size-4 text-red-600 shrink-0"/>
                                    <span className="truncate group-data-[collapsible=icon]:hidden">Utenti</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {user?.role === "admin" && (
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" className={cn(
                                    "w-full rounded-xl transition-all font-bold",
                                    pathname === "/administrative/administrative-users" ? "bg-zinc-100 text-zinc-950 shadow-2xs" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                                )}>
                                    <Link href="/administrative/administrative-users"
                                          className="flex items-center gap-3 w-full">
                                        <UserPlus className="size-4 text-red-600 shrink-0"/>
                                        <span
                                            className="truncate group-data-[collapsible=icon]:hidden">Segreteria</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className={cn(
                                "w-full rounded-xl transition-all font-bold",
                                pathname === "/administrative/anagraphic" ? "bg-zinc-100 text-zinc-950 shadow-2xs" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                            )}>
                                <Link href="/administrative/anagraphic" className="flex items-center gap-3 w-full">
                                    <User className="size-4 text-red-600 shrink-0"/>
                                    <span
                                        className="truncate group-data-[collapsible=icon]:hidden">Profilo personale</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3 border-t border-zinc-100">
                <div
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 overflow-hidden group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
                    <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-2xs">
                        <ShieldCheck className="size-4 text-red-600"/>
                    </div>
                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-xs font-black text-zinc-950">{user.name + " " + user.surname}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-red-600 truncate">{role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer p-2 text-zinc-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors shrink-0 group-data-[collapsible=icon]:hidden"
                        title="Logout"
                    >
                        <LogOut className="size-4"/>
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};