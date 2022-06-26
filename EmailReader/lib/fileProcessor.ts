import config from '../config';
import unzipper from 'unzipper';
import s3 from '../s3';
import fs from 'fs';
import FileLog from './fileLog';

const {s3: {
        s3Folder
    }, misc: {
        compressedExts,
        tempLocalDir
    }} = config;

const FileStore = new s3();

class FileProcessor {
    async writeAttachment(data) {
        if (!this.isZip(data.fileName)) {
            await FileStore.putData(`${s3Folder}/Other/${
                 data.fileName
            }`, await this.streamToBuffer(data.stream));
        } else {
            data.stream.pipe(unzipper.Parse()).on('entry', async (file) => {
                await FileStore.putData(`${s3Folder}/Other/${
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

    async writeToMaxor(stream, mId, email) {
        return new Promise((resolve, reject) => {
            try {
                stream.pipe(unzipper.Parse()).on('entry', async (file) => {
                    if(!file.path.includes('html')) {
                    await FileStore.putData(`${s3Folder}/Maxor/${mId}${
                         file.path
                    }`, await this.streamToBuffer(file));
                    await FileLog(file.path, email.from[0], 0);
                }
                });
                stream.once('end', () => {
                    resolve(true);
                });
            } catch(e) {
                console.log(`Error while writing file to maxor. Code: ${e}`);
                reject(false);
            }
        });
    }

    async writeToApproRx(stream, mId, email) {
        return new Promise((resolve, reject) => {
            try {
                stream.pipe(unzipper.Parse()).on('entry', async (file) => {
                    if(!file.path.includes('png')) {
                    await FileStore.putData(`${s3Folder}/ApproRx/${mId}${
                         file.path
                    }`, await this.streamToBuffer(file));
                    await FileLog(file.path, email.from[0], 0);
                }
                });
                stream.once('end', () => {
                    resolve(true);
                });
            } catch(e) {
                console.log(`Error while writing file to approrx. Code: ${e}`);
                reject(false);
            }
        })
    }

    async writeLocally(data, dir) {
        return new Promise(async (resolve, reject) => {
            fs.writeFile(`${"./temp"}/${dir}/page.html`, await this.streamToBuffer(data.stream), () => {
                resolve(true);
            });
        });
        // const writeStream = fs.createWriteStream('./s3/page.html');
        // data.stream.pipe(writeStream);
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
