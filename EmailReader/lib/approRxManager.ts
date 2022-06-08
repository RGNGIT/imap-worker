import approRxSecureReader from "./approRxSecureReader"
import config from "../config";
import fs from 'fs';
import FileProcessor from './fileProcessor';

const {misc: {approrxLocalDir}} = config;

const path = `${approrxLocalDir}/all.zip`;

const delay = time => new Promise(res => setTimeout(res, time));

async function waitFile(filename) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(filename)) {
            await delay(3000);
            await waitFile(filename);
            resolve(true);
        } else {
            resolve(true);
        }
    });
}

function fixUrl(line1, line2, line3) {
    const formattedLine1 = line1.split('<')[1];
    const formattedLine3 = line3.split('>')[0];
    const url1 = formattedLine1.slice(0, formattedLine1.length - 2);
    const url2 = line2.slice(0, line2.length - 2)
    const url = url1 + url2 + formattedLine3;
    const newUrl = url.replace(/=3D/g, '=');
    return newUrl;
}

export default async (buffer) => {
    const stringifiedMail = buffer;
    const splitMail = stringifiedMail.split('\n');
    let url;
    for(let i = 0; i < splitMail.length; i++) {
        if(splitMail[i].includes('View Message')) {
            url = fixUrl(splitMail[i], splitMail[i + 1], splitMail[i + 2]);
            break;
        }
    }
    await approRxSecureReader(url);
    if(await waitFile(path)) {
        const fileProcessor = new FileProcessor();
        const readStream = fs.createReadStream(path);
        await fileProcessor.writeToApproRx(readStream);
        // fs.unlinkSync(path);
    }
}