export const createAdministrativeUser = (name: string, email: string, password: string, url: string) => {

    return `

Ciao ${name},

Il tuo account per l'accesso all'area amministrativa e di segreteria di ASD Club Black Bulls Volley è stato creato con successo.
Puoi effettuare il login utilizzando le seguenti credenziali provvisorie:

    Email: ${email}
    Password: ${password}

Per accedere all'area amministrativa, clicca sul seguente link: ${url}
    
 ⚠️ Nota importante:
Le credenziali fornite sono generate automaticamente. Ti invitiamo a modificare la password al primo accesso per garantire la sicurezza del tuo account.

A presto,
ASD Club Black Bulls Volley
    `

}