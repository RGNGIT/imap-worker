import p from 'puppeteer';
import config from '../config';

const {
    misc: {
        tempLocalDir,
        approrx2Password
    }, imap: {
        user
    }
} = config;

export default async (email, page : p.Page, browser : p.Browser, dir : string) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: `${tempLocalDir}/${dir}`
        });
        await page.waitForSelector('[id="credentials-email"]');
        const credEmail = await page.$<HTMLInputElement>('[id="credentials-email"]');
        const credPassword = await page.$<HTMLInputElement>('[id="credentials-password"]');
        const confirmBtn = await page.$<HTMLButtonElement>('[id="start-button"]');
        await credEmail.type(user);
        await credPassword.type(approrx2Password);
        await confirmBtn.click();
        // await page.waitForSelector('[tabindex="-1"]');
        // await page.waitForNavigation({waitUntil: 'domcontentloaded'});
        await page.waitForTimeout(10000);
        await page.evaluate(() => {
            document.querySelectorAll('button')[0].click();
        });
        return browser;
    } catch (e) {
        console.log(`Error while processing ApproRx mail (case2). Email from ${
            email.from[0]
        }. Date: ${
            email.date[0]
        }. MessageID: ${
            email['message-id'][0]
        }. Code: ${e}`);
        await browser.close();
        return null;
    }
}
