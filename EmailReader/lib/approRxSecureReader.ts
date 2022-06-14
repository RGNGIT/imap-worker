import p from 'puppeteer';
import config from '../config';

const { misc: { approrxLocalDir, approrxPassword } } = config;

export default async (email, page, browser) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: approrxLocalDir });
        await page.evaluate(() => {
            document.getElementsByName('password')[0].setAttribute('value', 'Lucent2022');
            document.getElementsByName('cmd_login')[0].click();
        });
        await page.waitForNavigation();
        await page.evaluate(() => {
            const hrefs = document.querySelectorAll('a');
            hrefs[hrefs.length - 2].click();
        });
        return browser;
    } catch (e) {
        console.log(`Error while processing ApproRx mail. Email from ${email.from[0]}. Date: ${email.date[0]}. MessageID: ${email['message-id'][0]}`);
        return browser;
    }
}