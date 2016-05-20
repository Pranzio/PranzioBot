/// <reference path="../typings/index.d.ts" />
import fs = require('fs');

export default class PranzioLogger {

    private static FILE_NAME = 'prazio.csv';

    private file: fs.WriteStream;

    constructor() {
        this.file = fs.createWriteStream(__dirname + '/' + PranzioLogger.FILE_NAME, {
            'flags': 'w'
        });
        this.file.write('timestamp,caller_id,caller_username\n');
    }

    log(userID, username) {
        let date = new Date();
        let msg = `${date},${userID},${username}\n`;
        this.file.write(msg);

        // TODO: log in a second place
    }
}