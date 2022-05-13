import {seq} from '../db';

export default async (filename, prvdrname, prvdremail) => {
    await seq.query(`INSERT INTO pbm.files (filename, prvdrname, prvdremail) VALUES ('${filename}', '${prvdrname}', '${prvdremail}');`);
}