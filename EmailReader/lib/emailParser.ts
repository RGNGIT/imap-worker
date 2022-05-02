import FileProcessor from "./fileProcessor";
const ImapLib = require('imap');
import {MailParser} from 'mailparser';

const subjs = ['Sample'];

export default(Emails, Imap) => {
    Emails.on('message', (msg, seqno) => {
        console.log(`Processing email ${seqno}...`);
        const prefix = `(#${seqno})`;
        const parser = new MailParser({streamAttachments: true});
        msg.on('body', (stream, info) => {
            stream.pipe(parser);
        });
        parser.on('data', function (data) {
            if(data.type === 'attachment') {
                FileProcessor.writeAttachment(data);
            }
        });
        msg.once('end', () => {
            console.log(`Finished processing email ${prefix}`);
        });
        Emails.on('end', () => {
            Imap.end();
        });
        Emails.once('error', (err) => {
            console.log(err);
        })
    });
}
