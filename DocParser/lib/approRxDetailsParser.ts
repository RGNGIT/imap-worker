import xlsxReader from 'read-excel-file/node';
import fs from 'fs';

class ApproRxDetailsParser {

    fileQueue: Array<Buffer> = [];

    async readFiles() {
        
    }

    async processFile(file: Buffer) {
        const rows = await xlsxReader(file);
        for (let i = 1; i < rows.length; i++) {
            console.log(rows[i]);
        }
    }

    async parseAll() {
        const file = fs.readFileSync('sample.xlsx');
        await this.processFile(file);
    }
}

export default ApproRxDetailsParser;