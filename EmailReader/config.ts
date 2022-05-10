require('dotenv').config();

const {
    IMAP_USER,
    IMAP_PASSWORD,
    IMAP_HOST,
    IMAP_PORT,
    IMAP_TLS,
    FILE_PATH,
    CRON_TIME
} = process.env;

const compressedExts = ['zip'];
const skipMimes = ['image'];

export default {
    sequelizeConfig: {
        
    },
    s3: {
        s3Bucket: null
    },
    imap: {
        user: IMAP_USER,
        password: IMAP_PASSWORD,
        host: IMAP_HOST,
        tls: IMAP_TLS === 'true'
    },
    misc: {
        compressedExts: compressedExts,
        skipMimes: skipMimes,
        filePath: FILE_PATH,
        cronTime: CRON_TIME
    }
}
