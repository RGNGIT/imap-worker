import config from '../config';
import fs from 'fs';

const path = require("path");

const { misc: { maxorPassword, maxorLocalDir } } = config;

export default async (email, page, browser, dir) => {
    const absPath = path.resolve('./s3/page.html');
    await page.goto('file://' + absPath);
    await page.evaluate(() => {
        document.getElementsByName('submitButton')[0].click();
    });
    await page.waitForNavigation();
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: `${maxorLocalDir}/${dir}` });
    await page.evaluate(() => {
        document.getElementById('dialog:password').setAttribute('value', 'pL3^769fokZ5Lx');
        document.getElementById('dialog:continueButton').click();
    });
    await page.waitForNavigation();
    await page.evaluate(() => {
        try {
            document.getElementById('inbox:downloadZipButton').click();
        } catch {
            document.getElementById('readTB:downloadZipButton').click();
        }
    });
    return browser;
}