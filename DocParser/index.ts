import ApproRxDetailsParser from "./lib/approRxDetailsParser";
import ApproRxSummaryParser from "./lib/approRxSummaryParser"
import fs from 'fs';

const start = async () => {
    if(!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp');
    } else {
        fs.rmSync('./temp', {recursive: true});
        fs.mkdirSync('./temp');
    }
    // await new ApproRxDetailsParser().parseAll();
    await new ApproRxSummaryParser().parseAll();
}

start();