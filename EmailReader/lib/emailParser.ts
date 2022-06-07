import fileProcessor from "./fileProcessor";
import {MailParser} from 'mailparser';
import ImapLib from 'imap';
import config from "../config";
import FileLog from "./fileLog";
import fs from 'fs';
import maxorManager from "./maxorManager";
import approRxManager from "./approRxManager";

const {misc: {
        skipMimes,
        electedProviders
    }} = config;

function checkIncludesProvider(stringToCheck): string {
    for(const provider of electedProviders) {
        if(stringToCheck.includes(provider)) {
            return provider;
        }
    }
    return null;
}

class EmailParser {

    jumper(stream, provider) {
        console.log(provider);
        switch(provider) {

        }
    }

    emailProcessor(msg, seqno) { 
        // console.log(`Processing email ${seqno}...`);
        const prefix = `(#${seqno})`;
        msg.on('body', async (stream, info) => await this.messageProcessor(stream, info));
        msg.once('end', () => { 
            // console.log(`Finished processing email ${prefix}`);
        });
    }

    async messageProcessor(stream, info) {
        const FileProcessor = new fileProcessor();
        const parser = new MailParser({streamAttachments: true});
        // await maxorManager(stream);
        await approRxManager(stream);
        stream.pipe(parser);
        parser.on('attachment', async (att, mail) => {
            try {
                if (!skipMimes.includes(att.contentType.split('/')[0])) {
                    // await FileProcessor.writeAttachment(att);
                    // await FileLog(att.fileName, mail.from[0].name, mail.from[0].address);
                }
            } catch (e) {
                console.log(`An error occured while writing attachment (${
                    att.fileName
                }). Code: ${e}`);
            }
        });
    }

    Parse(Emails, Imap) {
        Emails.on('message', (msg, seqno) => this.emailProcessor(msg, seqno));
        Emails.on('end', () => {
            Imap.end();
        });
        Emails.once('error', (err) => {
            console.log(err);
        })
    }
}

export default EmailParser;
