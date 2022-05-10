import {seq} from '../db';

export default async(filename, from) => {
    console.log(from);
    // await seq.query(`INSERT INTO files (date, filename, from) VALUES (to_timestamp(${Date.now()}), '${filename}', '${from}');`);
}