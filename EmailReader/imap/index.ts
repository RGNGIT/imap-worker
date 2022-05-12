import config from '../config';
const Imap = require('imap');

const {imap} = config;

const ImapInstanse = new Imap({
    ...imap, 
    port: 993,
    tlsOptions: {
        rejectUnauthorized: false
    }
})
.once('error', (err) => {
    console.log(`Source Server Error: ${err}`);
});

export default ImapInstanse;