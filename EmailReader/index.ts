import {CronJob} from 'cron';
import ImapInstanse from "./imap";
import ImapProcessor from "./lib/imapProcessor";
import config from './config';
import fs from 'fs';

const {misc: {cronTime}} = config;
let isJobRunning = false;

const job = new CronJob(cronTime, () => {
    if (isJobRunning) {
        console.log('Previous job is currently running...');
        return;
    } else {
        isJobRunning = true;
    }
    if(!fs.existsSync('temp')) {
        fs.mkdirSync('./temp');
    } else {
        fs.rmSync('./temp', {recursive: true});
        fs.mkdirSync('./temp');
    }
    const imap = ImapInstanse;
    imap.once('ready', () => {
        ImapProcessor(imap);
        console.log("Successfully set up IMAP!");
    });
    imap.once('error', (err) => {
        console.log(`Server Error: ${err}`);
        isJobRunning = false;
    });
    imap.once('end', () => {
        console.log('Connection terminated.');
        isJobRunning = false;
    });
    imap.connect();
});

job.start();