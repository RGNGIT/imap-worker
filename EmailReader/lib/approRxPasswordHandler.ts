import p from 'puppeteer';
import approRxSecureReader from './approRxSecureReader';

export default async (url, email) => {
    const browser = await p.launch({ headless: false });
    const page = await browser.newPage();
    await page.evaluate(async () => {
        const checker = document.getElementsByName('water').length > 0 ? true : false;
        if(checker) {
            console.log('Checker')
        } else {
            const b = await approRxSecureReader(url, email, page, browser);
            b.close();
        }
    });
}