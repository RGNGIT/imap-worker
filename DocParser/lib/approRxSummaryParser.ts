import config from "../config";
import s3 from '../s3';
import fs from 'fs';
import pdfParser from 'pdf-parser';
import {seq} from '../db';

const { misc: {
    tempFolder
} } = config;

class ApproRxSummaryParser {

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

    // Invc number 2
    // Period 7
    // 

    async processFile(file: string) {
        async function waitForPDF() {
            return new Promise(async (resolve, reject) => {
                pdfParser.pdf2json(`${tempFolder}/${file}`, async (err, pdf) => {
                    resolve(pdf);
                });
            });
        }
        const pdf = await waitForPDF() as {pages: {texts: Array<string>}};
        await seq.query(`INSERT INTO pbm.summary 
        (file_name, pbm_name, group_number, group_name, invc_number, invc_period_begin_date, invc_period_end_date, rx_plan, rx_division, prescription_cost, fee_desc_1, fee_amt_1, fee_desc_2, fee_amt_2, fee_desc_3, fee_amt_3, fee_desc_4, fee_amt_4, fee_desc_5, fee_amt_5, total_invoice_amt) 
        VALUES ('${file}', 'ApproRx', null, null, '${pdf.pages[0].texts[2].text}', '${pdf.pages[0].texts[7].text.split('-')[0]}', '${pdf.pages[0].texts[7].text.split('-')[1]}', null, null, null, null, null, null, null, null, null, null, null, null, null, '${pdf.pages[0].text.texts[41]}');`);
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

export default ApproRxSummaryParser;