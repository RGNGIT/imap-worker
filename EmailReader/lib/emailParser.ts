import fileProcessor from "./fileProcessor";
import {MailParser} from 'mailparser';
import ImapLib from 'imap';
import config from "../config";
import FileLog from "./fileLog";
import fs from 'fs';
import MaxorManager from "./maxorManager";
import ApproRxManager from "./approRxManager";
import MagellanManager from "./magellanManager";

const {misc: {
        skipMimes,
        electedProviders,
        tempLocalDir
    }, statuses: {
        readyForParsing
    }} = config;

const checkIncludesProvider = (stringToCheck): string => {
    for(const provider of electedProviders) {
        if(stringToCheck.includes(provider)) {
            return provider;
        }
    }
    return null;
}

const getFormattedDateFromSecureEmail = (dateString: string) => {
    const splitDate = dateString.split(' ');
    const getMonth = () => {
        switch(splitDate[2]) {
            case 'Jan': return '01';
            case 'Feb': return '02';
            case 'Mar': return '03';
            case 'Apr': return '04';
            case 'May': return '05';
            case 'Jun': return '06';
            case 'Jul': return '07';
            case 'Aug': return '08';
            case 'Sep': return '09';
            case 'Oct': return '10';
            case 'Nov': return '11';
            case 'Dec': return '12';
        }
    }
    const addZero = (n : number) => {
      return (n < 10 ? '0' : '') + n;
    }
    return `${splitDate[3]}${getMonth()}${addZero(Number(splitDate[1]))}`;
}

const getFormattedDateFromEmail = (date: Date) => {
    const addZero = (n : number) => {
        return(n < 10 ? '0' : '') + n;
    }
    const month = addZero(date.getMonth() + 1);
    const day = addZero(date.getDate());
    const year = date.getFullYear();
    return `${year}${month}${day}`;
}

class EmailParser {

    async jumper(buffer, provider, email, dir) {
        switch(provider) {
            case 'maxor':
                await new MaxorManager(dir).process(buffer, email);
            break;
            case 'approrx':
                await new ApproRxManager(dir).process(buffer, email);
            break;
            case 'magellan':
                await new MagellanManager(dir).process(buffer, email);
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
        let dir;
        let maxorHasAttachment;
        stream.on('data', chunk => {
            parser.write(chunk);
            buffer += chunk.toString('utf8');
        });
        parser.on('attachment', async (att, mail) => {
            try {
                if(att.fileName.includes('png') || att.fileName.includes('gif')) {
                    return;
                }
                if(att.fileName === 'SecureMessageAtt.html') {
                    maxorHasAttachment = true;
                    dir = mail.messageId.replace(/@/g, '$');
                    fs.mkdirSync(`${tempLocalDir}/${dir}`);
                    await FileProcessor.writeLocally(att, dir);
                }
                const mimes = att.contentType.split('/');
                if(checkIncludesProvider(mail.from[0].address) == 'magellan') {
                    if(att.fileName.includes('NAA') && att.fileName.includes('.zip')) {
                        await this.jumper(att, 'magellan', mail, getFormattedDateFromEmail(mail.meta.receivedDate));
                    }
                }
                if (!skipMimes.includes(mimes[0]) && !skipMimes.includes(mimes[1])) {
                    await FileProcessor.writeAttachment(att);
                    await FileLog(att.fileName, `${mail.from[0].name} <${mail.from[0].address}>`, readyForParsing);
                }
            } catch (e) {
                console.log(`An error occured while writing attachment (${
                    att.fileName
                }). Code: ${e}`);
            }
        });
        stream.once('end', async () => {
            const email = ImapLib.parseHeader(buffer);
            dir = getFormattedDateFromSecureEmail(email.date[0]) + '$' + email['message-id'][0]
            .replace(/</g, '')
            .replace(/>/g, '')
            .replace(/@/g, '$');
            const provider = checkIncludesProvider(email.from[0]);
            if(provider === 'maxor' && maxorHasAttachment) {
                await this.jumper(buffer, provider, email, dir);
            }
            if(provider === 'approrx') {
                await this.jumper(buffer, provider, email, dir);
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
