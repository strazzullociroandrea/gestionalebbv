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
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
    User,
    LogOut,
    ShieldCheck,
    Users,
    ChevronRight,
    Plus
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { api } from "@/lib/api";

export const SidebarUser = ({ role }: { role: string }) => {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(pathname.startsWith("/athletes"));

    const { data: athletes = [] } = api.user.getAllAthletes.useQuery(
        { idUser: session?.user?.id ?? "" },
        { enabled: !!session?.user?.id }
    );

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
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-red-500 text-primary-foreground shadow-xs shadow-primary/20">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-bold tracking-tight">
                            Gestionale BBV
                        </h1>
                        <p className="text-xs text-sidebar-foreground/65">
                            Area utente
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3">
                <SidebarGroup className="px-3">
                    <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/50">
                        Menù
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-1 space-y-1">

                        <SidebarMenuItem>
                            <Collapsible
                                open={open}
                                onOpenChange={setOpen}
                                className="group/collapsible w-full"
                            >
                                <CollapsibleTrigger  className="w-full">
                                    <SidebarMenuButton
                                        size="lg"
                                        className="cursor-pointer w-full flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Users className="size-4 shrink-0" />
                                            <span className="truncate">Atleti</span>
                                        </div>
                                        <ChevronRight
                                            className={cn(
                                                "size-4 shrink-0 transition-transform duration-200",
                                                open && "rotate-90"
                                            )}
                                        />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub className="ml-4 border-l border-sidebar-border/60 pl-2 space-y-1 my-1">
                                        {athletes.map((athlete) => (
                                            <SidebarMenuSubItem key={athlete.id}>
                                                <SidebarMenuSubButton  className="rounded-xl p-0 w-full">
                                                    <Link
                                                        href={`/athletes/${athlete.id}`}
                                                        className={cn(
                                                            "w-full px-3 py-2 rounded-xl transition-all block truncate",
                                                            pathname === `/athletes/${athlete.id}`
                                                                ? "bg-red-300 text-black font-medium"
                                                                : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
                                                        )}
                                                    >
                                                        <span>{athlete.name} {athlete.surname}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}

                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton  className="rounded-xl p-0 w-full">
                                                <Link
                                                    href="/athletes/add"
                                                    className={cn(
                                                        "w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                                                        pathname === "/athletes/add"
                                                            ? "bg-red-300 text-black font-medium"
                                                            : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
                                                    )}
                                                >
                                                    <Plus className="size-4 shrink-0" />
                                                    <span>Aggiungi Atleta</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton  size="lg" className="rounded-2xl p-0 text-sm font-medium w-full">
                                <Link
                                    href="/anagraphic"
                                    className={cn(
                                        "flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all w-full",
                                        pathname === "/anagraphic"
                                            ? "bg-red-300 text-black shadow-md shadow-primary/15"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <User className="size-4 shrink-0" />
                                    <span>Anagrafica</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-3 border-t border-sidebar-border/60 p-3">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/40 px-4 py-3 shadow-sm">
                    <span className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-muted-foreground/10 text-primary shrink-0">
                            <User className="h-4 w-4" />
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
                        className="cursor-pointer rounded-full p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus:outline-none shrink-0"
                        aria-label="Logout"
                        type="button"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};