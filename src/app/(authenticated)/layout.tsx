import {getServerSession} from "@/lib/auth";
import {redirect} from "next/navigation";

export const runtime = "edge";


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
            {children}
        </>
    );
}
