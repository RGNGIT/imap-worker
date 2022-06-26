import FileProcessor from './fileProcessor';
import maxorMiddleHandler from './maxorMiddleHandler';
import config from '../config';
import fs from 'fs';

const { misc: { maxorPassword, tempLocalDir } } = config;

class MaxorManager {

    constructor(dir) {
        this.dir = dir;
        this.path1 = `${"./temp"}/${dir}/Lucent Health.zip`;
        this.path2 = `${"./temp"}/${dir}/Lucent Health Invoices.zip`;
    }

    path1;
    path2;
    dir;
    browser;
    
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
    
    async path1Writer(email) {
        if(await this.waitFile(this.path1)) {
            const fileProcessor = new FileProcessor();
            const readStream = fs.createReadStream(this.path1);
            await fileProcessor.writeToMaxor(readStream, this.dir, email);
            fs.unlinkSync(this.path1);
            await this.browser.close();
            return;
        }
    }
    
    async path2Writer(email) {
        if(await this.waitFile(this.path2)) {
            const fileProcessor = new FileProcessor();
            const readStream = fs.createReadStream(this.path2);
            await fileProcessor.writeToMaxor(readStream, this.dir, email);
            fs.unlinkSync(this.path2);
            await this.browser.close();
            return;
        }
    }
    
    async process(buffer, email) {
        const stringifiedMail = buffer;
        const splitMail = stringifiedMail.split('\n');
        let url;
        for(let i = 0; i < splitMail.length; i++) {
            if(splitMail[i].includes('Click here')) {
                url = this.fixUrl(splitMail[i], splitMail[i + 1]);
                break;
            }
        }
        this.browser = await maxorMiddleHandler(url, email, this.dir);
        await this.path1Writer(email);
        // await Promise.race([this.path1Writer, this.path2Writer]);
    }

}

export default MaxorManager;