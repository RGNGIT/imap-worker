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

    async jumper(buffer, provider, email) {
        switch(provider) {
            case 'maxor':
                await maxorManager(buffer, email);
            break;
            case 'approrx':
                await approRxManager(buffer, email);
            break;
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
        let buffer = '';
        stream.on('data', chunk => {
            parser.write(chunk);
            buffer += chunk.toString('utf8');
        });
        parser.on('attachment', async (att, mail) => {
            try {
                if(att.fileName === '') {
                    
                }
                if (!skipMimes.includes(att.contentType.split('/')[0])) {
                    await FileProcessor.writeAttachment(att);
                    await FileLog(att.fileName, mail.from[0].name, mail.from[0].address);
                }
            } catch (e) {
                console.log(`An error occured while writing attachment (${
                    att.fileName
                }). Code: ${e}`);
            }
        });
        stream.once('end', async () => {
            const email = ImapLib.parseHeader(buffer);
            const provider = checkIncludesProvider(email.from[0]);
            if(provider) {
                await this.jumper(buffer, provider, email);
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
