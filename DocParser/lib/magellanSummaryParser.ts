import config from "../config";
import s3 from '../s3';
import fs from 'fs';
import pdfParser from 'pdf-parser';
import {seq} from '../db';
import groupNumber from "./groupNumber";

const {misc: {
    tempFolder
}} = config;

const findValueByField = (textArray, fieldName, offset) => {
    const defaultOffset = 1;
    for(let i = 0; i < textArray.length; i++) {
        if(textArray[i].text == fieldName) {
            return textArray[i + defaultOffset + offset].text;
        }
    }
    return null;
}

const extractPBMName = (dirName) => {
    const mailSplit = dirName.split('@');
    const comSplit = mailSplit[1].split('.com');
    return comSplit[0];
}

class MagellanSummaryParser {

    fileQueue : Array < {
        name: string,
        dirName: string,
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

    async processFile(file) {
        const waitForPDF = async () => {
            return new Promise((resolve, reject) => {
                pdfParser.pdf2json(`${tempFolder}/${file.name}`, (err, pdf) => {
                    resolve(pdf);
                });
            });
        }
        const pdf = await waitForPDF() as {
            pages : Array < {
                texts: Array < {
                    text
                } >
            } >
        };
        for await(const page of pdf.pages) {
            const invoice = {
                file_name: file.name,
                pbm_name: extractPBMName(file.dirName),
                group_number: findValueByField(page.texts, 'Bill To:', 2) ? findValueByField(page.texts, 'Bill To:', 2).split('-')[0] : null,
                group_name: findValueByField(page.texts, 'Bill To:', 2) ? findValueByField(page.texts, 'Bill To:', 2).split('-')[1] : null,
                invc_number: null,
                invc_period_begin_date: findValueByField(page.texts, 'Billing Period:', 0) ? findValueByField(page.texts, 'Billing Period:', 0).split('-')[0] : null,
                invc_period_end_date: findValueByField(page.texts, 'Billing Period:', 0) ? findValueByField(page.texts, 'Billing Period:', 0).split('-')[1] : null,
                rx_plan: null,
                rx_division: null,
                prescription_cost: ''
            }
            console.log(findValueByField(page.texts, 'Ingredient Cost', 3));
            /*
            await seq.query(`INSERT INTO INSERT INTO pbm.summary 
            (file_name, pbm_name, group_number, group_name, invc_number, invc_period_begin_date, invc_period_end_date, rx_plan, rx_division, prescription_cost, fee_desc_1, fee_amt_1, fee_desc_2, fee_amt_2, fee_desc_3, fee_amt_3, fee_desc_4, fee_amt_4, fee_desc_5, fee_amt_5, total_invoice_amt) 
            VALUES (
                '', 
                '', 
                '', 
                '');`);
            */
        }
    }

    async readFiles() {
        const list = await this.s3.listObjects();
        for await(const i of list) {
            if (i.Key.includes("PBM/Magellan") && i.Key.includes("_INVOICE_SUMMARY")) {
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
        for await(const file of this.fileQueue) {
            fs.writeFileSync(`${tempFolder}/${
                file.name
            }`, file.data);
        }
        for await(const file of this.fileQueue) {
            await this.processFile(file);
        }
    }

}

export default MagellanSummaryParser;