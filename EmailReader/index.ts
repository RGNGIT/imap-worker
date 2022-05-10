import {CronJob} from 'cron';
import ImapInstanse from "./imap";
import ImapProcessor from "./lib/imapProcessor";
import config from './config';

const {misc: {cronTime}} = config;

const job = new CronJob(cronTime, () => {
    const imap = ImapInstanse;
    imap.once('ready', () => {
        ImapProcessor(imap);
        console.log("Successfully set up IMAP!");
    });
    imap.once('error', function (err) {
        console.log(`Server Error:- ${err}`);
    });
    imap.once('end', function () {
        console.log('Connection terminated.');
    });
    imap.connect();
});

job.start();
