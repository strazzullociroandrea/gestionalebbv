"use client";

import {useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Trophy, Calendar, Trash2, ShieldAlert, Loader2} from "lucide-react";
import {api} from "@/lib/api";

interface SubscribedTeamProps {
    idAthlete: string;
}

export const SubscribedTeam = ({idAthlete}: SubscribedTeamProps) => {
    const [openTeamId, setOpenTeamId] = useState<string | null>(null);
    const utils = api.useUtils();

    const {data: teams, isLoading} = api.administrative.subscribedTeam.useQuery({idAthlete});

    const unsubscribeMutation = api.administrative.ubsubscribedAthleteTeam.useMutation({
        onSuccess: async () => {
            await utils.administrative.subscribedTeam.invalidate({idAthlete});
            setOpenTeamId(null);
        },
        onError: async () => {
            setOpenTeamId(null);
        },
    });

    const handleUnsubscribe = (teamId: string) => {
        unsubscribeMutation.mutate({idAthlete, idTeam: teamId});
    };

    return (
        <Card
            className="border border-zinc-200 bg-white text-zinc-900 overflow-hidden p-0 shadow-lg rounded-2xl relative w-full">
            <div className="h-2 w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500"/>

            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                    <div
                        className="p-2.5 sm:p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 shadow-sm shrink-0">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-wide uppercase text-zinc-900">
                            Squadre iscritte
                        </h2>
                        <p className="text-xs text-zinc-500 font-medium">
                            Gestione delle squadre
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600"/>
                        <p className="text-sm font-medium">Caricamento squadre...</p>
                    </div>
                ) : !teams || teams.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-zinc-400"/>
                        <p className="text-sm">Nessuna squadra associata a questo atleta.</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-zinc-50">
                                    <TableRow className="border-b border-zinc-200 hover:bg-transparent">
                                        <TableHead
                                            className="text-zinc-600 text-xs uppercase tracking-wider font-semibold py-3.5">
                                            Squadra
                                        </TableHead>
                                        <TableHead
                                            className="text-zinc-600 text-xs uppercase tracking-wider font-semibold py-3.5">
                                            Stagione
                                        </TableHead>
                                        <TableHead
                                            className="text-zinc-600 text-xs uppercase tracking-wider font-semibold py-3.5 text-right pr-6">
                                            Azione
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teams.map((item) => (
                                        <TableRow
                                            key={item.team.id}
                                            className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors"
                                        >
                                            <TableCell className="font-semibold text-zinc-900 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"/>
                                                    {item.team.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-zinc-700 py-4">
                                                <div
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-xs text-zinc-800 font-medium">
                                                    <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0"/>
                                                    {item.season}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-6">
                                                <AlertDialog
                                                    open={openTeamId === item.team.id}
                                                    onOpenChange={(isOpen) =>
                                                        setOpenTeamId(isOpen ? item.team.id : null)
                                                    }
                                                >
                                                    <AlertDialogTrigger>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-all font-medium"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1.5"/>
                                                            Disiscrivi
                                                        </Button>
                                                    </AlertDialogTrigger>

                                                    <AlertDialogContent
                                                        className="bg-white border border-zinc-200 text-zinc-900 sm:max-w-[425px]">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle
                                                                className="flex items-center gap-2 text-red-600 font-bold">
                                                                <ShieldAlert className="w-5 h-5 shrink-0"/>
                                                                Conferma Disiscrizione
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription
                                                                className="text-zinc-600 text-sm mt-2">
                                                                Sei sicuro di volerw disiscrivere dalla squadra{" "}
                                                                <span className="font-semibold text-zinc-900">
                                  {item.team.name}
                                </span>
                                                                ? L'atleta non risulterà più associato a questo gruppo.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="mt-4 gap-2">
                                                            <AlertDialogCancel
                                                                disabled={unsubscribeMutation.isPending}
                                                                className="bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                                                            >
                                                                Annulla
                                                            </AlertDialogCancel>
                                                            <Button
                                                                onClick={() => handleUnsubscribe(item.team.id)}
                                                                disabled={unsubscribeMutation.isPending}
                                                                className="cursor-pointer bg-red-600 text-white hover:bg-red-700 font-semibold"
                                                            >
                                                                {unsubscribeMutation.isPending ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                                                ) : (
                                                                    "Conferma"
                                                                )}
                                                            </Button>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:hidden">
                            {teams.map((item) => (
                                <div
                                    key={item.team.id}
                                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"/>
                                                <span className="font-bold text-zinc-900 text-sm">
                          {item.team.name}
                        </span>
                                            </div>
                                            <div
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-[11px] text-zinc-700 font-medium">
                                                <Calendar className="w-3 h-3 text-red-600 shrink-0"/>
                                                {item.season}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-zinc-200/60 flex justify-end">
                                        <AlertDialog
                                            open={openTeamId === item.team.id}
                                            onOpenChange={(isOpen) =>
                                                setOpenTeamId(isOpen ? item.team.id : null)
                                            }
                                        >
                                            <AlertDialogTrigger>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full cursor-pointer text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-all font-medium text-xs h-8"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-1.5"/>
                                                    Disiscriviti
                                                </Button>
                                            </AlertDialogTrigger>

                                            <AlertDialogContent
                                                className="bg-white border border-zinc-200 text-zinc-900 w-[90vw] max-w-[425px] rounded-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle
                                                        className="flex items-center gap-2 text-red-600 font-bold text-base sm:text-lg">
                                                        <ShieldAlert className="w-5 h-5 shrink-0"/>
                                                        Conferma Disiscrizione
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription
                                                        className="text-zinc-600 text-xs sm:text-sm mt-2">
                                                        Sei sicuro di volerti disiscrivere dalla squadra{" "}
                                                        <span className="font-semibold text-zinc-900">
                              {item.team.name}
                            </span>
                                                        ? L'atleta non risulterà più associato a questo gruppo.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="mt-4 gap-2 flex-col-reverse sm:flex-row">
                                                    <AlertDialogCancel
                                                        disabled={unsubscribeMutation.isPending}
                                                        className="bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 w-full sm:w-auto"
                                                    >
                                                        Annulla
                                                    </AlertDialogCancel>
                                                    <Button
                                                        onClick={() => handleUnsubscribe(item.team.id)}
                                                        disabled={unsubscribeMutation.isPending}
                                                        className="cursor-pointer bg-red-600 text-white hover:bg-red-700 font-semibold w-full sm:w-auto"
                                                    >
                                                        {unsubscribeMutation.isPending ? (
                                                            <Loader2 className="w-4 h-4 animate-spin"/>
                                                        ) : (
                                                            "Conferma"
                                                        )}
                                                    </Button>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};