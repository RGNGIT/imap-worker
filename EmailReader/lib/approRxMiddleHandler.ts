import approRxSecureReader from './approRxSecureReader';
import p from 'puppeteer';
import instanses from './instanse';

export default async (url, email, dir) => {
    const browser = await p.launch({
        headless: false,
        defaultViewport: null,
        // executablePath: '/usr/bin/google-chrome',
        // args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox', '--start-fullscreen', '--display=' + instanses.virtualCanvas._display]
        });
    const page = await browser.newPage();
    await page.goto(url);
    /*
    await page.evaluate(async () => {
        const checker = document.getElementsByName('water').length > 0 ? true : false;
        if(checker) {
            // If requres new password
        } else {
            // if not
        }
    });
    */
    return await approRxSecureReader(email, page, browser, dir);
}