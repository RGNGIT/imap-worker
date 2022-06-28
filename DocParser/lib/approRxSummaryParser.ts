import config from "../config";
import s3 from '../s3';
import fs from 'fs';
import pdfParser from 'pdf-parser';

const { misc: {
    tempFolder
} } = config;

class ApproRxDetailsParser {

    fileQueue: Array<{
        name: string,
        data: Buffer
    }> = [];

    s3 = new s3();

    async streamToBuffer(stream): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const _buf: any[] = [];
            stream.on('data', (chunk) => _buf.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(_buf)));
            stream.on('error', (err) => reject(err));
        });
    }

    async readFiles() {
        const list = await this.s3.listObjects();
        for await (const i of list) {
            if (i.Key.includes("PBM/ApproRx") && !i.Key.includes("Detail")) {
                this.fileQueue.push({
                    name: i.Key.split('/')[3],
                    data: await this.streamToBuffer(await this.s3.getFile(i.Key))
                });
            }
        }
    }

    async processFile(file: string) {
        pdfParser.pdf2json(`${tempFolder}/${file}`, (err, pdf) => {
            console.log(pdf.pages[0].texts);
        });
    }

    async parseAll() {
        await this.readFiles();
        for await (const file of this.fileQueue) {
            fs.writeFileSync(`${tempFolder}/${file.name}`, file.data);
        }
        for await (const file of this.fileQueue) {
            await this.processFile(file.name);
        }
    }
}

export default ApproRxDetailsParser;