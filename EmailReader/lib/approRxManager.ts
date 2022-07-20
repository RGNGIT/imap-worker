import approRxMiddleHandler from "./approRxMiddleHandler";
import config from "../config";
import fs from 'fs';
import FileProcessor from './fileProcessor';

const { misc: { tempLocalDir } } = config;

class ApproRxManager {

    constructor(dir) {
        this.dir = dir;
        this.path = `${tempLocalDir}/${dir}/`;
    }

    private dynPathIndex;
    private path;
    private dir;

    private zipNames = ['all.zip', 'Files.zip'];

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

    fixUrlCase1(line1, line2, line3) {
        const formattedLine1 = line1.split('<')[1];
        const formattedLine3 = line3.split('>')[0];
        const url1 = formattedLine1.slice(0, formattedLine1.length - 2);
        const url2 = line2.slice(0, line2.length - 2)
        const url = url1 + url2 + formattedLine3;
        const newUrl = url.replace(/=3D/g, '=');
        return newUrl;
    }

    fixUrlCase2(line1) {
        return line1;
    }

    async process(buffer, email) {
        if (!fs.existsSync(`${tempLocalDir}/${this.dir}`)) {
            fs.mkdirSync(`${tempLocalDir}/${this.dir}`);
        }
        const stringifiedMail = buffer;
        const splitMail = stringifiedMail.split('\n');
        let url;
        for (let i = 0; i < splitMail.length; i++) {
            if (splitMail[i].includes('View Message')) {
                this.dynPathIndex = 0;
                url = this.fixUrlCase1(splitMail[i], splitMail[i + 1], splitMail[i + 2]);
                break;
            }
            if(splitMail[i].includes('approrx.sharefile.com')) {
                this.dynPathIndex = 1;
                url = this.fixUrlCase2(splitMail[i]);
                break;
            }
        }
        const browser = await approRxMiddleHandler(url, email, this.dir);
        if(this.dynPathIndex) {
            const fullPath = this.path + this.zipNames[this.dynPathIndex];
            if (await this.waitFile(fullPath).catch(err => {
                console.log(`ApproRx file waiter has failed. Code: ${err}`);
            })) {
                const fileProcessor = new FileProcessor();
                const readStream = fs.createReadStream(fullPath);
                await fileProcessor.writeToApproRx(readStream, this.dir, email);
                fs.unlinkSync(fullPath);
                await browser.close();
            }
        } else {
            console.log('ApproRx file index has not been set. Probably problem with email');
        }
    }
}

export default ApproRxManager;