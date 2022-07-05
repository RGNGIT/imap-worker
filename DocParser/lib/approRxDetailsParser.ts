import xlsxReader from 'read-excel-file/node';
import fs from 'fs';
import config from '../config';
import s3 from '../s3';
import {seq} from '../db';
import pdfParser from 'pdf-parser';
import groupNumber from './groupNumber';

const {misc: {
        tempFolder
    }} = config;

const getInvcDate = (filename) => {
    const spaceSplit = filename.split(' ');
    const date1split = spaceSplit[0].split('-');
    const date2split = spaceSplit[2].split('-');
    return {
            from: `${
            date1split[0]
        }-${
            date1split[1]
        }-${
            date1split[2]
        }`,
        to: `${
            date2split[0]
        }-${
            date2split[1]
        }-${
            date2split[2]
        }`
    }
}

class ApproRxDetailsParser {

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

    async readFiles() {
        const list = await this.s3.listObjects();
        for await(const i of list) {
            if (i.Key.includes("PBM/ApproRx")) {
                this.fileQueue.push({
                    name: i.Key.split('/')[3],
                    dirName: i.Key.split('/')[2],
                    data: await this.streamToBuffer(await this.s3.getFile(i.Key))
                });
            }
        }
    


}

async fetchInvcNumberPDF(file) {
    const waitForPDF = async () => {
        return new Promise((resolve, reject) => {
            const dirNames = fs.readdirSync(`${tempFolder}/${
                file.dirName
            }`);
            let pdfName;
            for (const fileName of dirNames) {
                if (fileName.includes('.pdf')) {
                    pdfName = fileName;
                }
            }
            pdfParser.pdf2json(`${tempFolder}/${
                file.dirName
            }/${pdfName}`, (err, pdf) => {
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
    return pdf.pages[0].texts[2].text;
}

async processFile(file) {
    const invcNumber = await this.fetchInvcNumberPDF(file);
    const rows = await xlsxReader(`${tempFolder}/${
        file.dirName
    }/${
        file.name
    }`);
    for (let i = 1; i < rows.length; i++) {
        await seq.query(`INSERT INTO pbm.detail 
          (file_name, pbm_name, group_number, group_name, invc_number, invc_period_begin_date, invc_period_end_date, claim_no, original_claim_no, member_id, person_code, member_first_name, member_last_name, date_of_service, ndc_code, patient_paid, plan_paid, ingredient_code, dispensing_fee, sales_tax, other_fees, total_cost) VALUES 
          ('${
            file.name
        }', 'ApproRx', '${
            await groupNumber(rows[i][0])
        }', '${
            rows[i][0]
        }', '${
            invcNumber
        }', '${
            getInvcDate(file.name).from
        }', '${
            getInvcDate(file.name).to
        }', '${
            rows[i][16]
        }', '${
            rows[i][17]
        }', '${
            rows[i][7]
        }', '${
            rows[i][12]
        }', '${
            rows[i][14].toString().replace(/'/g, `''`)
        }', '${
            rows[i][13].toString().replace(/'/g, `''`)
        }', '${
            rows[i][23]
        }', '${
            rows[i][18]
        }', ${
            rows[i][30]
        }, ${
            rows[i][31]
        }, ${
            rows[i][27]
        }, ${
            rows[i][28]
        }, ${
            rows[i][29]
        }, null, ${
            rows[i][31]
        });`);
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
    if (file.name.includes('.xlsx')) {
        await this.processFile(file);
    }
}
}
}

export default ApproRxDetailsParser;
