import type {Metadata} from "next";
import "./globals.css";
import {TRPCReactProvider} from "@/trpc/react";
import { TooltipProvider } from "@/components/ui/tooltip"
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
    title: "Black Bulls Volley | Gestionale",
    description: "Gestionale sportivo Black Bulls Volley",
    authors: [{name: "Ciro A. Strazzullo", url: "https://cirostrazzullo.it"}]
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
        </head>
        <body>
        <TRPCReactProvider>
            <TooltipProvider>
                        {children}
            </TooltipProvider>
        </TRPCReactProvider>
        </body>
        </html>
    );
}
