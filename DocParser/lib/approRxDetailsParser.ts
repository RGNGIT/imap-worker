import xlsxReader from 'read-excel-file/node';
import fs from 'fs';
import config from '../config';
import s3 from '../s3';

const {misc: {
        tempFolder
    }} = config;

class ApproRxDetailsParser {

    fileQueue : Array < {
        name: string,
        data: Buffer
    } > = [];

    s3 = new s3();

    async streamToBuffer(stream): Promise < Buffer > {
        return new Promise<Buffer>((resolve, reject) => {
            const _buf: any[] = [];
            stream.on('data', (chunk) => _buf.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(_buf)));
            stream.on('error', (err) => reject(err));
        });
    }

    async readFiles() {
        const list = await this.s3.listObjects();
        for await(const i of list) {
            if (i.Key.includes("PBM/ApproRx") && i.Key.includes("Detail")) {
                this.fileQueue.push({
                    name: i.Key.split('/')[2].split('>')[1],
                    data: await this.streamToBuffer(await this.s3.getFile(i.Key))
                });
            }
        }
}

async processFile(file : string) {
    return new Promise(async (resolve, reject) => {
        const rows = await xlsxReader(`${tempFolder}/${file}`);
        for (let i = 1; i < rows.length; i++) {
            console.log(rows[i]);
        }
        fs.unlink(`${tempFolder}/${file}`, () => {
            resolve(true);
        });
    })
}

async parseAll() {
    try {
        await this.readFiles();
        for await(const file of this.fileQueue) {
            fs.writeFileSync(`${tempFolder}/${
                file.name
            }`, file.data);
        }
    

    for await(const file of this.fileQueue) {
        await this.processFile(file.name);
    }
} catch (e) {

}
}
}

export default ApproRxDetailsParser;
