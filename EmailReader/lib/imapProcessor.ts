import emailGetter from "./emailGetter";

const serverCheck = (Imap) => {
    Imap.openBox('INBOX', false, (err, box) => {
        try {
            if (err) {
                throw err;
            }
            console.log("Server is ready! Getting the emails...");
            emailGetter(Imap);
        } catch(e) {
            console.log(`Imap error while opening inbox. Code: ${e}`)
        }
    });
}

export default(Imap) => serverCheck(Imap);
