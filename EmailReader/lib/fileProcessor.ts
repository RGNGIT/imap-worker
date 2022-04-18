import fs from 'fs';
let base64 = require('js-base64');

function toUpper(thing) {
    return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
}

class FileProcessor {
    writeAttachment(attachment) {
        let filename = attachment.params.name;
        let encoding = attachment.encoding;
        return(msg, seqno) => {
            msg.on('body', (stream, info) => {
                let base64String = '';
                stream.on('data', (chunk) => {
                    base64String += chunk.toString('utf8');
                });
                stream.on('end', () => {
                    fs.writeFileSync(`./Files/${filename}`, base64.atob(base64String));
                });
            });
            msg.once('end', () => {
                console.log(`'${filename}' saved.`)
            });
        }
    }
    spawnFileParser() {

    }
}

export default new FileProcessor();
