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
    idUser: string;
}

export const SubscribedTeam = ({idAthlete, idUser}: SubscribedTeamProps) => {
    const [openTeamId, setOpenTeamId] = useState<string | null>(null);
    const utils = api.useUtils();

    const {data: teams, isLoading} = api.user.subscribedTeam.useQuery({idAthlete});

    const unsubscribeMutation = api.user.ubsubscribedAthleteTeam.useMutation({
        onSuccess: async () => {
            await utils.user.subscribedTeam.invalidate();
            setOpenTeamId(null);
        },
        onError: async () => {
            await utils.user.subscribedTeam.invalidate();
            setOpenTeamId(null);
        },
    });

    const handleUnsubscribe = (teamId: string) => {
        unsubscribeMutation.mutate({idAthlete, idUser, idTeam: teamId});
    };

    if (isLoading || unsubscribeMutation.isPending) {
        return (
            <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-8">
                <Card
                    className="border border-zinc-200 bg-white p-12 text-center text-zinc-500 shadow-sm rounded-2xl sm:rounded-3xl w-full">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-red-600"/>
                    <p className="font-extrabold tracking-widest uppercase text-xs">Caricamento squadre...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-black">
            <Card
                className="border border-zinc-200 bg-white shadow-lg shadow-zinc-200/40 rounded-2xl sm:rounded-3xl w-full overflow-hidden relative">
                <div className="h-1.5 bg-red-600 w-full"/>

                <CardContent className="p-5 sm:p-8 lg:p-10 space-y-6">
                    <div className="flex items-start sm:items-center gap-4 pb-6 border-b border-zinc-100">
                        <div className="bg-red-50 p-3 sm:p-4 rounded-2xl border border-red-100 shrink-0 shadow-inner">
                            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-red-600"/>
                        </div>
                        <div>
                            <span
                                className="text-[11px] sm:text-xs font-black text-red-600 uppercase tracking-widest block">
                                Area Squadre
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight mt-0.5">
                                Squadre Iscritte
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
                                Gestione delle squadre associate all&apos;atleta.
                            </p>
                        </div>
                    </div>

                    {!teams || teams.length === 0 ? (
                        <div
                            className="p-12 text-center text-zinc-500 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 space-y-3">
                            <ShieldAlert className="w-10 h-10 mx-auto text-zinc-400"/>
                            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-600">Nessuna
                                squadra associata a questo atleta.</p>
                        </div>
                    ) : (
                        <div className="max-h-[450px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                            <div
                                className="hidden sm:block rounded-2xl border border-zinc-200/80 bg-zinc-50/80">
                                <Table>
                                    <TableHeader className="bg-zinc-100/80 sticky top-0 z-10 backdrop-blur-md">
                                        <TableRow className="border-b border-zinc-200 hover:bg-transparent">
                                            <TableHead
                                                className="text-zinc-600 text-[11px] uppercase tracking-wider font-black py-4 pl-6">
                                                Squadra
                                            </TableHead>
                                            <TableHead
                                                className="text-zinc-600 text-[11px] uppercase tracking-wider font-black py-4">
                                                Stagione
                                            </TableHead>
                                            <TableHead
                                                className="text-zinc-600 text-[11px] uppercase tracking-wider font-black py-4 text-right pr-6">
                                                Azione
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teams.map((item) => (
                                            <TableRow
                                                key={item.team.id}
                                                className="border-b border-zinc-200/60 hover:bg-white transition-colors"
                                            >
                                                <TableCell className="font-extrabold text-black py-4 pl-6 text-sm">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"/>
                                                        {item.team.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-zinc-700 py-4">
                                                    <div
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-800 font-bold shadow-2xs">
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
                                                                className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all font-bold text-xs rounded-xl h-9 px-4"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 mr-1.5"/>
                                                                Disiscriviti
                                                            </Button>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent
                                                            className="bg-white border border-zinc-200 text-zinc-900 sm:max-w-[425px] rounded-3xl p-6 shadow-2xl">
                                                            <AlertDialogHeader className="space-y-3">
                                                                <AlertDialogTitle
                                                                    className="flex items-center gap-2 text-red-600 font-black text-lg uppercase tracking-tight">
                                                                    <ShieldAlert className="w-5 h-5 shrink-0"/>
                                                                    Conferma Disiscrizione
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription
                                                                    className="text-zinc-600 text-xs sm:text-sm font-medium leading-relaxed">
                                                                    Sei sicuro di volerti disiscrivere dalla
                                                                    squadra{" "}
                                                                    <span className="font-bold text-black">
                                                                        {item.team.name}
                                                                    </span>
                                                                    ? L&apos;atleta non risulterà più associato a questo
                                                                    gruppo.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="mt-6 gap-2 sm:gap-3">
                                                                <AlertDialogCancel
                                                                    disabled={unsubscribeMutation.isPending}
                                                                    className="bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:text-black font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider"
                                                                >
                                                                    Annulla
                                                                </AlertDialogCancel>
                                                                <Button
                                                                    onClick={() => handleUnsubscribe(item.team.id)}
                                                                    disabled={unsubscribeMutation.isPending}
                                                                    className="cursor-pointer bg-red-600 text-white hover:bg-red-700 font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider shadow-md"
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
                                        className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 space-y-3.5 shadow-2xs"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"/>
                                                    <span
                                                        className="font-black text-black text-sm uppercase tracking-tight">
                                                        {item.team.name}
                                                    </span>
                                                </div>
                                                <div
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-zinc-200 text-[11px] text-zinc-800 font-bold shadow-2xs">
                                                    <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0"/>
                                                    {item.season}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-zinc-200/80 flex justify-end">
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
                                                        className="w-full cursor-pointer text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-all font-extrabold text-xs h-10 rounded-xl uppercase tracking-wider"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 mr-1.5"/>
                                                        Disiscriviti
                                                    </Button>
                                                </AlertDialogTrigger>

                                                <AlertDialogContent
                                                    className="bg-white border border-zinc-200 text-zinc-900 w-[90vw] max-w-[425px] rounded-3xl p-6 shadow-2xl">
                                                    <AlertDialogHeader className="space-y-3">
                                                        <AlertDialogTitle
                                                            className="flex items-center gap-2 text-red-600 font-black text-base sm:text-lg uppercase tracking-tight">
                                                            <ShieldAlert className="w-5 h-5 shrink-0"/>
                                                            Conferma Disiscrizione
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription
                                                            className="text-zinc-600 text-xs sm:text-sm font-medium leading-relaxed">
                                                            Sei sicuro di volerti disiscrivere dalla squadra{" "}
                                                            <span className="font-bold text-black">
                                                                {item.team.name}
                                                            </span>
                                                            ? L&apos;atleta non risulterà più associato a questo gruppo.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter
                                                        className="mt-6 gap-2 flex-col-reverse sm:flex-row">
                                                        <AlertDialogCancel
                                                            disabled={unsubscribeMutation.isPending}
                                                            className="bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:text-black font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider w-full sm:w-auto"
                                                        >
                                                            Annulla
                                                        </AlertDialogCancel>
                                                        <Button
                                                            onClick={() => handleUnsubscribe(item.team.id)}
                                                            disabled={unsubscribeMutation.isPending}
                                                            className="cursor-pointer bg-red-600 text-white hover:bg-red-700 font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider w-full sm:w-auto shadow-md"
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
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};