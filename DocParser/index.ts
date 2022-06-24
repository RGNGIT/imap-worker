import ApproRxDetailsParser from "./lib/approRxDetailsParser";
import fs from 'fs';

const start = async () => {
    if(!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp');
    } else {
        fs.rmSync('./temp', {recursive: true});
        fs.mkdirSync('./temp');
    }
    await new ApproRxDetailsParser().parseAll();
}

start();