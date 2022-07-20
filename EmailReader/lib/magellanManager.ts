import fs from 'fs';
import FileProcessor from './fileProcessor';

class MagellanManager {

    constructor(dirDate) {
        this.dirDate = dirDate;
    }

    private dirDate;

    async process(attachment, email) {
        const fileProcessor = new FileProcessor();
        await fileProcessor.writeToMagellan(attachment, `${this.dirDate}$${email.messageId}`, email.from[0].address);
    }
    
}

export default MagellanManager;