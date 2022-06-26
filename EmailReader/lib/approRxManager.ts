import approRxMiddleHandler from "./approRxMiddleHandler";
import config from "../config";
import fs from 'fs';
import FileProcessor from './fileProcessor';

const { misc: { tempLocalDir } } = config;

class ApproRxManager {

    constructor(dir) {
        this.dir = dir;
        this.path = `${'./temp'}/${dir}/all.zip`;
    }

    path;
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

    fixUrl(line1, line2, line3) {
        const formattedLine1 = line1.split('<')[1];
        const formattedLine3 = line3.split('>')[0];
        const url1 = formattedLine1.slice(0, formattedLine1.length - 2);
        const url2 = line2.slice(0, line2.length - 2)
        const url = url1 + url2 + formattedLine3;
        const newUrl = url.replace(/=3D/g, '=');
        return newUrl;
    }

    async process(buffer, email) {
        if (!fs.existsSync(`${"./temp"}/${this.dir}`)) {
            fs.mkdirSync(`${"./temp"}/${this.dir}`);
        }
        const stringifiedMail = buffer;
        const splitMail = stringifiedMail.split('\n');
        let url;
        for (let i = 0; i < splitMail.length; i++) {
            if (splitMail[i].includes('View Message')) {
                url = this.fixUrl(splitMail[i], splitMail[i + 1], splitMail[i + 2]);
                break;
            }
        }
        const browser = await approRxMiddleHandler(url, email, this.dir);
        if (await this.waitFile(this.path)) {
            const fileProcessor = new FileProcessor();
            const readStream = fs.createReadStream(this.path);
            await fileProcessor.writeToApproRx(readStream, this.dir, email);
            fs.unlinkSync(this.path);
            await browser.close();
        }
    }
}

export default ApproRxManager;