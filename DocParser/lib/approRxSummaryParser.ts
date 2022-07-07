import config from "../config";
import s3 from '../s3';
import fs from 'fs';
import pdfParser from 'pdf-parser';
import {seq} from '../db';
import groupNumber from "./groupNumber";

const {misc: {
        tempFolder
    }} = config;

const findValueByField = (textArray, fieldName, offset) =>  {
    const defaultOffset = 1;
    for(let i = 0; i < textArray.length; i++) {
        if(textArray[i].text == fieldName) {
            return textArray[i + defaultOffset + offset].text;
        }
    }
    return null;
}

class ApproRxSummaryParser {

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
            if (i.Key.includes("PBM/ApproRx") && ! i.Key.includes("Detail")) {
                this.fileQueue.push({
                    name: i.Key.split('/')[3],
                    data: await this.streamToBuffer(await this.s3.getFile(i.Key))
                });
            }
        }
    
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
    const texts = pdf.pages[0].texts;
    /*
    for(let i = 0; i < pdf.pages[0].texts.length; i++) {
        console.log(pdf.pages[0].texts[i].text + '// ' + i);
    }
    */
    await seq.query(`INSERT INTO pbm.summary 
        (file_name, pbm_name, group_number, group_name, invc_number, invc_period_begin_date, invc_period_end_date, rx_plan, rx_division, prescription_cost, fee_desc_1, fee_amt_1, fee_desc_2, fee_amt_2, fee_desc_3, fee_amt_3, fee_desc_4, fee_amt_4, fee_desc_5, fee_amt_5, total_invoice_amt) 
        VALUES (
            '${file.name}', 
            'ApproRx', 
            '${await groupNumber(findValueByField(texts, 'Bill To:', 0))}', 
            '${findValueByField(texts, 'Bill To:', 0)}', 
            '${findValueByField(texts, 'Invoice Number', 0)}', 
            '${findValueByField(texts, 'Period', 0).split('-')[0]}', 
            '${findValueByField(texts, 'Period', 0).split('-')[1]}', 
            null, 
            null, 
            ${findValueByField(texts, 'Total Drug Cost for Period', -4).replace(/,/g, '').replace('$', '')}, 
            'Total Claim Fees', 
            ${findValueByField(texts, 'Total Claim Fees', 18).replace(/,/g, '').replace('$', '')}, 
            'Total PA Fee', 
            ${findValueByField(texts, 'Total PA Fee', 18).replace(/,/g, '').replace('$', '')}, 
            'COVID 19',
            null,  
            'DMR Fee', 
            '${findValueByField(texts, 'DMR Fee-$5.00', 16).replace(/,/g, '').replace('$', '')}', 
            null, 
            null, 
            ${findValueByField(texts, 'Plan Total Balance Due', -16).replace(/,/g, '').replace('$', '')});`);
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

export default ApproRxSummaryParser;
