export async function sendEmail(
    to: string,
    subject: string,
    type: "text" | "html",
    content: string
) {
    try {
        const payload: Record<string, any> = {
            from: 'Gestionale BBV <noreply@cirostrazzullo.it>',
            to: [to],
            subject: subject,
        };

        if (type === 'html') {
            payload.html = content;
        } else {
            payload.text = content;
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`Errore Resend: ${JSON.stringify(errorData)}`);
        }

        const data = await res.json();
        console.log("Email inviata con successo:", data);
    } catch (error) {
        console.error("Errore durante l'invio:", error);
        throw error;
    }
}