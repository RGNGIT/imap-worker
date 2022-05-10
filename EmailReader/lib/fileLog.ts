import {seq} from '../db';

export default async (filename, origin) => {
    await seq.query(`INSERT INTO pbm.files (date, filename, origin) VALUES (to_timestamp(${Date.now()}), '${filename}', '${origin}');`);
}