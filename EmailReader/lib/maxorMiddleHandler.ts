import p from 'puppeteer';
import maxorExpiredSecureReader from './maxorExpiredSecureReader';
import virtualScreen from './virtualScreen';
import config from '../config';

const { misc: { maxorPassword, maxorLocalDir } } = config;

export default async(url, email) => {
    const vs = virtualScreen();
    const browser = await p.launch({
        headless: false,
        defaultViewport: null,
        // executablePath: '/usr/bin/google-chrome',
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox', '--start-fullscreen', /*'--display=' + vs._display*/]
        });
    const page = await browser.newPage();
    await page.goto(url);
    try {
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: maxorLocalDir });
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
        // console.log(`Error while processing Maxor mail. Email from ${email.from[0]}. Date: ${email.date[0]}. MessageID: ${email['message-id'][0]}`);
        return await maxorExpiredSecureReader(email, page, browser);;
    }
}