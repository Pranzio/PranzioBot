/// <reference path="../typings/index.d.ts" />
import TelegramBot = require('node-telegram-bot-api');
import MESSAGES from './messages';
import DB from './db';
import winston = require('winston');
require('winston-mongodb').MongoDB; // log on MongoDB

const TIMEZONE = 1;  //Italy = GMT+1

// helper function -> exit with error
function exit(msg) {
    console.error(msg);
    throw new Error(msg);
}

// check if it is pranzio time
function isPranzioTime() {

    // check if monday-friday
    let dt = new Date();
    if (dt.getDay() < 1 || dt.getDay() > 5) {
        return false;
    }

    // check if DST, True if yes
    let jan = new Date(dt.getFullYear(), 0, 1);
    let jul = new Date(dt.getFullYear(), 6, 1);
    let std = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    let dst = dt.getTimezoneOffset() < std;

    // get UTC hour and add timezone and dst time
    let hour = dt.getUTCHours();
    hour += dst ? (TIMEZONE + 1) : TIMEZONE;

    // return if it is pranzio time
    return hour > 11 && hour < 15;
}

// create the logger
function getLogger() {

    // environment
    const MONGODB_URI = process.env.MONGODB_URI;

    // where to log
    let transports = [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs.log' })
    ];

    // if MongoDB available -> log there
    if (typeof MONGODB_URI !== 'undefined') {
        transports.push(new (winston.transports['MongoDB'])({ db: MONGODB_URI }));    // HACK: missing d.ts
    } else {
        console.log('MONGODB_URI not provided... skip log on MongoDB');
    }

    // create logger   
    let logger = new (winston.Logger)({
        level: 'verbose',
        transports: transports
    });

    return logger;
}

// entry point
async function main() {

    // read environment variables
    const TOKEN = process.env.TOKEN;
    const PORT = process.env.PORT;
    const WEBHOOK = process.env.WEBHOOK;

    // check parameters
    if (!TOKEN) {
        exit('Please add a TOKEN env variable with the TelegramBot token');
    }
    if (!WEBHOOK) {
        exit('Please add a WEBHOOK...');
    }

    // logger
    let logger = getLogger();

    // open db
    let db = new DB();

    // create Bot
    let port = PORT || 8000;
    let host = '0.0.0.0';
    let bot = new TelegramBot(TOKEN, {
        webHook: { port, host }
    });
    bot.setWebHook(WEBHOOK + '/bot' + TOKEN);

    // get bot name
    let me = await bot.getMe();
    let name = '@' + me.username;

    // reply to text messages
    bot.on('text', async function (msg) {

        // TODO: build regex to remove @PranzioBot at the end of the commands
        // parse command (eg. /start@PranzioBot => /start)
        let args = msg.text.trim().split(' ');
        let command = args[0].replace(name, '');
        args.shift();

        // get info from the message
        let chatID = msg.chat.id;
        let userID = msg.from.id;
        let username = msg.from.username;

        // handle the case where the user has no username set
        if (typeof username === 'undefined' || username === '') {
            username = msg.from.first_name;
        }

        // log
        logger.info(command, `@${username} called ${command}`, { userID, username, command });

        // reply
        switch (command) {

            // show the welcome message
            case '/start':
                // I need to save the chatID and not the userID, since I will
                // need the chatID to send them the pranzio-signal
                db.addUser(chatID);
                bot.sendMessage(chatID, MESSAGES.WELCOME);
                break;

            // print the help message
            case '/help':
                bot.sendMessage(chatID, MESSAGES.HELP);
                break;

            // activate notifications
            case '/on':
                db.addUser(chatID);
                bot.sendMessage(chatID, MESSAGES.SET_ON);
                break;

            // deactivate notifications
            case '/off':
                db.removeUser(chatID);
                bot.sendMessage(chatID, MESSAGES.SET_OFF);
                break;

            // send the pranzio-signal
            case '/pranzio':

                // check if pranzio time
                let pranzioTime = isPranzioTime();

                // pranzio time -> send message
                if (pranzioTime) {
                    let subscribers = await db.getUsers();
                    let custom_msg = args.join(" ");

                    // send to subscribers
                    subscribers.forEach(user => {
                        let msg = (custom_msg != "") ? MESSAGES.PRANZIO_MSG + custom_msg : MESSAGES.PRANZIO_NOMSG;
                        bot.sendMessage(user, msg);
                    });

                    // send back to caller
                    bot.sendMessage(chatID, MESSAGES.PRANZIO_CALLED);
                }

                // no pranzio time =(
                else {
                    bot.sendMessage(chatID, MESSAGES.PRANZIO_CLOSED);
                }

                break;

            default:
                if (new RegExp('^\/([^@])*((' + name + ')\s*.*)?$').test(command)) {
                    bot.sendMessage(chatID, MESSAGES.ERR_UNKNOW_COMMAND);
                }
        }
    });

    // running =D
    console.info(`
${name} running:
    Internal address: ${host}:${port}
    External address: ${WEBHOOK}
    
Press Ctrl+C to stop the bot...
`);
}

// execute bot
main();
process.on('unhandledRejection', function (reason, p) {
    throw new Error(reason);
});
