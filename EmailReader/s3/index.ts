import {
    S3Client,
    ListObjectsCommand,
    GetObjectCommand,
    PutObjectCommand,
    CopyObjectCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3'
import {Readable} from 'stream';
import config from '../config';

const {s3: {
        s3Bucket
    }} = config;

export default class FileStore {
    _client : S3Client;
    constructor() {
        this._client = new S3Client({region: 'us-east-1'});
    }

    async listObjects(prefix? : string): Promise < Array < {
        Key?: string,
        Size?: number
    } >> {
        try {
            const command = new ListObjectsCommand({Bucket: s3Bucket, Prefix: prefix});

            const {Contents: data} = await this._client.send(command);

            return data;
        } catch (e) {
            console.log(`S3 error occured. Code: ${e}`);
        }
    }

    async getFile(key : string): Promise < Readable > {
        try {
            const command = new GetObjectCommand({Bucket: s3Bucket, Key: key});

            const {Body: data} = await this._client.send(command);

            if (data instanceof Readable) {
                return data;
            }
            // todo: ReadableStream and Blob

            return null;
        } catch (e) {
            console.log(`S3 error occured. Code: ${e}`);
        }
    }

    async moveFile(key : string, destinationKey : string, deleteOriginalFile : boolean = true) {
        try {
            const copyCommand = new CopyObjectCommand({Bucket: s3Bucket, CopySource: `${s3Bucket}/${key}`, Key: destinationKey});

            await this._client.send(copyCommand);

            if (deleteOriginalFile) {
                const deleteCommand = new DeleteObjectCommand({Bucket: s3Bucket, Key: key});

                await this._client.send(deleteCommand);
            }
        } catch (e) {
            console.log(`S3 error occured. Code: ${e}`);
        }
    }

    async putData(key : string, data : Readable | Buffer) {
        try {
            const command = new PutObjectCommand({Bucket: s3Bucket, Key: key, Body: data})

            await this._client.send(command);
        } catch (e) {
            console.log(`S3 error occured. Code: ${e}`);
        }
    }

    async putArrayData(key : string, data : Array < Buffer >) {
        try {
            let stream: Readable;
            stream._read = () => {
                data.forEach(item => stream.push(item))
                stream.push(null)
            }

            await this.putData(key, stream);

            stream.destroy();
        } catch (e) {
            console.log(`S3 error occured. Code: ${e}`);
        }
    }
}
