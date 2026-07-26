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
    LayoutDashboard,
    User,
    LogOut,
    ShieldCheck,
    Calendar,
    Users,
    UserCheck,
    CreditCard,
    Award
} from "lucide-react";
import Link from "next/link";
import {authClient} from "@/lib/auth-client";
import {useRouter, usePathname} from "next/navigation";
import {cn} from "@/lib/utils";

export const SidebarAdministrative = ({role}: { role: string }) => {
    const {data: session, isPending} = authClient.useSession();
    const router = useRouter();
    const pathname = usePathname();

    if (!session || isPending) {
        return null;
    }

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/authenticate");
    };

    return (
        <Sidebar className="border-r border-sidebar-border/70 bg-sidebar">
            <SidebarHeader className="gap-3 border-b border-sidebar-border/60 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div
                        className="flex size-11 items-center justify-center rounded-2xl bg-red-500 text-primary-foreground shadow-sm shadow-primary/20">
                        <ShieldCheck className="size-5"/>
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-bold tracking-tight">
                            Gestionale BBV
                        </h1>
                        <p className="text-xs text-sidebar-foreground/65">
                            Area segreteria
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3">
                <SidebarGroup className="px-3">
                    <SidebarGroupLabel
                        className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/50">
                        Menù
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-1 space-y-1">

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className="rounded-2xl p-0 text-sm font-medium">
                                <Link
                                    href="/administrative"
                                    className={cn(
                                        "flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all w-full",
                                        pathname === "/administrative" || pathname.startsWith("/administrative/team")
                                            ? "bg-red-300 text-black shadow-md shadow-primary/15"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <LayoutDashboard className="size-4"/>
                                    <span>Squadre</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className="rounded-2xl p-0 text-sm font-medium">
                                <Link
                                    href="/administrative/season"
                                    className={cn(
                                        "flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all w-full",
                                        pathname === "/administrative/season"
                                            ? "bg-red-300 text-black shadow-md shadow-primary/15"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <Calendar className="size-4"/>
                                    <span>Stagioni</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className="rounded-2xl p-0 text-sm font-medium">
                                <Link
                                    href="/administrative/users"
                                    className={cn(
                                        "flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all w-full",
                                        pathname === "/administrative/users"
                                            ? "bg-red-300 text-black shadow-md shadow-primary/15"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <Users className="size-4"/>
                                    <span>Utenti</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className="rounded-2xl p-0 text-sm font-medium">
                                <Link
                                    href="/administrative/athletes"
                                    className={cn(
                                        "flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all w-full",
                                        pathname === "/administrative/athletes"
                                            ? "bg-red-300 text-black shadow-md shadow-primary/15"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <UserCheck className="size-4"/>
                                    <span>Atleti</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className="rounded-2xl p-0 text-sm font-medium">
                                <Link
                                    href="/administrative/payments"
                                    className={cn(
                                        "flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all w-full",
                                        pathname === "/administrative/payments"
                                            ? "bg-red-300 text-black shadow-md shadow-primary/15"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <CreditCard className="size-4"/>
                                    <span>Pagamenti</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className="rounded-2xl p-0 text-sm font-medium">
                                <Link
                                    href="/administrative/sponsors"
                                    className={cn(
                                        "flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all w-full",
                                        pathname === "/administrative/sponsors"
                                            ? "bg-red-300 text-black shadow-md shadow-primary/15"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <Award className="size-4"/>
                                    <span>Sponsor</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-3 border-t border-sidebar-border/60 p-3">
                <div
                    className="flex items-center justify-between gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/40 px-4 py-3 shadow-sm">
                    <span className="flex min-w-0 items-center gap-3">
                        <span
                            className="flex size-9 items-center justify-center rounded-full bg-muted-foreground/10 text-primary">
                            <User className="h-4 w-4"/>
                        </span>
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold text-sidebar-foreground">
                                {session?.user.name || session?.user.email}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/50">
                                {role}
                            </span>
                        </span>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer rounded-full p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus:outline-none"
                        aria-label="Logout"
                        type="button"
                    >
                        <LogOut className="h-5 w-5"/>
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};