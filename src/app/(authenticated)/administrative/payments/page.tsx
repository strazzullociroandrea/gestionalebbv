"use client";
import {Button} from "@/components/ui/button";
import {AlertTriangle, Plus} from "lucide-react";
import {useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {type} from "node:os";

export default function PaymentsPage() {

    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const paymentInfo = {
        amount: "",
        reason: "",
        type: "",
        recipientType: "",
        selectedId: "",
        externalEntityName: "",
        dueDate: null,
        paymentDate: null,
        isDraft: false,
        idAthlete: null,
        idSponsor: null,
        idUser: null,
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
    }


    /*createPaymentMutation.mutate({
            amount: parseFloat(amount),
            reason: reason.trim(),
            type,
            recipientType,
            idSeason: activeSeason[0].id,
            dueDate: dueDate || null,
            paymentDate: paymentDate || null,
            isDraft,
            idAthlete: recipientType === "ATLETE" ? selectedId : null,
            idSponsor: recipientType === "SPONSOR" ? selectedId : null,
            idUser: recipientType === "UTENTE" ? selectedId : null,
            externalEntityName: recipientType === "ALTRO" ? externalEntityName : null,
        });*/

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="sm:max-w-lg w-[95%] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold text-zinc-950 tracking-tight">
                            Nuovo Pagamento / Movimento
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500 font-medium">
                            Registra un'entrata o un'uscita finanziaria per la stagione corrente.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div
                            className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs font-semibold">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0"/>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">



                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">Pagamenti</h1>
                    <p className="text-zinc-500 font-medium text-sm sm:text-base">
                        Monitora e gestisci i pagamenti della stagione corrente
                    </p>
                </div>

                <Button
                    className="cursor-pointer w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-5 rounded-xl shadow-sm transition-all text-xs uppercase tracking-wider flex items-center gap-2"
                    onClick={() => setOpen(true)}
                >
                    <Plus className="w-4 h-4"/>
                    Aggiungi Pagamento
                </Button>
            </div>
        </div>
    )


}