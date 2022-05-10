import FileProcessor from "./fileProcessor";
import {MailParser} from 'mailparser';
import FileLog from "./fileLog";
import ImapLib from 'imap';
import config from "../config";

const {misc: {skipMimes}} = config

function emailProcessor(msg, seqno) {
    console.log(`Processing email ${seqno}...`);
    const prefix = `(#${seqno})`;
    msg.on('body', messageProcessor);
    msg.once('end', () => {
        console.log(`Finished processing email ${prefix}`);
    });
}

function messageProcessor(stream, info) {
    const parser = new MailParser({streamAttachments: true});
    stream.on('data', (chunk) => {
        parser.write(chunk);
        const header = ImapLib.parseHeader(chunk.toString('utf8'));
        parser.on('data', async (data) => {
            if(data.type === 'attachment' && !skipMimes.includes(data.contentType.split('/')[0])) {
                console.log(`Writing '${data.filename}'...`);
                FileProcessor.writeAttachment(data);
                await FileLog(data.filename, header.from);
            }
        });
    });
}

export default(Emails, Imap) => {
    Emails.on('message', emailProcessor);
    Emails.on('end', () => {
        Imap.end();
    });
    Emails.once('error', (err) => {
        console.log(err);
    })
}
