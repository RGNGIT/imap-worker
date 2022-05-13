import config from '../config';
import unzipper from 'unzipper';
import s3 from '../s3';
import fs from 'fs';

const {s3: {
        s3Folder
    }, misc: {
        compressedExts
    }} = config;

const FileStore = new s3();

class FileProcessor {
    async writeAttachment(data) {
        if (!this.isZip(data.fileName)) {
            await FileStore.putData(`${s3Folder}/Maxor/${
                 data.fileName
            }`, await this.streamToBuffer(data.stream));
        } else {
            data.stream.pipe(unzipper.Parse()).on('entry', async (file) => {
                await FileStore.putData(`${s3Folder}/Maxor/${
                     file.path
                }`, await this.streamToBuffer(file));
            });
        }
    }

    isZip(name) {
        try {
            const extSplit = name.split('.');
            const extension = extSplit[extSplit.length - 1];
            return compressedExts.includes(extension);
        } catch (e) {
            console.log(`Processing file (${name}) has no extenson. Code: ${e}`);
            return true;
        }
    }

    async streamToBuffer(stream): Promise < Buffer > {
        return new Promise<Buffer>((resolve, reject) => {
            const _buf: any[] = [];
            stream.on('data', (chunk) => _buf.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(_buf)));
            stream.on('error', (err) => reject(err));
        });
    }
}

export default FileProcessor;
