import xlsxReader from 'read-excel-file/node';
import fs from 'fs';
import config from '../config';
import s3 from '../s3';

const {
    misc: {
        tempFolder
    }
}= config;

class ApproRxDetailsParser {

    fileQueue: Array<Buffer> = [];
    s3 = new s3();

    async readFiles() {
        const list = await this.s3.listObjects();
        for(const i of list) {
            if(i.Key.includes("PBM/ApproRx") && i.Key.includes("Detail")) {
                
            }
        }
    }

    async processFile(file: string) {
        const rows = await xlsxReader(`${tempFolder}/${file}`);
        for (let i = 1; i < rows.length; i++) {
            console.log(rows[i]);
        }
    }

    async parseAll() {
        // await this.processFile('sample.xlsx');
        await this.readFiles();
    }
}

export default ApproRxDetailsParser;