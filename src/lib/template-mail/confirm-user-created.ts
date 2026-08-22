export const ConfirmUserCreated = (name: string, surname: string, url: string) => {
    return `
Benvenuto ${name} ${surname},

Siamo felici di averti a bordo nel nostro portale ufficiale. Il tuo account è stato creato con successo.

Da questo momento puoi accedere alla tua area riservata per registrare e gestire i tuoi atleti in autonomia:
${url}

⚠️ Nota importante:
Qualora uno o più atleti risultino già esistenti nel sistema, ti invitiamo a scriverci direttamente a ciro.blackbullsvolley@gmail.com per ricevere supporto e procedere con l'associazione corretta.

A presto,
ASD Club Black Bulls Volley
`
}