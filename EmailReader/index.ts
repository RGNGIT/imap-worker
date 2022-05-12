import {CronJob} from 'cron';
import ImapInstanse from "./imap";
import ImapProcessor from "./lib/imapProcessor";
import config from './config';

const {misc: {cronTime}} = config;
let isJobRunning = false;

function start() {
    var onEnd = function (result) {
        if (result.error) {
          console.log(result.error)
          return
        }
        console.log("done")
        console.log(result.latestTime)
      }
       
      var downloadEmailAttachments = require('download-email-attachments');
      downloadEmailAttachments({
        // invalidChars: /[^A-Z]/g, //Regex of Characters that are invalid and will be replaced by X
        account: '"attachmentmonitoring@lucenthealth.com":pL3^769fokZ5Lx@outlook.office365.com:993', // all options and params besides account are optional
        directory: './files',
        timeout: 3000,
        log: {warn: console.warn, debug: console.info, error: console.log, info: console.info },
        since: '2015-01-12',
        // lastSyncIds: ['234', '234', '5345'], // ids already dowloaded and ignored, helpful because since is only supporting dates without time
        attachmentHandler: function (attachmentData, callback, errorCB) {
          console.log(attachmentData.att)
          callback()
        }
      }, onEnd)
}
/*
const job = new CronJob(cronTime, () => {
    if (isJobRunning) {
        console.log('Previous job is currently running...');
        return;
    } else {
        isJobRunning = true;
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
*/

start();