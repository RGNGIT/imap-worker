import p from 'puppeteer';
import config from '../config';
import fs from 'fs';

const { misc: { maxorPassword, maxorLocalDir } } = config;

export default async (url) => {
    const browser = await p.launch({ headless: true });
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: maxorLocalDir });
    await page.goto(url);
    await page.evaluate(() => {
        document.getElementById('dialog:password').setAttribute('value', 'pL3^769fokZ5Lx');
        document.getElementById('dialog:continueButton').click();
    });
    await page.waitForNavigation();
    await page.evaluate(() => {
        document.getElementById('inbox:downloadZipButton').click();
    });
}