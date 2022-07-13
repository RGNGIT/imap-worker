import p from 'puppeteer';
import config from '../config';

export default async (email, page : p.Page, browser : p.Browser, dir : string) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: `${"./temp"}/${dir}`
        });
        await page.waitForSelector('#credentials-email');
        const credEmail = await page.$<HTMLInputElement>('#credentials-email');
        const credPassword = await page.$<HTMLInputElement>('#credentials-password');
        const confirmBtn = await page.$<HTMLButtonElement>('#start-button');
        await credEmail.type('attachmentmonitoring@lucenthealth.com');
        await credPassword.type('gV2xgM7xkN0xmH8@');
        await confirmBtn.click();
        // TBA
        return browser;
    } catch (e) {
        console.log(`Error while processing ApproRx mail (case2). Email from ${
            email.from[0]
        }. Date: ${
            email.date[0]
        }. MessageID: ${
            email['message-id'][0]
        }. Code: ${e}`);
        return null;
    }
}
