import approRxSecureReader from './approRxSecureReader';
import p from 'puppeteer';
import virtualScreen from './virtualScreen';

export default async (url, email) => {
    const vs = virtualScreen();
    const browser = await p.launch({
        headless: false,
        defaultViewport: null,
        // executablePath: '/usr/bin/google-chrome',
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox', '--start-fullscreen', /*'--display=' + vs._display*/]
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
    return await approRxSecureReader(email, page, browser);
}