import FileProcessor from "./fileProcessor";
import {MailParser} from 'mailparser';
import FileLog from "./fileLog";
import ImapLib from 'imap';
import config from "../config";

const {misc: {
        skipMimes
    }} = config
let fileLog: Array < {
    filename: string,
    origin: string
} > = [];

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
    let from;
    stream.on('data', (chunk) => {
        parser.write(chunk);
        const header = ImapLib.parseHeader(chunk.toString('utf8'));
        if (header.from) {
            from = header.from[0];
        }
        parser.on('data', (data) => {
            if (data.type === 'attachment' && !skipMimes.includes(data.contentType.split('/')[0])) {
                // console.log(`Writing '${data.filename}'...`);
                FileProcessor.writeAttachment(data);
                fileLog.push({filename: data.filename, origin: from});
            }
        });
    });
}

export default(Emails, Imap) => {
    Emails.on('message', emailProcessor);
    Emails.on('end', async () => {
        Imap.end();
        const filteredFileLog = [...new Map(fileLog.map(item => [item['filename'], item])).values()];
        for await(const item of filteredFileLog) {
            await FileLog(item.filename, item.origin);
        }
});
Emails.once('error', (err) => {
    console.log(err);
})}
