import emailParser from "./emailParser";

export default(Imap) => {
    const EmailParser = new emailParser();
    Imap.search(['UNSEEN'], (err, results) => {
        try {
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
                    bodies: ['' /*'HEADER.FIELDS (FROM TO SUBJECT DATE)'*/
                    ],
                    markSeen: true
                });
                EmailParser.Parse(emails, Imap);
            }
        } catch (e) {
            console.log(`Couldn't get emails. Code: ${e}`);
        }
    });
}
