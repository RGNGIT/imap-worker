require('dotenv').config();

const {
    IMAP_USER,
    IMAP_PASSWORD,
    IMAP_HOST,
    IMAP_PORT,
    IMAP_TLS,
    FILE_PATH,
    CRON_TIME,
    DB_PAYMENTS_NAME,
    DB_PAYMENTS_HOST,
    DB_PAYMENTS_SCHEMA,
    DB_PAYMENTS_USERNAME,
    DB_PAYMENTS_PASSWORD,
    S3_BUCKET
} = process.env;

const compressedExts = ['zip'];
const skipMimes = ['image'];

export default {
    sequelizeConfig: {
        database: DB_PAYMENTS_NAME,
        host: DB_PAYMENTS_HOST,
        dbSchema: DB_PAYMENTS_SCHEMA,
        username: DB_PAYMENTS_USERNAME,
        password: DB_PAYMENTS_PASSWORD
    },
    s3: {
        s3Bucket: S3_BUCKET
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
