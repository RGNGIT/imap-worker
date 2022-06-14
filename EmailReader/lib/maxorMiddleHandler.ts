import p from 'puppeteer';
import maxorSecureReader from './maxorSecureReader';
import virtualScreen from './virtualScreen';

export default async(url, email) => {
    const vs = virtualScreen();
    const browser = await p.launch({
        headless: false,
        defaultViewport: null,
        args: ['--no-sandbox', '--start-fullscreen', '--display=' + vs._display]
        });
    const page = await browser.newPage();
    await page.goto(url);
    // TODO: Action if expired
    return await maxorSecureReader(email, page, browser);
}