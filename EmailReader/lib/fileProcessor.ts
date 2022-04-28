import fs from 'fs';
let base64 = require('js-base64');

function toUpper(thing) {
    return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
}

class FileProcessor {
    writeAttachment(attachment) {
        let filename = attachment.params.name;
        // const encoding = attachment.encoding;
        if(filename.substring(2, 2 + 5) === 'UTF-8') {
            const nameSplit = filename.split('?');
            filename = base64.decode(nameSplit[3]);
        }
        return(msg, seqno) => {
            msg.on('body', (stream, info) => {
                let base64String = '';
                stream.on('data', (chunk) => {
                    base64String += chunk.toString('ascii');
                });
                stream.on('end', () => {
                    fs.writeFileSync(`./Files/${filename}`, base64.atob(base64String));
                });
            });
            msg.once('end', () => {
                console.log(`'${filename}' saved.`);
            });
        }
    }
    spawnFileParser() {

    }
}

export default new FileProcessor();
