import config from '../config';
import fs from 'fs';

const { misc: { maxorPassword, maxorLocalDir } } = config;

export default async (email, page, browser) => {
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
        console.log(`Error while processing Maxor mail. Email from ${email.from[0]}. Date: ${email.date[0]}. MessageID: ${email['message-id'][0]}`);
        return browser;
    }
}