import p from 'puppeteer';
import config from '../config';

const {
    misc: {
        tempLocalDir,
        approrxPassword
    }
} = config;

export default async (email, page : p.Page, browser : p.Browser, dir : string) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: `${"./temp"}/${dir}`
        });
        const passwordField = await page.$<HTMLInputElement>('[name="password"]');
        await passwordField.type(approrxPassword);
        const loginBtn = await page.$<HTMLInputElement>('[name="cmd_login"]');
        await loginBtn.click();
        const hrefs = await page.$$<HTMLButtonElement>('a');
        await hrefs[hrefs.length - 2].click();
        return browser;
    } catch (e) {
        console.log(`Error while processing ApproRx mail (case1). Email from ${
            email.from[0]
        }. Date: ${
            email.date[0]
        }. MessageID: ${
            email['message-id'][0]
        }. Code: ${e}`);
        return null;
    }
}
