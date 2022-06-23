require('dotenv').config();

const {
    DB_PAYMENTS_NAME,
    DB_PAYMENTS_HOST,
    DB_PAYMENTS_SCHEMA,
    DB_PAYMENTS_USERNAME,
    DB_PAYMENTS_PASSWORD,
    S3_FOLDER,
    S3_BUCKET
} = process.env;

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
    }
}