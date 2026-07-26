import type {Metadata} from "next";
import "./globals.css";
import {TRPCReactProvider} from "@/trpc/react";

export const metadata: Metadata = {
    title: "Black Bulls Volley | Gestionale",
    description: "Gestionale per i Black Bulls Volley",
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
            {children}
        </TRPCReactProvider>
        </body>
        </html>
    );
}
