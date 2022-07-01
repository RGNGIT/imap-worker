import config from "../config";
import s3 from '../s3';
import fs from 'fs';
import pdfParser from 'pdf-parser';
import {seq} from '../db';
import XLSX from 'xlsx';

const { misc: {
    tempFolder
} } = config;

const parseExcel = (filename) => {
    const excelData = XLSX.readFile(filename);
    return Object.keys(excelData.Sheets).map(name => ({
        name,
        data: XLSX.utils.sheet_to_json(excelData.Sheets[name]),
    }));
};

class MaxorDetailsParser {

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
            if (i.Key.includes("PBM/Maxor") && i.Key.includes("Detail")) {
                this.fileQueue.push({
                    name: i.Key.split('/')[3],
                    dirName: i.Key.split('/')[2],
                    data: await this.streamToBuffer(await this.s3.getFile(i.Key))
                });
            }
        }
    }

    async processXlsFile(file) {
        const sheets = parseExcel(`${tempFolder}/${file.dirName}/${file.name}`);
        // Iterate every sheet
        for(const sheet of sheets) {
            // Pick every record
            for(let i = 1; i < sheet.data.length; i++) {
                await seq.query(``);
            }
        }
    }

    async processPdfFile(file) {
        async function waitForPDF() {
            return new Promise(async (resolve, reject) => {
                pdfParser.pdf2json(`${tempFolder}/${file.dirName}/${file.name}`, async (err, pdf) => {
                    resolve(pdf);
                });
            });
        }
        const pdf = await waitForPDF();
        console.log(pdf);
    }

    async parseAll() {
        await this.readFiles();
        for await(const file of this.fileQueue) {
            if(!fs.existsSync(`${tempFolder}/${file.dirName}`)) {
                fs.mkdirSync(`${tempFolder}/${file.dirName}`);
            }
            fs.writeFileSync(`${tempFolder}/${file.dirName}/${file.name}`, file.data);
        }
        for await(const file of this.fileQueue) {
            switch(file.name.split('.')[1]) {
                case 'pdf': await this.processPdfFile(file); break;
                // case 'xls': await this.processXlsFile(file); break;
            }
        }
    }
}

export default MaxorDetailsParser;