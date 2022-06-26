import {seq} from '../db';

export default async (filename, author, statusKey) => {
    await seq.query(`INSERT INTO pbm.files (filename, author, status_id) VALUES ('${filename}', '${author}', ${statusKey});`);
}