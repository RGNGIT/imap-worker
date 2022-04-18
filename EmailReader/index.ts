import ImapInstanse from "./imap";
import ImapProcessor from "./lib/imapProcessor";

const start = () => {
    const imap = ImapInstanse;
    imap.once('ready', () => {
        ImapProcessor(imap);
        console.log("Successfully set up IMAP!");
    });
    imap.once('error', function (err) {
        console.log(`Server Error:- ${err}`);
    });
    imap.once('end', function () {
        console.log('Connection terminated.');
    });
    imap.connect();
} 

start();
