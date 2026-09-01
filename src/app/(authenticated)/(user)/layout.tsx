import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarUser } from "@/components/user/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

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
        const targetPath = (role === "admin" || role === "administrative")
            ? "administrative"
            : "";
        redirect("/" + targetPath);
    }

    return (
        <div className="flex min-h-screen w-full flex-col md:flex-row bg-white text-black">
            <header className="sticky top-0 z-40 flex h-14 w-full items-center gap-4 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur md:hidden">
                <SidebarTrigger className="h-9 w-9 rounded-xl border border-zinc-200 hover:bg-zinc-100 hover:text-black" />
                <span className="text-sm font-black uppercase tracking-wider text-black truncate">
                    BBV <span className="text-red-600">Gestionale</span>
                </span>
            </header>

            <div className="flex flex-1 w-full">
                <SidebarUser role="Utente" />

                <main className="w-full grow p-4 md:p-6 overflow-y-auto bg-white text-black">
                    <Suspense
                        fallback={
                            <div className="w-full h-full flex flex-col items-center justify-center min-h-[50vh]">
                                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                            </div>
                        }
                    >
                        {children}
                    </Suspense>
                </main>
            </div>
        </div>
    );
}