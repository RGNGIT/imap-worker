import FileProcessor from './fileProcessor';
import maxorMiddleHandler from './maxorMiddleHandler';
import config from '../config';
import fs from 'fs';

const { misc: { maxorPassword, maxorLocalDir } } = config;

const path1 = `${maxorLocalDir}/Lucent Health.zip`;
const path2 = `${maxorLocalDir}/Lucent Health Invoices.zip`;

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

function fixUrl(line1, line2) {
    const formattedLine1 = line1.split('<')[1];
    const formattedLine2 = line2.split('>')[0];
    const url1 = formattedLine1.slice(0, formattedLine1.length - 2); 
    const url = url1 + formattedLine2;
    const newUrl = url.replace(/=3D/g, '=');
    return newUrl;
}

export default async (buffer, email) => {
    const stringifiedMail = buffer;
    const splitMail = stringifiedMail.split('\n');
    let url;
    for(let i = 0; i < splitMail.length; i++) {
        if(splitMail[i].includes('Click here')) {
            url = fixUrl(splitMail[i], splitMail[i + 1]);
            break;
        }
    }
    const browser = await maxorMiddleHandler(url, email);
    if(await waitFile(path1 || path2)) {
        const fileProcessor = new FileProcessor();
        const readStream = fs.createReadStream(path1 || path2);
        await fileProcessor.writeToMaxor(readStream);
        fs.unlinkSync(path1 || path2);
        await browser.close();
    }
}