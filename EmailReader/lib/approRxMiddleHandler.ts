import approRxSecureReaderCase1 from './approRxSecureReaderCase1';
import approRxSecureReaderCase2 from './approRxSecureReaderCase2';
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
    const cases = [approRxSecureReaderCase1, approRxSecureReaderCase2];
    for(const currentCase of cases) {
        const runningCase = await currentCase(email, page, browser, dir);
        if(runningCase) {
            return runningCase;
        } else {
            continue;
        }
    }
    return browser;
}