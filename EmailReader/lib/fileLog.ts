import {seq} from '../db';

export default async (filename, from, statusKey) => {
    await seq.query(`INSERT INTO pbm.files (filename, from, status_id) VALUES ('${filename}', '${from}', ${statusKey});`);
}