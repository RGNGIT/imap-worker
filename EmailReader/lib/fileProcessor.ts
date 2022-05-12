import config from '../config';
import unzipper from 'unzipper';
import s3 from '../s3';

const {
    misc: {
        compressedExts
    }
} = config;

const FileStore = new s3();

class FileProcessor {
    async writeAttachment(data) {
        if(!this.isZip(data.filename)) {
            await FileStore.putData(`PBM_test/Maxor/${data.filename}`, await this.streamToBuffer(data.content));
        } else {
            data.content.pipe(unzipper.Parse()).on('entry', async (file) => {
                await FileStore.putData(`PBM_test/Maxor/${file.path}`, await this.streamToBuffer(file));
            });
        }
    }
    isZip(name) {
        const extSplit = name.split('.');
        const extension = extSplit[extSplit.length - 1];
        return compressedExts.includes(extension);
    }
    async streamToBuffer(stream): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
          const _buf: any[] = [];
          stream.on('data', (chunk) => _buf.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(_buf)));
          stream.on('error', (err) => reject(err));
        });
    }
}

export default FileProcessor();
