import config from '../config';
import p from 'puppeteer';
import fs from 'fs';

const path = require("path");

const {
    misc: {
        maxorPassword,
        tempLocalDir
    }
} = config;

export default async (email, page : p.Page, browser : p.Browser, dir : string) => {
    try {
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: `${tempLocalDir}/${dir}`
        });
        const absPath = path.resolve(`./${tempLocalDir}/${dir}/page.html`);
        await page.goto('file://' + absPath);
        const enterBtn = await page.$<HTMLButtonElement>('[name="submitButton"]');
        await enterBtn.click();
        await page.waitForTimeout(10000);
        const dialogPassword = await page.$<HTMLInputElement>('[id="dialog:password"]');
        const dialogBtn = await page.$<HTMLButtonElement>('[id="dialog:continueButton"]');
        await dialogPassword.type(maxorPassword);
        await dialogBtn.click();
        await page.waitForTimeout(10000);
        await page.evaluate(() => {
            (<HTMLButtonElement>document.getElementById('readTB:downloadZipButton')).click();
        });
        return browser;
    } catch (e) {
        console.log(`Error while processaing expired Maxor mail. Code: ${e}`);
        return e;
    }
}
