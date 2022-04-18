import FileProcessor from "./fileProcessor";

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

export default(Emails, Imap) => {
    Emails.on('message', (msg, seqno) => {
        console.log(`Processing msg ${seqno}`);
        const prefix = `(#${seqno}) `;
        let date,
            from;
        /*
        msg.on('body', (stream, info) => {
            let buffer = '';
            stream.on('data', (chunk) => {
                buffer += chunk.toString('utf-8');
            });
            stream.once('end', () => {
                /*
                const parsedHeader = Imap.parseHeader(buffer);
                console.log(prefix + 'Parsed header: %s', parsedHeader);
                from = parsedHeader.from[0];
                date = parsedHeader.date[0];
                console.log(`Email from ${from} with date ${date}`);
            });
        });
        */
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