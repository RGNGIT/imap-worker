import emailParser from "./emailParser";

export default(Imap) => {
    Imap.search(['UNSEEN'], (err, results) => {
        if (err) {
            throw err;
        } 
        if (!results.length) {
            console.log("No unprocessed emails found. Terminating...");
            Imap.end();
        } else {
            console.log(`Found ${
                results.length
            } unprocessed emails`);
            const emails = Imap.fetch(results, {
                bodies: [''/*'HEADER.FIELDS (FROM TO SUBJECT DATE)'*/],
                markSeen: true
            });
            emailParser.Parse(emails, Imap);
        }
    });
}
