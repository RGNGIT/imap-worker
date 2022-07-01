import config from "../config";
import s3 from '../s3';
import fs from 'fs';
import pdfParser from 'pdf-parser';
import {seq} from '../db';

const { misc: {
    tempFolder
} } = config;

class MaxorSummaryParser {
    
    fileQueue: Array<{
        name: string,
        dirName: string,
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
            if (i.Key.includes("PBM/Maxor") && !i.Key.includes("Detail")) {
                this.fileQueue.push({
                    name: i.Key.split('/')[3],
                    dirName: i.Key.split('/')[2],
                    data: await this.streamToBuffer(await this.s3.getFile(i.Key))
                });
            }
        }
    }

    async parseAll() {
        await this.readFiles();
        
    }
}

export default MaxorSummaryParser;