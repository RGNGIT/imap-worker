import config from '../config';
import fs from 'fs';

const { misc: { maxorPassword, maxorLocalDir } } = config;

export default async (email, page, browser) => {
    await page.goto('./s3/page.html');
    await page.evaluate(() => {
        
    });
    return browser;
}