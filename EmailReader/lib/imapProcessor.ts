import emailGetter from "./emailGetter";

const serverCheck = (Imap) => {
    Imap.openBox('INBOX', false, (err, box) => {
        if (err) throw err;
        console.log("Server is ready! Getting the emails...");
        emailGetter(Imap);
    });
}

export default(Imap) => serverCheck(Imap);
