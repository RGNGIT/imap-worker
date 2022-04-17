import fs from 'fs';
let base64 = require('js-base64');

function toUpper(thing) { return thing && thing.toUpperCase ? thing.toUpperCase() : thing;}

class FileProcessor {
    writeAttachment(attachment) {
        let filename = attachment.params.name;
        let encoding = attachment.encoding;
        return (msg, seqno) => {
            msg.on('body', (stream, info) => {
                let writeStream = fs.createWriteStream(`./Files/${filename}`);
                writeStream.on('finish', () => {

                });
                stream.on('data', (chunk) => {
                    writeStream.write(base64.atob(chunk.toString()));
                });
            });
            msg.once('end', () => {

            });
        }
    }
    spawnFileParser() {

    }
}

export default new FileProcessor();