import config from "../config";
import s3 from '../s3';
import fs from 'fs';
import pdfParser from 'pdf-parser';
import {seq} from '../db';
import groupNumber from "./groupNumber";

const { misc: {
    tempFolder
} } = config;

const findValueByField = (textArray, fieldName, offset) => {
    const defaultOffset = 1;
    for(let i = 0; i < textArray.length; i++) {
        if(textArray[i].text == fieldName || textArray[i].text.includes(fieldName)) {
            return {value: textArray[i + defaultOffset + offset].text, index: i};
        }
    }
    return null;
}

const indexUntil = (textArray, fromName, toName) => {
    let indexFrom = null, indexTo = null;
    console.log(findValueByField(textArray, fromName, 0));
    for(let i = 0; i < textArray.length; i++) {
        if(findValueByField(textArray, fromName, 0).value.includes(fromName)) {
            indexFrom = findValueByField(textArray, fromName, 0).index;
        }
        if(findValueByField(textArray, toName, 0).value.includes(toName)) {
            indexTo = findValueByField(textArray, toName, 0).index;
        }
    }
    if(indexFrom && indexTo) {
        return indexFrom > indexTo ? Math.abs(indexFrom - indexTo) * -1 : Math.abs(indexFrom - indexTo);
    } else {
        return null;
    }
}

const fetchDocType = (filename) => {
    const dashSplit = filename.split('-')[1];
    const underscoreSplit = dashSplit.split('_')[0];
    return underscoreSplit;
}

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

    async processAR01C(file, pages) {
        let i = 0;
        for await(const page of pages) {
            const fromBillToName = indexUntil(page.texts, 'Bill To:', 'Billing Period');
            // console.log(fromBillToName);
            for await(const chunk of page.texts) {
                // console.log(`INSERT INTO pbm.summary (file_name, pbm_name, group_number, group_name, invc_number, invc_period_begin_date, invc_period_end_date, rx_plan, rx_division, prescription_cost, fee_desc_1, fee_amt_1, fee_desc_2, fee_amt_2, fee_desc_3, fee_amt_3, fee_desc_4, fee_amt_4, fee_desc_5, fee_amt_5, total_invoice_amt) 
                // VALUES ('${file.name}', 'Maxor', '');`);
            }
        }
    } 

    async processAR03C(file, pages) {
        let i = 0;
        for await(const page of pages) {
            for await(const chunk of page.texts) {
                console.log(chunk.text + '//' + i++);
                // console.log(`INSERT INTO pbm.summary (file_name, pbm_name, group_number, group_name, invc_number, invc_period_begin_date, invc_period_end_date, rx_plan, rx_division, prescription_cost, fee_desc_1, fee_amt_1, fee_desc_2, fee_amt_2, fee_desc_3, fee_amt_3, fee_desc_4, fee_amt_4, fee_desc_5, fee_amt_5, total_invoice_amt) 
                // VALUES ('${file.name}', 'Maxor', '');`);
            }
        }
    }

    async processFile(file) {
        const waitForPDF = async () => {
            return new Promise((resolve, reject) => {
                pdfParser.pdf2json(`${tempFolder}/${file.dirName}/${file.name}`, (err, pdf) => {
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
        const pages = pdf.pages;
        const docType = fetchDocType(file.name);
        switch(docType) {
            case 'AR01C': this.processAR01C(file, pages); break;
            // case 'AR03C': this.processAR03C(file, pages); break;
            default: console.log(`No processor for this type of document (${file.name}, ${docType})`); break;
        }
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
            await this.processFile(file);
        }
    }
}

export default MaxorSummaryParser;