import xlsxReader from 'read-excel-file/node';
import fs from 'fs';
import config from '../config';
import s3 from '../s3';
import { seq } from '../db';

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
            if (i.Key.includes("PBM/ApproRx") && i.Key.includes("Detail")) {
                this.fileQueue.push({
                    name: i.Key.split('/')[3],
                    data: await this.streamToBuffer(await this.s3.getFile(i.Key))
                });
            }
        }
    }

    async processFile(file: string) {
        const rows = await xlsxReader(`${tempFolder}/${file}`);
        for (let i = 1; i < rows.length; i++) {
            await seq.query(`INSERT INTO pbm.detail 
            (file_name, pbm_name, group_number, group_name, invc_number, invc_period_begin_date, invc_period_end_date, claim_no, original_claim_no, member_id, person_code, member_first_name, member_last_name, date_of_service, ndc_code, patient_paid, plan_paid, ingredient_code, dispensing_fee, sales_tax, other_fees, total_cost) VALUES 
            ('${file.replace(/'/g, `''`)}', 'ApproRx', null, null, null, null, null, '${rows[i][16]}', '${rows[i][17]}', null, '${rows[i][12]}', '${rows[i][14].toString().replace(/'/g, `''`)}', '${rows[i][13].toString().replace(/'/g, `''`)}', '${rows[i][23]}', null, '${rows[i][30]}', ${rows[i][31]}, null, ${rows[i][28]}, null, null, null);`);
        }
    }

    async parseAll() {
        await this.readFiles();
        for await (const file of this.fileQueue) {
            fs.writeFileSync(`${tempFolder}/${file.name}`, file.data);
        }
        for await (const file of this.fileQueue) {
            // await this.processFile(file.name);
        }
    }
}

export default ApproRxDetailsParser;
