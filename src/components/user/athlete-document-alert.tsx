import {api} from "@/lib/api";
import {Card} from "@/components/ui/card";
import {ShieldAlert} from "lucide-react";
import Link from "next/link";

export function AthleteDocumentAlert({athlete}: {
    athlete: {
        id: string,
        name: string,
        surname: string
    }
}) {
    const {data: docStatus} = api.user.areValidDocuments.useQuery({idAthlete: athlete.id});

    if (!docStatus || docStatus.isValid || docStatus.messages.length === 0) {
        return null;
    }

    return (
        <Card className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
            <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5"/>
                </div>
                <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wider">
                            Verifica i documenti dell'atleta {athlete.name} {athlete.surname}
                        </h3>
                        <Link href={`/athletes/${athlete.id}`}
                              className="text-xs font-bold text-amber-800 hover:text-amber-950 underline underline-offset-4">
                            Aggiorna ora
                        </Link>
                    </div>
                    <ul className="list-disc list-inside text-xs text-amber-800 font-medium space-y-1">
                        {docStatus.messages.map((msg: string, idx: number) => (
                            <li key={idx}>{msg}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Card>
    );
}