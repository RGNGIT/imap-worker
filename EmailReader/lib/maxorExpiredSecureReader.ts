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
        const absPath = path.resolve(`./${"./temp"}/${dir}/page.html`);
        await page.goto('file://' + absPath);
        const enterBtn = await page.$<HTMLButtonElement>('[name="submitButton"]');
        await enterBtn.click();
        await page.waitForSelector('#dialog:password');
        const dialogPassword = await page.$<HTMLInputElement>('#dialog:password');
        const dialogBtn = await page.$<HTMLButtonElement>('#dialog:continueButton');
        await dialogPassword.type(maxorPassword);
        await dialogBtn.click();
        await page.waitForSelector('#readTB:downloadZipButton');
        const downloadBtn = await page.$<HTMLButtonElement>('#readTB:downloadZipButton');
        await downloadBtn.click();
        return browser;
    } catch (e) {
        console.log(`Error while processaing expired Maxor mail. Code: ${e}`);
        return e;
    }
}
