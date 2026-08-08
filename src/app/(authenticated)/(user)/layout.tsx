import {getServerSession} from "@/lib/auth";
import {redirect} from "next/navigation";
import {SidebarUser} from "@/components/user/sidebar";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {SidebarAdministrative} from "@/components/administrative/sidebar";

export const runtime = "edge";

export default async function Layout({
                                         children,
                                     }: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getServerSession();

    if (!session) {
        redirect("/authenticate");
    }

    const role = session.user.role;

    if (role !== "user") {
        const targetPath = role === "administrative"
            ? "administrative"
            : role === "admin"
                ? "admin"
                : "";
        redirect("/" + targetPath);
    }


    return (
        <div className="flex min-h-screen w-full flex-col md:flex-row">
            <header
                className="sticky top-0 z-40 flex h-14 w-full items-center gap-4 border-b border-sidebar-border/70 bg-background/95 px-4 backdrop-blur md:hidden">
                <SidebarTrigger
                    className="h-9 w-9 rounded-xl border border-sidebar-border/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"/>
                <span className="text-sm font-semibold tracking-tight text-foreground">
                        Gestionale BBV
                    </span>
            </header>

            <div className="flex flex-1 w-full">
                <SidebarUser role="Utente"/>

                <main className="w-full grow p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );

}