import FileProcessor from './fileProcessor';
import maxorMiddleHandler from './maxorMiddleHandler';
import config from '../config';
import fs from 'fs';

const { misc: { maxorPassword, maxorLocalDir } } = config;

class MaxorManager {

    constructor(dir) {
        this.dir = dir;
        this.path1 = `${maxorLocalDir}/${dir}/Lucent Health.zip`;
        this.path2 = `${maxorLocalDir}/${dir}/Lucent Health Invoices.zip`;
    }

    path1;
    path2;
    dir;
    
    delay = time => new Promise(res => setTimeout(res, time));
    
    async waitFile(filename) {
        return new Promise(async (resolve, reject) => {
            if (!fs.existsSync(filename)) {
                await this.delay(3000);
                await this.waitFile(filename);
                resolve(true);
            } else {
                resolve(true);
            }
        });
    }
    
    fixUrl(line1, line2) {
        const formattedLine1 = line1.split('<')[1];
        const formattedLine2 = line2.split('>')[0];
        const url1 = formattedLine1.slice(0, formattedLine1.length - 2); 
        const url = url1 + formattedLine2;
        const newUrl = url.replace(/=3D/g, '=');
        return newUrl;
    }
    
    async path1Writer() {
        if(await this.waitFile(this.path1)) {
            const fileProcessor = new FileProcessor();
            const readStream = fs.createReadStream(this.path1);
            await fileProcessor.writeToMaxor(readStream);
            fs.unlinkSync(this.path1);
            return;
        }
    }
    
    async path2Writer() {
        if(await this.waitFile(this.path2)) {
            const fileProcessor = new FileProcessor();
            const readStream = fs.createReadStream(this.path2);
            await fileProcessor.writeToMaxor(readStream);
            fs.unlinkSync(this.path2);
            return;
        }
    }
    
    async process(buffer, email) {
        if (!fs.existsSync(`${maxorLocalDir}/${this.dir}`)) {
            fs.mkdirSync(`${maxorLocalDir}/${this.dir}`);
        }
        const stringifiedMail = buffer;
        const splitMail = stringifiedMail.split('\n');
        let url;
        for(let i = 0; i < splitMail.length; i++) {
            if(splitMail[i].includes('Click here')) {
                url = this.fixUrl(splitMail[i], splitMail[i + 1]);
                break;
            }
        }
        const browser = await maxorMiddleHandler(url, email, this.dir);
        await this.path1Writer();
        // await Promise.race([this.path1Writer, this.path2Writer]);
        // await browser.close();
    }

}

export default MaxorManager;