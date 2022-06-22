import p from 'puppeteer';
import maxorExpiredSecureReader from './maxorExpiredSecureReader';
import config from '../config';
import instanses from './instanse';

const { misc: { maxorPassword, tempLocalDir } } = config;

export default async(url, email, dir) => {
    const browser = await p.launch({
        headless: false,
        defaultViewport: null,
        executablePath: '/usr/bin/google-chrome',
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox', '--start-fullscreen', '--display=' + instanses.virtualCanvas._display]
        });
        const page = await browser.newPage();
    try {
        await page.goto(url);
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: `${tempLocalDir}/${dir}` });
        await page.evaluate(() => {
            document.getElementById('dialog:password').setAttribute('value', 'pL3^769fokZ5Lx');
            document.getElementById('dialog:continueButton').click();
        });
        await page.waitForNavigation();
        await page.evaluate(() => {
            document.getElementById('inbox:downloadZipButton').click();
        });
        return browser;
    } catch (e) {
        // If expired
        console.log(`Error while processing Maxor mail. Email from ${email.from[0]}. Date: ${email.date[0]}. MessageID: ${email['message-id'][0]}. Code: ${e}. Trying expired method...`);
        return await maxorExpiredSecureReader(email, page, browser, dir);;
    }
}