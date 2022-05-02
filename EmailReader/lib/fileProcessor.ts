import fs from 'fs';
let base64 = require('js-base64');

class FileProcessor {
    writeAttachment(data) {
        const writeStream = fs.createWriteStream(`./Files/${data.filename}`);
        data.content.pipe(writeStream);
    }
    spawnFileParser() {

    }
}

export default new FileProcessor();
