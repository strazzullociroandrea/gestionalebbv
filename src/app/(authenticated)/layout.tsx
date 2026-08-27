import {getServerSession} from "@/lib/auth";
import {redirect} from "next/navigation";
import {SidebarProvider} from "@/components/ui/sidebar";



export default async function AuthenticatedLayout({
                                                      children,
                                                  }: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession();

    if (!session) {
        redirect("/authenticate");
    }


    return (
        <>
            <SidebarProvider>
                {children}
            </SidebarProvider>
        </>
    );
}
