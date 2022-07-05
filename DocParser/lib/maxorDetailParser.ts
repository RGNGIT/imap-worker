import config from "../config";
import s3 from '../s3';
import fs from 'fs';
import pdfParser from 'pdf-parser';
import {seq} from '../db';
import XLSX from 'xlsx';

const {misc: {
        tempFolder
    }} = config;

const parseExcel = (filename) => {
    const excelData = XLSX.readFile(filename);
    return Object.keys(excelData.Sheets).map(name => ({
        name,
        data: XLSX.utils.sheet_to_json(excelData.Sheets[name])
    }));
};

const getProviderName = (filename) => {
    const dashSplit = filename.split('_')[1];
    const dotSplit = dashSplit.split('.')[0];
    return dotSplit;
}

class MaxorDetailsParser {

    fileQueue : Array < {
        name: string,
        dirName: string,
        data: Buffer
    } > = [];

    providersProcessed : Array < string > = [];

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
    const sheets = parseExcel(`${tempFolder}/${
        file.dirName
    }/${
        file.name
    }`);
    // Iterate every sheet
    for (const sheet of sheets) { 
        // Pick every record
        for (let i = 1; i < sheet.data.length; i++) {
            await seq.query(`INSERT INTO pbm.summary 
                    (file_name, pbm_name, group_number, group_name, invc_number, invc_period_begin_date, invc_period_end_date, rx_plan, rx_division, prescription_cost, fee_desc_1, fee_amt_1, fee_desc_2, fee_amt_2, fee_desc_3, fee_amt_3, fee_desc_4, fee_amt_4, fee_desc_5, fee_amt_5, total_invoice_amt) 
                    VALUES ('${
                file.name
            }', 'Maxor', '${sheet.data[i]['Group']}', null, '${sheet.data[i]['Invoice No']}', null, null, )`);
            // console.log(sheet.data[i]);
        }
    }
}

async processPdfFile(file) {
    async function waitForPDF() {
        return new Promise(async (resolve, reject) => {
            pdfParser.pdf2json(`${tempFolder}/${
                file.dirName
            }/${
                file.name
            }`, async (err, pdf) => {
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
        if (!fs.existsSync(`${tempFolder}/${
            file.dirName
        }`)) {
            fs.mkdirSync(`${tempFolder}/${
                file.dirName
            }`);
        }
        fs.writeFileSync(`${tempFolder}/${
            file.dirName
        }/${
            file.name
        }`, file.data);
    }


for await(const file of this.fileQueue) {
    switch (file.name.split('.')[1]) {
        case 'pdf':
            {
                if (!this.providersProcessed.includes(getProviderName(file.name))) {
                    await this.processPdfFile(file);
                    this.providersProcessed.push(getProviderName(file.name));
                }
                break;
            }
        case 'xls':
            {
                if (!this.providersProcessed.includes(getProviderName(file.name))) {
                    await this.processXlsFile(file);
                    this.providersProcessed.push(getProviderName(file.name));
                }
                break;
            }
    }
}
}
}

export default MaxorDetailsParser;
