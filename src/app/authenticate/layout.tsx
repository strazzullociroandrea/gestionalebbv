import {getServerSession} from "@/lib/auth";
import {Suspense} from 'react';
import {redirect} from "next/navigation";

export const runtime = "edge";

export default async function AuthenticateLayout({
                                                     children,
                                                 }: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getServerSession();

    if (session) {
        redirect("/");
    }


    return (
        <>
            <Suspense fallback={<div></div>}>
                {children}
            </Suspense>
        </>
    );
}
