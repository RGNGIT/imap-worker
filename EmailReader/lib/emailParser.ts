import FileProcessor from "./fileProcessor";
import {MailParser} from 'mailparser';
import ImapLib from 'imap';
import config from "../config";
import FileLog from "./fileLog";

const {
    misc: {
        skipMimes
    }
} = config;

class EmailParser {

    files: Array<{data, origin}> = [];

    emailProcessor(msg, seqno) {
        console.log(`Processing email ${seqno}...`);
        const prefix = `(#${seqno})`;
        msg.on('body', (stream, info) => this.messageProcessor(stream, info));
        msg.once('end', () => {
            console.log(`Finished processing email ${prefix}`);
        });
    }
    
    messageProcessor(stream, info) {
        let from;
        const parser = new MailParser({streamAttachments: true});
        stream.on('data', async (chunk) => {
            parser.write(chunk);
            const header = ImapLib.parseHeader(chunk.toString('utf8'));
            if (header.from) {
                from = header.from[0];
            }
            parser.on('data', async (data) => {
                if (data.type === 'attachment' && !skipMimes.includes(data.contentType.split('/')[0])) {
                    this.files.push({data: data, origin: from});
                }
            });
        });
    }
    
    Parse(Emails, Imap) {
        Emails.on('message', (msg, seqno) => this.emailProcessor(msg, seqno));
        Emails.on('end', async () => {
            Imap.end();
            const filteredFiles = [...new Map(this.files.map(item => [item['data'], item])).values()];
            for await (const item of filteredFiles) {
                await FileProcessor.writeAttachment(item.data);
                await FileLog(item.data.filename, item.origin);
            }
    });
    Emails.once('error', (err) => {
        console.log(err);
    })}

}

export default new EmailParser();