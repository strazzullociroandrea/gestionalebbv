import {getServerSession} from "@/lib/auth";
import {redirect} from "next/navigation";

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


    if (role !== "admin") {
        const target =  role === "administrative" ? "administrative" : "";
        redirect("/" + target);
    }



    return (
        <div className="flex min-h-screen">
            <main className="w-full  grow p-4 md:p-6 ">
                {children}
            </main>
        </div>
    );

}