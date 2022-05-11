import {
    S3Client,
    ListObjectsCommand,
    GetObjectCommand,
    PutObjectCommand,
    CopyObjectCommand,
    DeleteObjectCommand
  } from '@aws-sdk/client-s3'
  import { Readable } from 'stream';
  import config from '../config';
  
  const {
    s3: {
      s3Bucket,
    }
  } = config;
  
  export default class FileStore {
    _client: S3Client;
    constructor() {
      this._client = new S3Client({});
    }
  
    async listObjects (prefix?: string): Promise<Array<{ Key?: string, Size?: number}>> {
      const command = new ListObjectsCommand({
        Bucket: s3Bucket,
        Prefix: prefix
      });
  
      const { Contents: data } = await this._client.send(command);
  
      return data;
    }
  
    async getFile (key: string): Promise<Readable> {
      const command = new GetObjectCommand({
        Bucket: s3Bucket,
        Key: key
      });
  
      const { Body: data } = await this._client.send(command);
  
      if (data instanceof Readable) {
        return data;
      }
      // todo: ReadableStream and Blob
  
      return null;
    }
  
    async moveFile (key: string, destinationKey: string, deleteOriginalFile: boolean = true) {
      const copyCommand = new CopyObjectCommand({
        Bucket: s3Bucket,
        CopySource: `${s3Bucket}/${key}`,
        Key: destinationKey
      });
  
      await this._client.send(copyCommand);
  
      if (deleteOriginalFile) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: s3Bucket,
          Key: key
        });
  
        await this._client.send(deleteCommand);
      }
    }
  
    async putData (key: string, data: Readable | Buffer) {
      const command = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        Body: data
    })
  
      await this._client.send(command);
    }
    
    async putArrayData (key: string, data: Array<Buffer>) {
      let stream : Readable;
      stream._read = () => {
        data.forEach(item => stream.push(item))
        stream.push(null)
      }
      
      await this.putData(key, stream);
  
      stream.destroy();
    }
}