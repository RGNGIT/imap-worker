import {seq} from '../db';

export default async (filename, origin) => {
    await seq.query(`INSERT INTO pbm.files (filename, origin) VALUES ('${filename}', '${origin}');`);
}