import fs from 'fs';
import config from '../config';
import unzipper from 'unzipper';

const {
    misc: {
        compressedExts,
        filePath
    }
} = config;

class FileProcessor {
    writeAttachment(data) {
        if(!this.isZip(data.filename)) {
        const writeStream = fs.createWriteStream(`${filePath}/${data.filename}`);
        data.content.pipe(writeStream);
        writeStream.destroy();
        } else {
            data.content.pipe(unzipper.Extract({path: `${filePath}`}));
        }
    }
    isZip(name) {
        const extSplit = name.split('.');
        const extension = extSplit[extSplit.length - 1];
        return compressedExts.includes(extension);
    }
}

export default new FileProcessor();
