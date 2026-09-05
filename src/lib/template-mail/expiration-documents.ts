export const expirationDocuments = (userName: string, athleteName: string, athleteSurname: string) => {
    return `
Ciao ${userName},

Ti informiamo che i documenti dell'atleta ${athleteName} ${athleteSurname} sono in fase di scadenza o sono già scaduti. 

Ti invitiamo a provvedere al rinnovo e a caricare la nuova documentazione al più presto per garantire la regolare partecipazione alle attività sportive.

Per aggiornare i documenti, accedi alla tua area riservata:
https://gestionale.blackbullsvolley.it

A presto,
ASD Club Black Bulls Volley
    `;
};