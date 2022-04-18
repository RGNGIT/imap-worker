import FileProcessor from "./fileProcessor";
const ImapLib = require('imap');

function toUpper(thing) {
    return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
}

function findAttachmentParts(struct, attachments) {
    attachments = attachments || [];
    for (var i = 0, len = struct.length; i < len; ++ i) {
        if (Array.isArray(struct[i])) {
            findAttachmentParts(struct[i], attachments);
        } else {
            if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) > -1) {
                attachments.push(struct[i]);
            }
        }
    }
    return attachments;
}

const subjs = ['Sample'];

export default(Emails, Imap) => {
    Emails.on('message', (msg, seqno) => {
        console.log(`Processing email ${seqno}...`);
        const prefix = `(#${seqno})`;
        msg.on('body', (stream, info) => {
            stream.on('data', (chunk) => {
                const emailData = ImapLib.parseHeader(chunk.toString('utf8'));
                if(subjs.includes(emailData.subject[0])) {
                    console.log(`Email ${prefix} accepted (Subj: '${emailData.subject[0]}')`);
                    msg.once('attributes', (attributes) => {
                        let attachments = findAttachmentParts(attributes.struct, []);
                        for (let i = 0, len = attachments.length; i < len; i++) {
                            let atts = Imap.fetch(attributes.uid, {
                                bodies: [attachments[i].partID],
                                struct: true
                            });
                            atts.on('message', FileProcessor.writeAttachment(attachments[i]));
                        }
                    });
                } else {
                    console.log(`Email ${prefix} rejected (Subj: '${emailData.subject[0]}')`);
                }
            });
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
