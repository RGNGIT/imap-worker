require('dotenv').config();

const {
    IMAP_USER,
    IMAP_PASSWORD,
    IMAP_HOST,
    IMAP_PORT,
    IMAP_TLS
} = process.env;

export default {
    imap: {
        user: IMAP_USER,
        password: IMAP_PASSWORD,
        host: IMAP_HOST,
        tls: IMAP_TLS === 'true'
    }
}
