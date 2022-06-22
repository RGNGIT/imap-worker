import SendingEmailsService from './sendingEmailsService';

export default class NotificationService {
    sendingEmailsService: SendingEmailsService;
    from: string;

    constructor(host: string, port: string, secure: string, username: string, password: string) {
        this.sendingEmailsService = new SendingEmailsService(host, Number(port), (secure === 'true'), username, password);
        this.from = username;
    }

    public async sendCorrectedNotification() {

    }

    public async sendUnprocessedEmailNotification() {

    }

    public async sendParsingErrorNotification() {
        
    }
       
}
