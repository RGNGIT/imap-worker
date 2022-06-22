import {seq} from '../db';

class DuplicateEmailsManager {
    async fetchDailyAuthors(): Promise<Array<string>> {
        const authors = seq.query('SELECT prvdrname, prvdremail FROM pbm.files WHERE date = ');
        return null;
    }
}

export default DuplicateEmailsManager;